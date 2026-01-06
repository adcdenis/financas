import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type AdminUserRow = {
  id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  banned_until?: string | null;
};

const supabaseUrl = Deno.env.get("SB_URL") ?? "";
const serviceRoleKey = Deno.env.get("SB_SERVICE_ROLE_KEY") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SB_ANON_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const jsonResponse = (payload: unknown, status = 200) =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const parseBoolean = (value: string | null) => {
  if (!value) return false;
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return false;
  return parsed > Date.now();
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return new Response("Missing required environment variables.", { status: 500, headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  if (userError || !userData.user) {
    return new Response("Unauthorized", { status: 401, headers: corsHeaders });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile?.is_admin) {
    return new Response("Forbidden", { status: 403, headers: corsHeaders });
  }

  let payload: Record<string, unknown> | null = null;
  try {
    payload = await req.json();
  } catch {
    payload = null;
  }

  if (!payload || typeof payload.action !== "string") {
    return new Response("Invalid payload.", { status: 400, headers: corsHeaders });
  }

  const action = payload.action;
  const targetUserId = typeof payload.userId === "string" ? payload.userId : null;

  if (targetUserId && targetUserId === userData.user.id) {
    return new Response("Action not allowed on own user.", { status: 400, headers: corsHeaders });
  }

  if (action === "list") {
    const page = typeof payload.page === "number" ? payload.page : 1;
    const perPage = typeof payload.perPage === "number" ? payload.perPage : 200;
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) {
      return new Response(error.message, { status: 500, headers: corsHeaders });
    }

    const users = data?.users ?? [];
    const userIds = users.map((user) => user.id);
    const { data: profileRows } = await adminClient
      .from("profiles")
      .select("id,is_admin")
      .in("id", userIds);
    const adminMap = new Map(profileRows?.map((row) => [row.id, row.is_admin]) ?? []);

    const rows = users.map((user) => {
      const bannedUntil = (user as AdminUserRow).banned_until ?? null;
      return {
        id: user.id,
        email: user.email ?? null,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at ?? null,
        banned_until: bannedUntil,
        is_blocked: parseBoolean(bannedUntil),
        is_admin: adminMap.get(user.id) ?? false,
      };
    });

    return jsonResponse({ users: rows, total: data?.total ?? rows.length });
  }

  if (!targetUserId) {
    return new Response("User id required.", { status: 400, headers: corsHeaders });
  }

  if (action === "block") {
    const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
      ban_duration: "87600h",
    });
    if (error) return new Response(error.message, { status: 500, headers: corsHeaders });
    return jsonResponse({ ok: true });
  }

  if (action === "unblock") {
    const { error } = await adminClient.auth.admin.updateUserById(targetUserId, {
      ban_duration: "none",
    });
    if (error) return new Response(error.message, { status: 500, headers: corsHeaders });
    return jsonResponse({ ok: true });
  }

  if (action === "delete") {
    const { error } = await adminClient.auth.admin.deleteUser(targetUserId, false);
    if (error) return new Response(error.message, { status: 500, headers: corsHeaders });
    return jsonResponse({ ok: true });
  }

  return new Response("Unsupported action.", { status: 400, headers: corsHeaders });
});
