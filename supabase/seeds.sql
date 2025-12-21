-- Seed data for Financas Desktop
-- Replace USER_ID with your auth user id before running.

DO $$
DECLARE
  user_id uuid := '03aeaeda-7ca3-471b-a281-ecd52eca1fb8';
  acc_wallet uuid := gen_random_uuid();
  acc_checking uuid := gen_random_uuid();
  acc_savings uuid := gen_random_uuid();
  cat_food uuid := gen_random_uuid();
  cat_restaurant uuid := gen_random_uuid();
  cat_market uuid := gen_random_uuid();
  cat_home uuid := gen_random_uuid();
  cat_rent uuid := gen_random_uuid();
  cat_util uuid := gen_random_uuid();
  cat_income uuid := gen_random_uuid();
BEGIN
  insert into accounts (id, user_id, name, initial_balance)
  values
    (acc_wallet, user_id, 'Carteira', 350.00),
    (acc_checking, user_id, 'Conta Corrente', 4200.00),
    (acc_savings, user_id, 'Poupanca', 12000.00);

  insert into categories (id, user_id, name, parent_id, allowed_type)
  values
    (cat_food, user_id, 'Alimentacao', null, 'expense'),
    (cat_restaurant, user_id, 'Restaurante', cat_food, 'expense'),
    (cat_market, user_id, 'Supermercado', cat_food, 'expense'),
    (cat_home, user_id, 'Casa', null, 'expense'),
    (cat_rent, user_id, 'Aluguel', cat_home, 'expense'),
    (cat_util, user_id, 'Utilidades', cat_home, 'expense'),
    (cat_income, user_id, 'Salario', null, 'income');

  insert into transactions (user_id, date, description, type, amount, account_id, category_id, cleared)
  values
    (user_id, '2025-12-01', 'Salario Dezembro', 'income', 8500.00, acc_checking, cat_income, true),
    (user_id, '2025-12-02', 'Supermercado Central', 'expense', 420.50, acc_checking, cat_market, true),
    (user_id, '2025-12-02', 'Restaurante Vila', 'expense', 135.20, acc_wallet, cat_restaurant, false),
    (user_id, '2025-12-05', 'Aluguel', 'expense', 2100.00, acc_checking, cat_rent, true),
    (user_id, '2025-12-06', 'Conta de energia', 'expense', 248.90, acc_checking, cat_util, false);

  insert into transactions (user_id, date, description, type, amount, account_from_id, account_to_id, cleared)
  values
    (user_id, '2025-12-03', 'Transferencia para poupanca', 'transfer', 800.00, acc_checking, acc_savings, true);
END $$;
