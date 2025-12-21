import { format } from "date-fns";
import type { Account, Category, Transaction } from "../types";
import { Button } from "./ui/Button";
import { formatCurrency } from "../lib/utils";

interface ExportCSVButtonProps {
  month: Date;
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
}

const ExportCSVButton = ({ month, transactions, accounts, categories }: ExportCSVButtonProps) => {
  const accountMap = new Map(accounts.map((account) => [account.id, account.name]));
  const categoryMap = new Map(categories.map((category) => [category.id, category.name]));

  const handleExport = () => {
    const rows = ["date,description,category,account,amount,type,cleared,note"];

    transactions.forEach((transaction) => {
      const accountLabel =
        transaction.type === "transfer"
          ? `${accountMap.get(transaction.account_from_id ?? "") ?? ""} -> ${
              accountMap.get(transaction.account_to_id ?? "") ?? ""
            }`
          : accountMap.get(transaction.account_id ?? "") ?? "";

      const categoryLabel =
        transaction.type === "transfer" ? "Transferencia" : categoryMap.get(transaction.category_id ?? "") ?? "";

      const row = [
        transaction.date.slice(0, 10),
        `"${transaction.description.replace(/"/g, "''")}"`,
        `"${categoryLabel.replace(/"/g, "''")}"`,
        `"${accountLabel.replace(/"/g, "''")}"`,
        formatCurrency(transaction.amount),
        transaction.type,
        transaction.cleared ? "true" : "false",
        `"${(transaction.note ?? "").replace(/"/g, "''")}"`,
      ];

      rows.push(row.join(","));
    });

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transacoes-${format(month, "yyyy-MM")}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="secondary" onClick={handleExport}>
      Exportar
    </Button>
  );
};

export default ExportCSVButton;
