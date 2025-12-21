import type { Account } from "../types";
import { Button } from "./ui/Button";
import { Checkbox } from "./ui/Checkbox";
import { formatCurrency } from "../lib/utils";

interface SidebarAccountsProps {
  accounts: Account[];
  balances: Record<string, number>;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onClear: () => void;
  onCreate: () => void;
}

const SidebarAccounts = ({
  accounts,
  balances,
  selectedIds,
  onToggle,
  onClear,
  onCreate,
}: SidebarAccountsProps) => (
  <section className="rounded-2xl bg-white/80 p-4 shadow-soft">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-ink-800">Contas</h3>
      <div className="flex gap-2">
        <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onClear}>
          Limpar
        </Button>
        <Button variant="secondary" className="px-2 py-1 text-xs" onClick={onCreate}>
          Nova conta
        </Button>
      </div>
    </div>
    <div className="mt-3 space-y-2">
      {accounts.length === 0 ? (
        <p className="text-xs text-ink-500">Nenhuma conta cadastrada.</p>
      ) : (
        accounts.map((account) => (
          <label key={account.id} className="flex items-center justify-between text-sm text-ink-700">
            <Checkbox
              checked={selectedIds.includes(account.id)}
              onChange={() => onToggle(account.id)}
              label={account.name}
            />
            <span className="font-mono text-xs text-ink-600">
              {formatCurrency(balances[account.id] ?? account.initial_balance ?? 0)}
            </span>
          </label>
        ))
      )}
    </div>
  </section>
);

export default SidebarAccounts;
