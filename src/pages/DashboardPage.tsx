import { useMemo, useState } from "react";
import { startOfMonth } from "date-fns";
import { useNavigate } from "react-router-dom";
import SidebarAccounts from "../components/SidebarAccounts";
import SidebarCategoriesTree from "../components/SidebarCategoriesTree";
import QuickSearch from "../components/QuickSearch";
import MonthNavigator from "../components/MonthNavigator";
import TransactionsTable from "../components/TransactionsTable";
import AddTransactionModal from "../components/AddTransactionModal";
import ExportCSVButton from "../components/ExportCSVButton";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Select";
import { useAccounts } from "../features/accounts/accountsHooks";
import { useCategories } from "../features/categories/categoriesHooks";
import {
  useDeleteTransactions,
  useTransactions,
  useUpdateTransaction,
  useUpdateTransactionsCleared,
} from "../features/transactions/transactionsHooks";
import { expandCategorySelection } from "../lib/categoryTree";
import { formatCurrency } from "../lib/utils";
import type { Transaction } from "../types";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [unclearedOnly, setUnclearedOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);

  const { data: accounts = [], isLoading: accountsLoading } = useAccounts();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const expandedCategoryIds = useMemo(
    () => expandCategorySelection(categories, selectedCategoryIds),
    [categories, selectedCategoryIds]
  );

  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions({
    month,
    accountIds: selectedAccountIds,
    categoryIds: expandedCategoryIds,
    search: searchTerm,
    unclearedOnly,
  });

  const updateTransaction = useUpdateTransaction();
  const updateTransactionsCleared = useUpdateTransactionsCleared();
  const deleteTransactions = useDeleteTransactions();

  const handleToggleAccount = (id: string) => {
    setSelectedAccountIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleToggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const balances = useMemo(() => {
    const map: Record<string, number> = {};
    accounts.forEach((account) => {
      map[account.id] = account.initial_balance ?? 0;
    });

    transactions.forEach((transaction) => {
      if (transaction.type === "transfer") {
        if (transaction.account_from_id) map[transaction.account_from_id] -= transaction.amount;
        if (transaction.account_to_id) map[transaction.account_to_id] += transaction.amount;
        return;
      }
      if (transaction.account_id) {
        map[transaction.account_id] += transaction.type === "expense" ? -transaction.amount : transaction.amount;
      }
    });

    return map;
  }, [accounts, transactions]);

  const monthlySummaryTotal = useMemo(
    () =>
      accounts.reduce((sum, account) => {
        if (!account.include_in_monthly_summary) return sum;
        return sum + (balances[account.id] ?? account.initial_balance ?? 0);
      }, 0),
    [accounts, balances]
  );

  const handleToggleTransaction = (id: string) => {
    setSelectedTransactionIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleToggleAllTransactions = (ids: string[], checked: boolean) => {
    setSelectedTransactionIds(checked ? ids : []);
  };

  return (
    <div className="grid min-h-[calc(100vh-72px)] grid-cols-1 gap-6 px-6 pb-10 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-2xl bg-ink-900 p-4 text-white shadow-card">
          <div className="text-xs uppercase tracking-wide text-ink-200">Resumo do mes</div>
          <div className="mt-2 text-2xl font-semibold">
            {formatCurrency(monthlySummaryTotal)}
          </div>
        </div>
        <SidebarAccounts
          accounts={accounts}
          balances={balances}
          selectedIds={selectedAccountIds}
          onToggle={handleToggleAccount}
          onClear={() => setSelectedAccountIds([])}
          onCreate={() => navigate("/app/settings/accounts")}
        />
        <QuickSearch value={searchInput} onChange={setSearchInput} onSubmit={() => setSearchTerm(searchInput)} />
        <SidebarCategoriesTree
          categories={categories}
          selectedIds={selectedCategoryIds}
          onToggle={handleToggleCategory}
          onClear={() => setSelectedCategoryIds([])}
          onCreate={() => navigate("/app/settings/categories")}
        />
      </aside>

      <main className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/80 p-4 shadow-soft">
          <MonthNavigator month={month} onChange={setMonth} />
          <div className="flex flex-wrap items-center gap-3">
            <Select value={unclearedOnly ? "uncleared" : "all"} onChange={(event) => setUnclearedOnly(event.target.value === "uncleared")}
              >
              <option value="all">Todas transacoes</option>
              <option value="uncleared">Transacoes nao consolidadas</option>
            </Select>
            <Button onClick={() => setModalOpen(true)}>Adicionar transacao</Button>
            <Button
              variant="secondary"
              disabled={selectedTransactionIds.length === 0}
              onClick={() => {
                if (selectedTransactionIds.length === 0) return;
                updateTransactionsCleared.mutate({ ids: selectedTransactionIds, cleared: true });
                setSelectedTransactionIds([]);
              }}
            >
              Consolidar
            </Button>
            <Button
              variant="secondary"
              disabled={selectedTransactionIds.length === 0}
              onClick={() => {
                if (selectedTransactionIds.length === 0) return;
                updateTransactionsCleared.mutate({ ids: selectedTransactionIds, cleared: false });
                setSelectedTransactionIds([]);
              }}
            >
              Tirar consolidacao
            </Button>
            <Button
              variant="danger"
              disabled={selectedTransactionIds.length === 0}
              onClick={() => {
                if (selectedTransactionIds.length === 0) return;
                if (!window.confirm("Excluir transacoes selecionadas?")) return;
                deleteTransactions.mutate(selectedTransactionIds);
                setSelectedTransactionIds([]);
              }}
            >
              Excluir
            </Button>
            <ExportCSVButton month={month} transactions={transactions} accounts={accounts} categories={categories} />
          </div>
        </div>

        {accountsLoading || categoriesLoading || transactionsLoading ? (
          <div className="rounded-2xl bg-white/90 p-8 text-center text-sm text-ink-500 shadow-soft">Carregando...</div>
        ) : (
          <>
            <TransactionsTable
              transactions={transactions}
              accounts={accounts}
              categories={categories}
              onToggleCleared={(id, cleared) => updateTransaction.mutate({ id, cleared })}
              onEdit={(transaction) => {
                setEditingTransaction(transaction);
                setModalOpen(true);
              }}
              selectedIds={selectedTransactionIds}
              onToggleSelect={handleToggleTransaction}
              onToggleSelectAll={handleToggleAllTransactions}
            />
            <div className="px-2 text-right text-xs text-ink-400">
              Copyright © 2025 Finanças Desktop · v1.1.0
            </div>
          </>
        )}
      </main>

      <AddTransactionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTransaction(null);
        }}
        accounts={accounts}
        categories={categories}
        transaction={editingTransaction}
      />
    </div>
  );
};

export default DashboardPage;
