import { supabase } from "../../lib/supabaseClient";
import type { Transaction } from "../../types";
import { endOfMonth, format, startOfMonth } from "date-fns";

export interface TransactionsFilter {
  month: Date;
  accountIds: string[];
  categoryIds: string[];
  search: string;
  unclearedOnly: boolean;
}

export const fetchTransactions = async (filters: TransactionsFilter) => {
  const start = format(startOfMonth(filters.month), "yyyy-MM-dd");
  const end = format(endOfMonth(filters.month), "yyyy-MM-dd");

  let query = supabase
    .from("transactions")
    .select("*")
    .gte("date", start)
    .lte("date", end)
    .order("date", { ascending: true })
    .order("created_at", { ascending: true });

  if (filters.unclearedOnly) {
    query = query.eq("cleared", false);
  }

  if (filters.search.trim()) {
    const term = `%${filters.search.trim()}%`;
    query = query.or(`description.ilike.${term},note.ilike.${term}`);
  }

  if (filters.accountIds.length > 0) {
    const accountList = filters.accountIds.join(",");
    query = query.or(
      `account_id.in.(${accountList}),account_from_id.in.(${accountList}),account_to_id.in.(${accountList})`
    );
  }

  if (filters.categoryIds.length > 0) {
    query = query.in("category_id", filters.categoryIds);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Transaction[];
};

export const createTransactions = async (payload: Omit<Transaction, "id" | "created_at" | "user_id">[]) => {
  const { data, error } = await supabase.from("transactions").insert(payload).select("*");
  if (error) throw error;
  return (data ?? []) as Transaction[];
};

export const updateTransaction = async ({ id, ...payload }: Partial<Transaction> & { id: string }) => {
  const { data, error } = await supabase
    .from("transactions")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as Transaction;
};

export const updateTransactionsCleared = async (ids: string[], cleared: boolean) => {
  const { data, error } = await supabase
    .from("transactions")
    .update({ cleared })
    .in("id", ids)
    .select("*");
  if (error) throw error;
  return (data ?? []) as Transaction[];
};

export const deleteTransactions = async (ids: string[]) => {
  const { error } = await supabase.from("transactions").delete().in("id", ids);
  if (error) throw error;
  return true;
};
