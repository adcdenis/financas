import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

type ReminderRow = {
  id: string;
  user_id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  reminder_offset_days: number | null;
};

const supabaseUrl = Deno.env.get("SB_URL") ?? "";
const serviceRoleKey = Deno.env.get("SB_SERVICE_ROLE_KEY") ?? "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
const fromEmail = Deno.env.get("REMINDER_FROM_EMAIL") ?? "";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatDate = (value: string) => {
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const sendEmail = async (to: string, subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Email send failed: ${details}`);
  }
};

serve(async () => {
  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !fromEmail) {
    return new Response("Missing required environment variables.", { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const today = new Date().toISOString().slice(0, 10);

  const { data: reminders, error } = await supabase
    .from("transactions")
    .select("id,user_id,date,description,amount,type,reminder_offset_days")
    .eq("reminder_date", today)
    .is("reminder_sent_at", null);

  if (error) {
    return new Response(`Query failed: ${error.message}`, { status: 500 });
  }

  if (!reminders || reminders.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const emailCache = new Map<string, string | null>();
  const sentIds: string[] = [];

  for (const reminder of reminders as ReminderRow[]) {
    if (!emailCache.has(reminder.user_id)) {
      const { data, error: userError } = await supabase.auth.admin.getUserById(reminder.user_id);
      if (userError || !data?.user?.email) {
        emailCache.set(reminder.user_id, null);
      } else {
        emailCache.set(reminder.user_id, data.user.email);
      }
    }

    const userEmail = emailCache.get(reminder.user_id);
    if (!userEmail) continue;

    const amountLabel =
      reminder.type === "expense"
        ? `-${formatCurrency(reminder.amount)}`
        : reminder.type === "transfer"
          ? `--`
          : formatCurrency(reminder.amount);

    const subject = `Lembrete de Transação: ${reminder.description} - ${formatDate(reminder.date)}`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #1f2933;">
        <h2 style="margin: 0 0 8px;">Lembrete de transacao</h2>
        <p style="margin: 0 0 12px;">Voce tem uma transacao agendada para ${formatDate(reminder.date)}.</p>
        <div style="padding: 12px; background: #f5f2ea; border-radius: 8px;">
          <div><strong>${reminder.description}</strong></div>
          <div style="margin-top: 6px;">Valor: ${amountLabel}</div>
        </div>
      </div>
    `;

    try {
      await sendEmail(userEmail, subject, html);
      sentIds.push(reminder.id);
    } catch {
      continue;
    }
  }

  if (sentIds.length > 0) {
    await supabase
      .from("transactions")
      .update({ reminder_sent_at: new Date().toISOString() })
      .in("id", sentIds);
  }

  return new Response(JSON.stringify({ sent: sentIds.length }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
