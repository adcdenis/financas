create table if not exists dbativo (
  id uuid primary key default gen_random_uuid(),
  ativo boolean not null default true,
  data_hora timestamptz not null default now()
);

insert into dbativo (ativo, data_hora)
values (true, now());
