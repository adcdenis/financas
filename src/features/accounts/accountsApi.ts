import { supabase } from "../../lib/supabaseClient";
import type { Account } from "../../types";

export const fetchAccounts = async () => {
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("archived", false)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Account[];
};

export const createAccount = async (payload: Omit<Account, "id" | "created_at" | "user_id">) => {
  const { data, error } = await supabase.from("accounts").insert(payload).select("*").single();
  if (error) throw error;
  return data as Account;
};

export const updateAccount = async ({ id, ...payload }: Partial<Account> & { id: string }) => {
  const { data, error } = await supabase.from("accounts").update(payload).eq("id", id).select("*").single();
  if (error) throw error;
  return data as Account;
};

export const deleteAccount = async (id: string) => {
  const { error } = await supabase.from("accounts").delete().eq("id", id);
  if (error) throw error;
  return true;
};
