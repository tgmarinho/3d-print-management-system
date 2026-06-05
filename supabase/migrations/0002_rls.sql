do $$
declare
  t text;
  tables text[] := array[
    'profiles', 'clients', 'sellers', 'modelers', 'products',
    'stock_locations', 'filaments', 'filament_stock', 'orders', 'audit_log'
  ];
begin
  foreach t in array tables loop
    execute format('alter table public.%I enable row level security;', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true);',
      t || '_authenticated_all', t
    );
  end loop;
end;
$$;
