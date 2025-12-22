alter table accounts
add column if not exists include_in_monthly_summary boolean not null default true;

update accounts
set include_in_monthly_summary = true
where include_in_monthly_summary is null;
