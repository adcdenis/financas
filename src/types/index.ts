export type TransactionType = "expense" | "income" | "transfer";

export interface Account {
  id: string;
  user_id: string;
  name: string;
  initial_balance: number;
  archived: boolean;
  include_in_monthly_summary: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  allowed_type: "expense" | "income" | "both";
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  date: string;
  description: string;
  note: string | null;
  type: TransactionType;
  amount: number;
  account_id: string | null;
  account_from_id: string | null;
  account_to_id: string | null;
  category_id: string | null;
  cleared: boolean;
  reminder_offset_days: number | null;
  reminder_date: string | null;
  reminder_sent_at: string | null;
  installment_group_id: string | null;
  installment_index: number | null;
  installment_total: number | null;
  recurrence_group_id: string | null;
  recurrence_rule: Record<string, unknown> | null;
  created_at: string;
}
