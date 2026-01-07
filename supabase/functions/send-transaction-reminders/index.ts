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
const reminderTimeZone = Deno.env.get("REMINDER_TIMEZONE") ?? "America/Sao_Paulo";
const allowRepeat = (Deno.env.get("REMINDER_ALLOW_REPEAT") ?? "true").toLowerCase() !== "false";
const maxReminderOffsetDays = Math.max(
  0,
  Number.parseInt(Deno.env.get("REMINDER_MAX_OFFSET_DAYS") ?? "3", 10) || 0
);
const debugMode = (Deno.env.get("REMINDER_DEBUG") ?? "").toLowerCase() === "true";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const formatDate = (value: string) => {
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const getToday = () => {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: reminderTimeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
};

const addDaysToDateString = (value: string, days: number) => {
  const parts = value.split("-");
  if (parts.length !== 3) return value;
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return value;
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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

  const today = getToday();
  const maxDate = addDaysToDateString(today, maxReminderOffsetDays);

  let query = supabase
    .from("transactions")
    .select("id,user_id,date,description,amount,type,reminder_offset_days")
    .not("reminder_offset_days", "is", null)
    .gte("date", today)
    .lte("date", maxDate);

  if (!allowRepeat) {
    query = query.is("reminder_sent_at", null);
  }

  const { data: reminders, error } = await query;

  if (error) {
    return new Response(`Query failed: ${error.message}`, { status: 500 });
  }

  const dueReminders =
    reminders?.filter(
      (reminder) =>
        reminder.reminder_offset_days !== null &&
        addDaysToDateString(reminder.date, -reminder.reminder_offset_days) === today
    ) ?? [];

  if (dueReminders.length === 0) {
    if (debugMode) {
      const totalsByOffset = new Map<number, number>();
      for (const reminder of reminders ?? []) {
        if (reminder.reminder_offset_days === null) continue;
        totalsByOffset.set(
          reminder.reminder_offset_days,
          (totalsByOffset.get(reminder.reminder_offset_days) ?? 0) + 1
        );
      }
      const totals = Array.from(totalsByOffset.entries()).sort((a, b) => a[0] - b[0]);
      return new Response(
        JSON.stringify({
          sent: 0,
          debug: {
            today,
            maxDate,
            allowRepeat,
            maxReminderOffsetDays,
            remindersCount: reminders?.length ?? 0,
            totalsByOffset: totals,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ sent: 0 }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const emailCache = new Map<string, string | null>();
  const sentIds: string[] = [];
  const failedReminders: Array<{ id: string; reason: string }> = [];

  for (const reminder of dueReminders as ReminderRow[]) {
    if (!emailCache.has(reminder.user_id)) {
      const { data, error: userError } = await supabase.auth.admin.getUserById(reminder.user_id);
      if (userError || !data?.user?.email) {
        emailCache.set(reminder.user_id, null);
      } else {
        emailCache.set(reminder.user_id, data.user.email);
      }
    }

    const userEmail = emailCache.get(reminder.user_id);
    if (!userEmail) {
      if (debugMode) {
        failedReminders.push({ id: reminder.id, reason: "missing_email" });
      }
      continue;
    }

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
      await delay(550);
    } catch (error) {
      if (debugMode) {
        const message = error instanceof Error ? error.message : "unknown_error";
        failedReminders.push({ id: reminder.id, reason: `send_error:${message}` });
      }
      continue;
    }
  }

  if (sentIds.length > 0) {
    await supabase
      .from("transactions")
      .update({ reminder_sent_at: new Date().toISOString() })
      .in("id", sentIds);
  }

  const responsePayload: Record<string, unknown> = { sent: sentIds.length };

  if (debugMode) {
    const totalsByOffset = new Map<number, number>();
    const dueByOffset = new Map<number, number>();
    for (const reminder of reminders ?? []) {
      if (reminder.reminder_offset_days === null) continue;
      totalsByOffset.set(
        reminder.reminder_offset_days,
        (totalsByOffset.get(reminder.reminder_offset_days) ?? 0) + 1
      );
    }
    for (const reminder of dueReminders) {
      if (reminder.reminder_offset_days === null) continue;
      dueByOffset.set(
        reminder.reminder_offset_days,
        (dueByOffset.get(reminder.reminder_offset_days) ?? 0) + 1
      );
    }
    responsePayload.debug = {
      today,
      maxDate,
      allowRepeat,
      maxReminderOffsetDays,
      remindersCount: reminders?.length ?? 0,
      dueCount: dueReminders.length,
      totalsByOffset: Array.from(totalsByOffset.entries()).sort((a, b) => a[0] - b[0]),
      dueByOffset: Array.from(dueByOffset.entries()).sort((a, b) => a[0] - b[0]),
      failedReminders,
    };
  }

  return new Response(JSON.stringify(responsePayload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
