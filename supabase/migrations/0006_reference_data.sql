-- 0006_reference_data.sql: Guides and checklist items from docs/content/guides.md

-- Guide 1: Vehicle finance
insert into public.guides (id, slug, title, summary, icon, body, sort_order)
values (
  '99999999-9999-9999-9999-000000000001',
  'vehicle-finance',
  'Vehicle finance',
  'Instalments, balloon payments and what dealers check.',
  'car',
  '#### How it works

Vehicle finance lets you buy a car and pay for it in monthly instalments over a fixed term, usually between 12 and 72 months. The bank owns the car until the last payment is made, so you can''t sell it without settling the loan first.

Your instalment depends on the price of the car, your deposit, the interest rate, the term and any balloon payment. A longer term or a balloon payment makes the instalment smaller, but you pay more interest in total.

While the car is financed, the bank will require comprehensive car insurance. Add the insurance, fuel and maintenance to the instalment when you work out what you can really afford.

#### Words to know

- **Deposit:** money you pay upfront, which lowers the amount you borrow.
- **Balloon payment:** a large lump sum you pay at the end of the term, which makes monthly instalments lower.
- **Interest rate:** the yearly cost of borrowing, usually linked to the prime rate, so your instalment can change when prime changes.
- **Term:** the number of months you have to pay back the loan.
- **Settlement amount:** what you would need to pay today to close the loan early.

#### What lenders check

- Your gross and take-home income, from your latest payslips and bank statements.
- Your existing debt repayments and living expenses, to see if you can afford one more instalment.
- Your credit report: how you have paid other accounts, and any judgments or defaults.
- How long you have been employed, and whether your income is regular.
- Your ID, driver''s licence and proof of address.',
  1
) on conflict (slug) do nothing;

insert into public.checklist_items (guide_id, text, sort_order)
values
  ('99999999-9999-9999-9999-000000000001', 'I have my 3 latest payslips', 1),
  ('99999999-9999-9999-9999-000000000001', 'I have my last 3 months'' bank statements', 2),
  ('99999999-9999-9999-9999-000000000001', 'I have my ID and driver''s licence', 3),
  ('99999999-9999-9999-9999-000000000001', 'I have proof of address from the last 3 months', 4),
  ('99999999-9999-9999-9999-000000000001', 'I''ve checked my free credit report', 5),
  ('99999999-9999-9999-9999-000000000001', 'My Room covers the instalment I''m planning', 6)
on conflict (guide_id, sort_order) do nothing;


-- Guide 2: Personal loans
insert into public.guides (id, slug, title, summary, icon, body, sort_order)
values (
  '99999999-9999-9999-9999-000000000002',
  'personal-loans',
  'Personal loans',
  'How personal loans work and what they really cost.',
  'hand-coins',
  '#### How it works

A personal loan gives you a lump sum that you pay back in fixed monthly instalments over an agreed term. Most personal loans are unsecured, which means you don''t put up a car or a house as security. Because of that, the interest rate is usually higher than on vehicle finance or a home loan.

The real cost is more than the interest. Lenders can also charge an initiation fee, a monthly service fee and credit life insurance. Before you sign, the lender must give you a quote that shows the total amount you will pay back over the full term.

Borrow only what you need, for something with a clear purpose. Using a new loan to pay off old debt can help only if the new repayment is lower and you close the old accounts.

#### Words to know

- **Unsecured loan:** a loan with no asset as security, so the lender relies on your income and credit record.
- **Initiation fee:** a once-off fee for setting up the loan, often added to the amount you owe.
- **Service fee:** a monthly admin fee added to every instalment.
- **Credit life insurance:** cover that pays the loan if you die or can''t work; you may use your own insurer instead of the lender''s.
- **Total cost of credit:** everything you will pay back, including interest, fees and insurance.

#### What lenders check

- Your income and how regular it is, from your payslips and bank statements.
- Your debt-to-income ratio and what is left each month after expenses.
- Your credit report, including recent applications for credit.
- Whether you are employed, and for how long.',
  2
) on conflict (slug) do nothing;

insert into public.checklist_items (guide_id, text, sort_order)
values
  ('99999999-9999-9999-9999-000000000002', 'I have my 3 latest payslips', 1),
  ('99999999-9999-9999-9999-000000000002', 'I have my last 3 months'' bank statements', 2),
  ('99999999-9999-9999-9999-000000000002', 'I''ve compared the total cost of credit from 2 or more lenders', 3),
  ('99999999-9999-9999-9999-000000000002', 'I''ve checked my free credit report', 4),
  ('99999999-9999-9999-9999-000000000002', 'My Room covers the new instalment', 5)
on conflict (guide_id, sort_order) do nothing;


-- Guide 3: Credit cards
insert into public.guides (id, slug, title, summary, icon, body, sort_order)
values (
  '99999999-9999-9999-9999-000000000003',
  'credit-cards',
  'Credit cards',
  'Limits, interest-free days and minimum payments.',
  'credit-card',
  '#### How it works

A credit card gives you a credit limit that you can spend up to and pay back over time. Each month you get a statement that shows what you owe and the minimum payment due.

If you pay the full balance by the due date, most cards charge no interest on purchases for that month. If you pay only the minimum, interest is charged on the rest, and the debt can take years to clear.

Cash withdrawals with a credit card usually cost more: there is a fee, and interest starts from the day you draw the cash. Cards may also have a monthly or yearly fee.

#### Words to know

- **Credit limit:** the most you are allowed to owe on the card.
- **Interest-free period:** the days between buying something and the payment due date when no interest is charged, if you pay in full.
- **Minimum payment:** the smallest amount you must pay each month to keep the account in good standing.
- **Limit increase:** a higher credit limit offered by the bank; you can say no.
- **Revolving credit:** credit you can use, repay and use again, up to your limit.

#### What lenders check

- Your income, from your payslips and bank statements.
- Your existing debt repayments and how much room you have each month.
- Your credit report, including how you have paid other cards and store accounts.
- How much of your current credit limits you are already using.',
  3
) on conflict (slug) do nothing;

insert into public.checklist_items (guide_id, text, sort_order)
values
  ('99999999-9999-9999-9999-000000000003', 'I have my 3 latest payslips', 1),
  ('99999999-9999-9999-9999-000000000003', 'I have my last 3 months'' bank statements', 2),
  ('99999999-9999-9999-9999-000000000003', 'I''ve checked my free credit report', 3),
  ('99999999-9999-9999-9999-000000000003', 'I have a plan to pay the full balance each month', 4),
  ('99999999-9999-9999-9999-000000000003', 'My Room covers the minimum payment on the full limit', 5)
on conflict (guide_id, sort_order) do nothing;
