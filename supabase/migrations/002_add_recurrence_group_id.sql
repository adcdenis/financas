alter table transactions
add column if not exists recurrence_group_id uuid;

create index if not exists transactions_recurrence_group_id_idx
  on transactions (recurrence_group_id);
