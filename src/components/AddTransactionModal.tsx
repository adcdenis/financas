import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { addDays, addMonths, addWeeks, format, parseISO } from "date-fns";
import type { Account, Category, Transaction } from "../types";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Modal } from "./ui/Modal";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";
import { Checkbox } from "./ui/Checkbox";
import { parseCurrency, toDateInputValue } from "../lib/utils";
import { useCreateTransactions, useUpdateTransaction } from "../features/transactions/transactionsHooks";
import { useCreateCategory } from "../features/categories/categoriesHooks";
import { supabase } from "../lib/supabaseClient";

const transactionSchema = z
  .object({
    date: z.string().min(1),
    description: z.string().min(2, "Informe uma descricao"),
    type: z.enum(["expense", "income", "transfer"]),
    category_id: z.string().optional(),
    account_id: z.string().optional(),
    account_from_id: z.string().optional(),
    account_to_id: z.string().optional(),
    amount: z.string().min(1),
    note: z.string().optional(),
    cleared: z.boolean().optional(),
    reminder: z.enum(["none", "email"]).default("none"),
  })
  .superRefine((values, ctx) => {
    if (values.type === "transfer") {
      if (!values.account_from_id || !values.account_to_id) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selecione as contas de origem e destino" });
      }
      return;
    }

    if (!values.account_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selecione a conta" });
    }
    if (!values.category_id) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selecione a categoria" });
    }
  });

type TransactionForm = z.infer<typeof transactionSchema>;

type RepeatMode = "none" | "installment" | "advanced";

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  transaction?: Transaction | null;
}

type EditScope = "only" | "from_here" | "from_first";

const AddTransactionModal = ({ open, onClose, accounts, categories, transaction }: AddTransactionModalProps) => {
  const queryClient = useQueryClient();
  const createTransactions = useCreateTransactions();
  const updateTransaction = useUpdateTransaction();
  const createCategory = useCreateCategory();
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("none");
  const [editScope, setEditScope] = useState<EditScope>("only");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<Partial<Transaction> | null>(null);
  const [installmentStart, setInstallmentStart] = useState(1);
  const [installmentTotal, setInstallmentTotal] = useState(2);
  const [advancedInterval, setAdvancedInterval] = useState(1);
  const [advancedUnit, setAdvancedUnit] = useState("month");
  const [advancedOccurrences, setAdvancedOccurrences] = useState(6);
  const [advancedIndefinite, setAdvancedIndefinite] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryParent, setNewCategoryParent] = useState<string | null>(null);
  const [newCategoryType, setNewCategoryType] = useState<"expense" | "income" | "both">("expense");

  const form = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: toDateInputValue(new Date()),
      description: "",
      type: "expense",
      amount: "",
      note: "",
      cleared: false,
      reminder: "none",
    },
  });

  const typeValue = form.watch("type");
  const isEditing = Boolean(transaction?.id);
  const hasInstallments = Boolean(transaction?.installment_group_id);
  const hasRecurrence = Boolean(transaction?.recurrence_rule);
  const isInstallmentEditable = isEditing && hasInstallments;
  const currentInstallmentIndex = transaction?.installment_index ?? 1;

  const shiftByUnit = (date: Date, step: number, unit: string) => {
    if (unit === "week") return addWeeks(date, step);
    if (unit === "day") return addDays(date, step);
    return addMonths(date, step);
  };

  const buildRecurrenceDates = (startDate: Date, count: number, interval: number, unit: string) => {
    const dates: string[] = [];
    for (let index = 0; index < count; index += 1) {
      const offset = index * Math.max(1, interval);
      const nextDate = shiftByUnit(startDate, offset, unit);
      dates.push(format(nextDate, "yyyy-MM-dd"));
    }
    return dates;
  };

  const toDateString = (date: Date) => format(date, "yyyy-MM-dd");

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ label: category.name, value: category.id })),
    [categories]
  );

  useEffect(() => {
    if (!open) return;
    if (transaction) {
      const amountLabel = transaction.amount.toFixed(2).replace(".", ",");
      form.reset({
        date: transaction.date.slice(0, 10),
        description: transaction.description,
        type: transaction.type,
        category_id: transaction.category_id ?? "",
        account_id: transaction.account_id ?? "",
        account_from_id: transaction.account_from_id ?? "",
        account_to_id: transaction.account_to_id ?? "",
        amount: amountLabel,
        note: transaction.note ?? "",
        cleared: transaction.cleared,
        reminder: "none",
      });
      if (transaction.installment_group_id) {
        setRepeatMode("installment");
        setInstallmentStart(transaction.installment_index ?? 1);
        setInstallmentTotal(transaction.installment_total ?? 1);
      } else if (transaction.recurrence_rule) {
        const rule = transaction.recurrence_rule as {
          interval?: number;
          unit?: string;
          occurrences?: number | null;
          indefinite?: boolean;
        };
        setRepeatMode("advanced");
        setAdvancedInterval(rule.interval ?? 1);
        setAdvancedUnit(rule.unit ?? "month");
        setAdvancedOccurrences(rule.occurrences ?? 6);
        setAdvancedIndefinite(Boolean(rule.indefinite));
      } else {
        setRepeatMode("none");
      }
      setCreatingCategory(false);
      setNewCategoryName("");
      setNewCategoryParent(null);
      setNewCategoryType("expense");
    } else {
      form.reset({
        date: toDateInputValue(new Date()),
        description: "",
        type: "expense",
        amount: "",
        note: "",
        cleared: false,
        reminder: "none",
      });
      setRepeatMode("none");
    }
  }, [open, transaction, form]);

  useEffect(() => {
    if (open) return;
    setConfirmOpen(false);
    setPendingPayload(null);
    setEditScope("only");
  }, [open]);

  const applyEdit = async (updatePayload: Partial<Transaction>) => {
    if (!transaction) return;

    const rule =
      repeatMode === "advanced"
        ? {
            interval: advancedInterval,
            unit: advancedUnit,
            indefinite: advancedIndefinite,
            occurrences: advancedIndefinite ? null : advancedOccurrences,
          }
        : transaction.recurrence_rule;
    const count = advancedIndefinite ? 12 : Math.max(1, advancedOccurrences);
    const currentDate = transaction.date.slice(0, 10);
    const newDate = updatePayload.date ?? currentDate;
    const recurrenceGroupId = transaction.recurrence_group_id;
    const newRecurrenceGroupId = recurrenceGroupId ?? crypto.randomUUID();

    if (editScope !== "only" && (hasInstallments || hasRecurrence)) {
      if (hasInstallments && transaction.installment_group_id) {
        const newTotalRaw = Math.max(1, installmentTotal);
        const newTotal =
          editScope === "from_here" ? Math.max(newTotalRaw, currentInstallmentIndex) : newTotalRaw;
        const firstDate = addMonths(parseISO(newDate), -(currentInstallmentIndex - 1));

        let query = supabase
          .from("transactions")
          .select("id,date,installment_index")
          .eq("installment_group_id", transaction.installment_group_id);

        if (editScope === "from_here") {
          query = query.gte("installment_index", currentInstallmentIndex);
        }

        const { data, error } = await query;
        if (error) throw error;

        const rows = data ?? [];
        const existingIndices = new Set(rows.map((row) => row.installment_index ?? 0));
        const targetIndices: number[] = [];

        if (editScope === "from_first") {
          for (let index = 1; index <= newTotal; index += 1) targetIndices.push(index);
        } else if (editScope === "from_here") {
          for (let index = currentInstallmentIndex; index <= newTotal; index += 1) targetIndices.push(index);
        } else {
          targetIndices.push(currentInstallmentIndex);
        }

        const rowsToUpdate = rows.filter((row) => targetIndices.includes(row.installment_index ?? 0));
        const rowsToDelete =
          editScope === "from_first"
            ? rows.filter((row) => (row.installment_index ?? 0) > newTotal)
            : editScope === "from_here"
              ? rows.filter(
                  (row) => (row.installment_index ?? 0) >= currentInstallmentIndex && (row.installment_index ?? 0) > newTotal
                )
              : [];

        for (const row of rowsToUpdate) {
          const index = row.installment_index ?? currentInstallmentIndex;
          const nextDate = toDateString(addMonths(firstDate, index - 1));
          const { error: updateError } = await supabase
            .from("transactions")
            .update({ ...updatePayload, date: nextDate, installment_total: newTotal })
            .eq("id", row.id);
          if (updateError) throw updateError;
        }

        if (rowsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from("transactions")
            .delete()
            .in(
              "id",
              rowsToDelete.map((row) => row.id)
            );
          if (deleteError) throw deleteError;
        }

        const rowsToInsert = targetIndices.filter((index) => !existingIndices.has(index));
        if (rowsToInsert.length > 0) {
          const payloadBase = {
            ...updatePayload,
            installment_group_id: transaction.installment_group_id,
            installment_total: newTotal,
            recurrence_rule: null,
            recurrence_group_id: null,
          };
          const inserts = rowsToInsert.map((index) => ({
            ...payloadBase,
            date: toDateString(addMonths(firstDate, index - 1)),
            installment_index: index,
          }));
          const { error: insertError } = await supabase.from("transactions").insert(inserts);
          if (insertError) throw insertError;
        }
        await queryClient.invalidateQueries({ queryKey: ["transactions"] });
        return;
      }

      if ((hasRecurrence || repeatMode === "advanced") && recurrenceGroupId) {
        const { data, error } = await supabase
          .from("transactions")
          .select("id,date")
          .eq("recurrence_group_id", recurrenceGroupId)
          .order("date", { ascending: true });
        if (error) throw error;

        const rows = data ?? [];
        const occurrenceIndex = Math.max(
          0,
          rows.findIndex((row) => row.id === transaction.id)
        );
        const startDate =
          editScope === "from_first"
            ? shiftByUnit(parseISO(newDate), -occurrenceIndex * Math.max(1, advancedInterval), advancedUnit)
            : parseISO(newDate);

        const dates = buildRecurrenceDates(startDate, count, advancedInterval, advancedUnit);

        if (editScope === "from_first") {
          const { error: deleteError } = await supabase
            .from("transactions")
            .delete()
            .eq("recurrence_group_id", recurrenceGroupId);
          if (deleteError) throw deleteError;
        } else {
          const { error: deleteError } = await supabase
            .from("transactions")
            .delete()
            .eq("recurrence_group_id", recurrenceGroupId)
            .gte("date", currentDate);
          if (deleteError) throw deleteError;
        }

        const inserts = dates.map((date) => ({
          ...updatePayload,
          date,
          recurrence_group_id: recurrenceGroupId,
          recurrence_rule: rule,
        }));
        const { error: insertError } = await supabase.from("transactions").insert(inserts);
        if (insertError) throw insertError;

        await queryClient.invalidateQueries({ queryKey: ["transactions"] });
        return;
      }
    }

    if (repeatMode === "advanced" && !hasRecurrence) {
      await updateTransaction.mutateAsync({
        id: transaction.id,
        ...updatePayload,
        recurrence_group_id: newRecurrenceGroupId,
        recurrence_rule: rule,
      });

      const dates = buildRecurrenceDates(parseISO(newDate), count, advancedInterval, advancedUnit);
      const futureDates = dates.slice(1);
      if (futureDates.length > 0) {
        const inserts = futureDates.map((date) => ({
          ...updatePayload,
          date,
          recurrence_group_id: newRecurrenceGroupId,
          recurrence_rule: rule,
        }));
        const { error: insertError } = await supabase.from("transactions").insert(inserts);
        if (insertError) throw insertError;
      }
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      return;
    }

    await updateTransaction.mutateAsync({ id: transaction.id, ...updatePayload });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    let categoryId = values.category_id ?? null;
    if (creatingCategory && newCategoryName.trim()) {
      const created = await createCategory.mutateAsync({
        name: newCategoryName.trim(),
        parent_id: newCategoryParent,
        allowed_type: newCategoryType,
      });
      categoryId = created.id;
    }

    const baseDate = new Date(`${values.date}T00:00:00`);
    const amount = parseCurrency(values.amount);

    const basePayload = {
      date: values.date,
      description: values.description,
      note: values.note || null,
      type: values.type,
      amount,
      account_id: values.type === "transfer" ? null : values.account_id ?? null,
      account_from_id: values.type === "transfer" ? values.account_from_id ?? null : null,
      account_to_id: values.type === "transfer" ? values.account_to_id ?? null : null,
      category_id: values.type === "transfer" ? null : categoryId,
      cleared: Boolean(values.cleared),
      installment_group_id: null,
      installment_index: null,
      installment_total: null,
      recurrence_group_id: null as string | null,
      recurrence_rule: null as Record<string, unknown> | null,
    };

    if (isEditing && transaction) {
      const updatePayload: Partial<Transaction> = {
        date: basePayload.date,
        description: basePayload.description,
        note: basePayload.note,
        type: basePayload.type,
        amount: basePayload.amount,
        account_id: basePayload.account_id,
        account_from_id: basePayload.account_from_id,
        account_to_id: basePayload.account_to_id,
        category_id: basePayload.category_id,
        cleared: basePayload.cleared,
        installment_total: hasInstallments ? Math.max(1, installmentTotal) : transaction.installment_total,
        recurrence_rule:
          repeatMode === "advanced"
            ? {
                interval: advancedInterval,
                unit: advancedUnit,
                indefinite: advancedIndefinite,
                occurrences: advancedIndefinite ? null : advancedOccurrences,
              }
            : transaction.recurrence_rule,
        recurrence_group_id:
          repeatMode === "advanced" ? transaction.recurrence_group_id ?? crypto.randomUUID() : transaction.recurrence_group_id,
      };

      if ((hasInstallments || hasRecurrence) && !confirmOpen) {
        setPendingPayload(updatePayload);
        setConfirmOpen(true);
        return;
      }

      await applyEdit(updatePayload);

      form.reset();
      setConfirmOpen(false);
      setPendingPayload(null);
      onClose();
      return;
    }

    const rows: typeof basePayload[] = [];

    if (repeatMode === "installment") {
      const groupId = crypto.randomUUID();
      const startIndex = Math.max(1, installmentStart);
      const total = Math.max(startIndex, installmentTotal);

      for (let index = startIndex; index <= total; index += 1) {
        rows.push({
          ...basePayload,
          date: toDateString(addMonths(baseDate, index - startIndex)),
          installment_group_id: groupId,
          installment_index: index,
          installment_total: total,
        });
      }
    } else if (repeatMode === "advanced") {
      const groupId = crypto.randomUUID();
      const count = advancedIndefinite ? 12 : Math.max(1, advancedOccurrences);
      const rule = {
        interval: advancedInterval,
        unit: advancedUnit,
        indefinite: advancedIndefinite,
        occurrences: advancedIndefinite ? null : advancedOccurrences,
      };

      const dates = buildRecurrenceDates(baseDate, count, advancedInterval, advancedUnit);
      for (const date of dates) {
        rows.push({
          ...basePayload,
          date,
          recurrence_group_id: groupId,
          recurrence_rule: rule,
        });
      }
    } else {
      rows.push(basePayload);
    }

    await createTransactions.mutateAsync(rows);
    form.reset();
    setCreatingCategory(false);
    setNewCategoryName("");
    onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar transacao" : "Adicionar transacao"}
      footer={
        <>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={createTransactions.isPending || updateTransaction.isPending}
          >
            {isEditing ? "Salvar alteracoes" : "Salvar"}
          </Button>
        </>
      }
    >
      <form className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-ink-700">
            Data
            <Input type="date" {...form.register("date")} />
          </label>
          <label className="space-y-1 text-sm text-ink-700">
            Descricao
            <Input placeholder="Ex: Supermercado" {...form.register("description")} />
          </label>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-ink-700">Tipo</span>
          <div className="flex gap-3">
            {[
              { label: "Despesa", value: "expense" },
              { label: "Receita", value: "income" },
              { label: "Transferencia", value: "transfer" },
            ].map((option) => (
              <label
                key={option.value}
                className={`rounded-full border px-3 py-1 text-sm ${
                  typeValue === option.value
                    ? "border-brand-600 bg-brand-200/50 text-brand-700"
                    : "border-ink-200 text-ink-600"
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  className="hidden"
                  {...form.register("type")}
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        {typeValue !== "transfer" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-ink-700">
              Categoria
              <Select
                {...form.register("category_id")}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === "__new__") {
                    setCreatingCategory(true);
                    form.setValue("category_id", "");
                  } else {
                    setCreatingCategory(false);
                    form.setValue("category_id", value);
                  }
                }}
              >
                <option value="">Selecione</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
                <option value="__new__">Nova categoria...</option>
              </Select>
            </label>
            <label className="space-y-1 text-sm text-ink-700">
              Conta
              <Select {...form.register("account_id")}>
                <option value="">Selecione</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-ink-700">
              Conta de origem
              <Select {...form.register("account_from_id")}>
                <option value="">Selecione</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-1 text-sm text-ink-700">
              Conta de destino
              <Select {...form.register("account_to_id")}>
                <option value="">Selecione</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        )}

        {creatingCategory ? (
          <div className="rounded-xl border border-dashed border-ink-200 bg-sand-50 p-3">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="space-y-1 text-xs text-ink-600">
                Nova categoria
                <Input value={newCategoryName} onChange={(event) => setNewCategoryName(event.target.value)} />
              </label>
              <label className="space-y-1 text-xs text-ink-600">
                Categoria pai
                <Select
                  value={newCategoryParent ?? ""}
                  onChange={(event) => setNewCategoryParent(event.target.value || null)}
                >
                  <option value="">Nenhuma</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="space-y-1 text-xs text-ink-600">
                Tipo
                <Select value={newCategoryType} onChange={(event) => setNewCategoryType(event.target.value as any)}>
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                  <option value="both">Ambos</option>
                </Select>
              </label>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-ink-700">
            Valor (R$)
            <Input placeholder="0,00" {...form.register("amount")} />
          </label>
          <label className="space-y-1 text-sm text-ink-700">
            Lembrete por e-mail
            <Select {...form.register("reminder")}>
              <option value="none">Nenhum</option>
              <option value="email">Opcional</option>
            </Select>
          </label>
        </div>

        <label className="space-y-1 text-sm text-ink-700">
          Nota
          <Textarea rows={3} placeholder="Detalhes adicionais" {...form.register("note")} />
        </label>

        <div className="flex items-center gap-4">
          <Checkbox label="Consolidado" {...form.register("cleared")} />
        </div>

        <div className="rounded-xl border border-ink-100 bg-sand-50 p-4">
          <h4 className="text-sm font-semibold text-ink-700">Repetir transacao</h4>
          {isEditing ? (
            <>
              {isInstallmentEditable ? (
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  <label className="space-y-1 text-xs text-ink-600">
                    Parcela atual
                    <Input type="number" value={currentInstallmentIndex} disabled />
                  </label>
                  <label className="space-y-1 text-xs text-ink-600">
                    Total de parcelas
                    <Input
                      type="number"
                      min={1}
                      value={installmentTotal}
                      onChange={(event) => setInstallmentTotal(Number(event.target.value))}
                    />
                  </label>
                </div>
              ) : (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { label: "Sem repeticao", value: "none" },
                      { label: "Avancado", value: "advanced" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRepeatMode(option.value as RepeatMode)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          repeatMode === option.value ? "bg-ink-900 text-white" : "bg-white text-ink-600"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>

                  {repeatMode === "advanced" ? (
                    <div className="mt-4 space-y-3">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="space-y-1 text-xs text-ink-600">
                          Repetir a cada
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min={1}
                              value={advancedInterval}
                              onChange={(event) => setAdvancedInterval(Number(event.target.value))}
                            />
                            <Select value={advancedUnit} onChange={(event) => setAdvancedUnit(event.target.value)}>
                              <option value="month">Mes</option>
                              <option value="week">Semana</option>
                              <option value="day">Dia</option>
                            </Select>
                          </div>
                        </label>
                        <label className="space-y-1 text-xs text-ink-600">
                          Nr. de ocorrencias
                          <Input
                            type="number"
                            min={1}
                            disabled={advancedIndefinite}
                            value={advancedOccurrences}
                            onChange={(event) => setAdvancedOccurrences(Number(event.target.value))}
                          />
                        </label>
                      </div>
                      <Checkbox
                        label="Repetir indefinidamente (gera 12 ocorrencias iniciais)"
                        checked={advancedIndefinite}
                        onChange={(event) => setAdvancedIndefinite(event.target.checked)}
                      />
                    </div>
                  ) : null}
                </>
              )}
            </>
          ) : (
            <>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { label: "Sem repeticao", value: "none" },
                  { label: "Parcelamento", value: "installment" },
                  { label: "Avancado", value: "advanced" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRepeatMode(option.value as RepeatMode)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      repeatMode === option.value ? "bg-ink-900 text-white" : "bg-white text-ink-600"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {repeatMode === "installment" ? (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <label className="space-y-1 text-xs text-ink-600">
                    Iniciar na parcela
                    <Input
                      type="number"
                      min={1}
                      value={installmentStart}
                      onChange={(event) => setInstallmentStart(Number(event.target.value))}
                    />
                  </label>
                  <label className="space-y-1 text-xs text-ink-600">
                    Total de parcelas
                    <Input
                      type="number"
                      min={1}
                      value={installmentTotal}
                      onChange={(event) => setInstallmentTotal(Number(event.target.value))}
                    />
                  </label>
                </div>
              ) : null}

              {repeatMode === "advanced" ? (
                <div className="mt-4 space-y-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1 text-xs text-ink-600">
                      Repetir a cada
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min={1}
                          value={advancedInterval}
                          onChange={(event) => setAdvancedInterval(Number(event.target.value))}
                        />
                        <Select value={advancedUnit} onChange={(event) => setAdvancedUnit(event.target.value)}>
                          <option value="month">Mes</option>
                          <option value="week">Semana</option>
                          <option value="day">Dia</option>
                        </Select>
                      </div>
                    </label>
                    <label className="space-y-1 text-xs text-ink-600">
                      Nr. de ocorrencias
                      <Input
                        type="number"
                        min={1}
                        disabled={advancedIndefinite}
                        value={advancedOccurrences}
                        onChange={(event) => setAdvancedOccurrences(Number(event.target.value))}
                      />
                    </label>
                  </div>
                  <Checkbox
                    label="Repetir indefinidamente (gera 12 ocorrencias iniciais)"
                    checked={advancedIndefinite}
                    onChange={(event) => setAdvancedIndefinite(event.target.checked)}
                  />
                </div>
              ) : null}
            </>
          )}
        </div>
      </form>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirmacao"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!pendingPayload) return;
                await applyEdit(pendingPayload);
                setConfirmOpen(false);
                setPendingPayload(null);
                onClose();
              }}
            >
              Alterar
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          Esta transacao possui repeticao. Qual acao deseja executar?
        </p>
        <div className="mt-4 space-y-2 text-sm text-ink-700">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={editScope === "only"}
              onChange={() => setEditScope("only")}
            />
            Alterar apenas esta
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={editScope === "from_here"}
              onChange={() => setEditScope("from_here")}
            />
            Alterar a partir desta
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={editScope === "from_first"}
              onChange={() => setEditScope("from_first")}
            />
            Alterar a partir da primeira
          </label>
        </div>
      </Modal>
    </Modal>
  );
};

export default AddTransactionModal;
