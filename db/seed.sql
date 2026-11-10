-- FieldFlow: fictional sample data.
-- Run AFTER schema.sql, in Supabase > SQL Editor.
-- Jobs start without a technician; assign them later from the app.

insert into public.customers (id, name, phone, address) values
  ('c0000000-0000-4000-8000-000000000001', 'Maria Lopez',   '555-0101', '12 Oak Street'),
  ('c0000000-0000-4000-8000-000000000002', 'James Carter',  '555-0102', '48 Pine Avenue'),
  ('c0000000-0000-4000-8000-000000000003', 'Sofia Ramirez', '555-0103', '7 Maple Court'),
  ('c0000000-0000-4000-8000-000000000004', 'David Nguyen',  '555-0104', '90 Cedar Lane');

insert into public.jobs (id, customer_id, title, description, status, price, scheduled_at) values
  ('d0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001',
   'Fix leaking kitchen faucet', 'Faucet drips constantly; replace cartridge.', 'new', 180.00, now() + interval '2 days'),
  ('d0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002',
   'Replace water heater', '40-gallon unit, garage installation.', 'new', 1450.00, now() + interval '4 days'),
  ('d0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000003',
   'Repair garage door opener', 'Opener motor hums but door does not move.', 'new', 320.00, now() + interval '1 day'),
  ('d0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000004',
   'Install bathroom exhaust fan', 'Replace old fan and vent to exterior.', 'done', 420.00, now() - interval '3 days');

-- Costs for the finished job, so the margin report has data.
insert into public.job_costs (job_id, kind, description, quantity, unit_cost) values
  ('d0000000-0000-4000-8000-000000000004', 'material', 'Exhaust fan unit',        1, 85.00),
  ('d0000000-0000-4000-8000-000000000004', 'material', 'Duct and fittings',       1, 32.50),
  ('d0000000-0000-4000-8000-000000000004', 'labor',    'Technician hours',        3, 45.00);
