import { supabase } from "../../lib/supabaseClient";
import type { Category } from "../../types";

export const fetchCategories = async () => {
  const { data, error } = await supabase.from("categories").select("*").order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Category[];
};

export const createCategory = async (
  payload: Omit<Category, "id" | "created_at" | "user_id"> & { parent_id?: string | null }
) => {
  const { data, error } = await supabase.from("categories").insert(payload).select("*").single();
  if (error) throw error;
  return data as Category;
};

export const updateCategory = async ({ id, ...payload }: Partial<Category> & { id: string }) => {
  const { data, error } = await supabase.from("categories").update(payload).eq("id", id).select("*").single();
  if (error) throw error;
  return data as Category;
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
  return true;
};
