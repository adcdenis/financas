alter table transactions
  add column if not exists reminder_offset_days int,
  add column if not exists reminder_date date,
  add column if not exists reminder_sent_at timestamptz;

create or replace function public.set_transaction_reminder()
returns trigger
language plpgsql
as $$
begin
  if new.reminder_offset_days is null then
    new.reminder_date := null;
  else
    new.reminder_date := new.date - new.reminder_offset_days;
  end if;

  if tg_op = 'INSERT' then
    new.reminder_sent_at := null;
  elsif tg_op = 'UPDATE' then
    if new.date is distinct from old.date
      or new.reminder_offset_days is distinct from old.reminder_offset_days then
      new.reminder_sent_at := null;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists set_transaction_reminder on transactions;
create trigger set_transaction_reminder
before insert or update on transactions
for each row
execute function public.set_transaction_reminder();

create index if not exists transactions_reminder_date_idx
on transactions (reminder_date)
where reminder_sent_at is null;
