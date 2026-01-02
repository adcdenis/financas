import { format, parseISO } from "date-fns";
import React from "react";
import { ptBR } from "date-fns/locale";
import type { Account, Category, Transaction } from "../types";
import { Checkbox } from "./ui/Checkbox";
import { formatCurrency } from "../lib/utils";

interface TransactionsTableProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  onToggleCleared: (id: string, cleared: boolean) => void;
  onEdit: (transaction: Transaction) => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[], checked: boolean) => void;
}

const TransactionsTable = ({
  transactions,
  accounts,
  categories,
  onToggleCleared,
  onEdit,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
}: TransactionsTableProps) => {
  const accountMap = new Map(accounts.map((account) => [account.id, account]));
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  const groups = transactions.reduce<Record<string, Transaction[]>>((acc, transaction) => {
    const dayKey = transaction.date.slice(0, 10);
    acc[dayKey] = acc[dayKey] ?? [];
    acc[dayKey].push(transaction);
    return acc;
  }, {});

  const orderedDays = Object.keys(groups).sort();
  let cumulative = 0;

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl bg-white/90 p-8 text-center text-sm text-ink-500 shadow-soft">
        Nenhuma transacao encontrada para este periodo.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl bg-white/90 shadow-soft">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <thead className="bg-sand-100 text-ink-600">
          <tr>
            <th className="px-3 py-2 text-left font-medium sm:px-4 sm:py-3">
              <Checkbox
                checked={transactions.length > 0 && selectedIds.length === transactions.length}
                onChange={(event) => onToggleSelectAll(transactions.map((t) => t.id), event.target.checked)}
                onClick={(event) => event.stopPropagation()}
              />
            </th>
            <th className="px-3 py-2 text-left font-medium sm:px-4 sm:py-3">Descricao</th>
            <th className="px-3 py-2 text-left font-medium sm:px-4 sm:py-3">Categoria</th>
            <th className="px-3 py-2 text-left font-medium sm:px-4 sm:py-3">Conta</th>
            <th className="px-3 py-2 text-right font-medium sm:px-4 sm:py-3">Valor (R$)</th>
            <th className="px-3 py-2 text-center font-medium sm:px-4 sm:py-3">Consolidado</th>
          </tr>
        </thead>
        <tbody>
          {orderedDays.map((dayKey) => {
            const dayDate = parseISO(dayKey);
            const dayTransactions = groups[dayKey] ?? [];
            const dayTotal = dayTransactions.reduce((sum, transaction) => {
              if (transaction.type === "expense") return sum - transaction.amount;
              if (transaction.type === "income") return sum + transaction.amount;
              return sum;
            }, 0);
            cumulative += dayTotal;

            return (
              <React.Fragment key={dayKey}>
                <tr className="bg-sand-50">
                  <td
                    colSpan={6}
                    className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-ink-500 sm:px-4 sm:py-3"
                  >
                    {format(dayDate, "dd/MM/yyyy, EEEE", { locale: ptBR })}
                  </td>
                </tr>
                {dayTransactions.map((transaction) => {
                  const accountLabel =
                    transaction.type === "transfer"
                      ? `${accountMap.get(transaction.account_from_id ?? "")?.name ?? "-"} → ${
                          accountMap.get(transaction.account_to_id ?? "")?.name ?? "-"
                        }`
                      : accountMap.get(transaction.account_id ?? "")?.name ?? "-";
                  const categoryLabel =
                    transaction.type === "transfer"
                      ? "Transferencia"
                      : categoryMap.get(transaction.category_id ?? "")?.name ?? "-";

                  return (
                    <tr
                      key={transaction.id}
                      className="cursor-pointer border-t border-sand-100 hover:bg-sand-50/60"
                      onClick={() => onEdit(transaction)}
                    >
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <Checkbox
                          checked={selectedIds.includes(transaction.id)}
                          onChange={() => onToggleSelect(transaction.id)}
                          onClick={(event) => event.stopPropagation()}
                        />
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3">
                        <div className="font-medium text-ink-900">{transaction.description}</div>
                        {transaction.installment_total ? (
                          <div className="text-xs text-ink-400">
                            Parcela {transaction.installment_index} de {transaction.installment_total}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-ink-600 sm:px-4 sm:py-3">{categoryLabel}</td>
                      <td className="px-3 py-2 text-ink-600 sm:px-4 sm:py-3">{accountLabel}</td>
                      <td className="px-3 py-2 text-right font-mono text-ink-900 sm:px-4 sm:py-3">
                        {transaction.type === "expense" ? "-" : ""}
                        {transaction.type === "transfer" ? "--" : formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-3 py-2 text-center sm:px-4 sm:py-3">
                        <button
                          type="button"
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full transition ${
                            transaction.cleared
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-sand-100 text-ink-400 hover:text-ink-600"
                          }`}
                          aria-pressed={transaction.cleared}
                          aria-label={transaction.cleared ? "Transacao consolidada" : "Transacao nao consolidada"}
                          onClick={(event) => {
                            event.stopPropagation();
                            onToggleCleared(transaction.id, !transaction.cleared);
                          }}
                        >
                          {transaction.cleared ? (
                            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                              <path
                                fill="currentColor"
                                d="M9.55 17.2 5.4 13.05l1.4-1.4 2.75 2.75 6.65-6.65 1.4 1.4z"
                              />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                              <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                            </svg>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                <tr className="border-t border-sand-200 bg-sand-50">
                  <td className="px-3 py-2 text-xs uppercase text-ink-500 sm:px-4 sm:py-3" colSpan={4}>
                    Saldo do dia
                    <span className="ml-3 text-[11px] text-ink-400">Movimento do dia: {formatCurrency(dayTotal)}</span>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-sm font-semibold text-ink-900 sm:px-4 sm:py-3">
                    {formatCurrency(cumulative)}
                  </td>
                  <td className="px-3 py-2 sm:px-4 sm:py-3" />
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsTable;
