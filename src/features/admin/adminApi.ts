import { supabase } from "../../lib/supabaseClient";

export type AdminUserSummary = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until: string | null;
  is_blocked: boolean;
  is_admin: boolean;
};

export type AdminUsersResponse = {
  users: AdminUserSummary[];
  total: number;
};

export type AdminStatus = {
  isAdmin: boolean;
  userId: string | null;
  email: string | null;
};

export const fetchAdminStatus = async (): Promise<AdminStatus> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;

  const user = userData.user;
  if (!user) {
    return { isAdmin: false, userId: null, email: null };
  }

  const displayName =
    typeof user.user_metadata?.name === "string" && user.user_metadata.name.trim()
      ? user.user_metadata.name.trim()
      : user.email?.split("@")[0] ?? null;

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      name: displayName,
    },
    { onConflict: "id" }
  );

  const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (error) throw error;

  return { isAdmin: Boolean(data?.is_admin), userId: user.id, email: user.email ?? null };
};

export const fetchAdminUsers = async (): Promise<AdminUsersResponse> => {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action: "list" },
  });
  if (error) throw error;
  return data as AdminUsersResponse;
};

export const blockAdminUser = async (userId: string) => {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action: "block", userId },
  });
  if (error) throw error;
  return data;
};

export const unblockAdminUser = async (userId: string) => {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action: "unblock", userId },
  });
  if (error) throw error;
  return data;
};

export const deleteAdminUser = async (userId: string) => {
  const { data, error } = await supabase.functions.invoke("admin-users", {
    body: { action: "delete", userId },
  });
  if (error) throw error;
  return data;
};
