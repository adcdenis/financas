import { useEffect, useMemo, useState } from "react";
import { startOfMonth } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import SidebarAccounts from "../components/SidebarAccounts";
import SidebarCategoriesTree from "../components/SidebarCategoriesTree";
import QuickSearch from "../components/QuickSearch";
import MonthNavigator from "../components/MonthNavigator";
import TransactionsTable from "../components/TransactionsTable";
import AddTransactionModal from "../components/AddTransactionModal";
import ExportCSVButton from "../components/ExportCSVButton";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
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
import { supabase } from "../lib/supabaseClient";
import type { Transaction } from "../types";
import appPackage from "../../package.json";

type DeleteScope = "only" | "from_here" | "from_first";

const DashboardPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const appVersion = appPackage.version;
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [unclearedOnly, setUnclearedOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteScope, setDeleteScope] = useState<DeleteScope>("only");
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

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

  const selectedTransactions = useMemo(
    () => transactions.filter((transaction) => selectedTransactionIds.includes(transaction.id)),
    [transactions, selectedTransactionIds]
  );

  useEffect(() => {
    if (selectedTransactionIds.length === 0) return;
    const availableIds = new Set(transactions.map((transaction) => transaction.id));
    const filtered = selectedTransactionIds.filter((id) => availableIds.has(id));
    if (filtered.length === selectedTransactionIds.length) return;
    setSelectedTransactionIds(filtered);
  }, [transactions, selectedTransactionIds]);

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

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteScope("only");
    setDeleteTarget(null);
  };

  const handleDeleteGroup = async () => {
    if (!deleteTarget) return;

    if (deleteScope === "only") {
      await deleteTransactions.mutateAsync([deleteTarget.id]);
      closeDeleteModal();
      setSelectedTransactionIds([]);
      return;
    }

    if (deleteTarget.installment_group_id) {
      let query = supabase
        .from("transactions")
        .delete()
        .eq("installment_group_id", deleteTarget.installment_group_id);

      if (deleteScope === "from_here") {
        query = query.gte("installment_index", deleteTarget.installment_index ?? 1);
      }

      const { error } = await query;
      if (error) throw error;
    } else if (deleteTarget.recurrence_group_id) {
      let query = supabase
        .from("transactions")
        .delete()
        .eq("recurrence_group_id", deleteTarget.recurrence_group_id);

      if (deleteScope === "from_here") {
        query = query.gte("date", deleteTarget.date.slice(0, 10));
      }

      const { error } = await query;
      if (error) throw error;
    }

    await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    closeDeleteModal();
    setSelectedTransactionIds([]);
  };

  const handleDeleteSelected = () => {
    if (selectedTransactions.length === 0) return;
    if (selectedTransactions.length === 1) {
      const target = selectedTransactions[0];
      if (target.installment_group_id || target.recurrence_group_id) {
        setDeleteTarget(target);
        setDeleteScope("only");
        setDeleteModalOpen(true);
        return;
      }
    }
    if (!window.confirm("Excluir transacoes selecionadas?")) return;
    deleteTransactions.mutate(selectedTransactions.map((transaction) => transaction.id));
    setSelectedTransactionIds([]);
  };

  return (
    <div className="grid min-h-[calc(100vh-72px)] grid-cols-1 gap-6 px-6 pb-10 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-4">
        <div className="rounded-2xl bg-ink-900 p-4 text-white shadow-card">
          <div className="text-xs uppercase tracking-wide text-ink-200">Resumo do Mês</div>
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
              <option value="all">Todas as Transações</option>
              <option value="uncleared">Transações não Consolidadas</option>
            </Select>
            <Button onClick={() => setModalOpen(true)}>Adicionar Transação</Button>
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
              Tirar Consolidação
            </Button>
            <Button
              variant="danger"
              disabled={selectedTransactionIds.length === 0}
              onClick={handleDeleteSelected}
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
              Copyright © 2025 Minhas Finanças · v{appVersion}
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

      <Modal
        open={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Excluir transacao"
        footer={
          <>
            <Button variant="ghost" onClick={closeDeleteModal}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteGroup}>
              Excluir
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
              checked={deleteScope === "only"}
              onChange={() => setDeleteScope("only")}
            />
            Excluir apenas esta
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={deleteScope === "from_here"}
              onChange={() => setDeleteScope("from_here")}
            />
            Excluir a partir desta
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={deleteScope === "from_first"}
              onChange={() => setDeleteScope("from_first")}
            />
            Excluir todas
          </label>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;

