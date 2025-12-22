import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../components/ui/Button";
import { Checkbox } from "../components/ui/Checkbox";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { formatCurrency, parseCurrency } from "../lib/utils";
import { useAccounts, useCreateAccount, useDeleteAccount, useUpdateAccount } from "../features/accounts/accountsHooks";

const schema = z.object({
  name: z.string().min(2, "Informe o nome"),
  initial_balance: z.string().default("0"),
  include_in_monthly_summary: z.boolean().default(true),
});

type AccountForm = z.infer<typeof schema>;

const SettingsAccountsPage = () => {
  const { data: accounts = [] } = useAccounts();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();
  const deleteAccount = useDeleteAccount();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<AccountForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", initial_balance: "0", include_in_monthly_summary: true },
  });

  const openCreate = () => {
    form.reset({ name: "", initial_balance: "0", include_in_monthly_summary: true });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (id: string) => {
    const account = accounts.find((item) => item.id === id);
    if (!account) return;
    form.reset({
      name: account.name,
      initial_balance: String(account.initial_balance ?? 0),
      include_in_monthly_summary: account.include_in_monthly_summary ?? true,
    });
    setEditingId(id);
    setModalOpen(true);
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      initial_balance: parseCurrency(values.initial_balance),
      archived: false,
      include_in_monthly_summary: values.include_in_monthly_summary,
    };
    if (editingId) {
      await updateAccount.mutateAsync({ id: editingId, ...payload });
    } else {
      await createAccount.mutateAsync(payload);
    }
    setModalOpen(false);
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteAccount.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const deleteAccountName = deleteId ? accounts.find((account) => account.id === deleteId)?.name : null;

  return (
    <div className="px-6 pb-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ink-900">Contas</h2>
        <Button onClick={openCreate}>Nova conta</Button>
      </div>
      <div className="mt-4 rounded-2xl bg-white/80 p-4 shadow-soft">
        {accounts.length === 0 ? (
          <p className="text-sm text-ink-500">Nenhuma conta cadastrada.</p>
        ) : (
          <div className="space-y-2">
            {accounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between border-b border-sand-100 pb-2">
                <div>
                  <div className="text-sm font-medium text-ink-900">{account.name}</div>
                  <div className="text-xs text-ink-500">
                    Saldo inicial: {formatCurrency(account.initial_balance ?? 0)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => openEdit(account.id)}>
                    Editar
                  </Button>
                  <Button variant="ghost" onClick={() => setDeleteId(account.id)}>
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Editar conta" : "Nova conta"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>Salvar</Button>
          </>
        }
      >
        <form className="space-y-4">
          <label className="space-y-1 text-sm text-ink-700">
            Nome
            <Input {...form.register("name")} />
          </label>
          <label className="space-y-1 text-sm text-ink-700">
            Saldo inicial
            <Input {...form.register("initial_balance")} />
          </label>
          <Checkbox label="Incluir no resumo do mes" {...form.register("include_in_monthly_summary")} />
        </form>
      </Modal>

      <Modal
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Remover conta"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Confirmar remocao
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-600">
          Tem certeza que deseja remover a conta {deleteAccountName ? `"${deleteAccountName}"` : "selecionada"}?
        </p>
      </Modal>
    </div>
  );
};

export default SettingsAccountsPage;
