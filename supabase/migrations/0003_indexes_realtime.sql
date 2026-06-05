-- Índices para filtros/joins frequentes.
create index orders_client_id_idx on public.orders (client_id);
create index orders_production_status_idx on public.orders (production_status);
create index orders_payment_status_idx on public.orders (payment_status);
create index orders_queue_position_idx on public.orders (queue_position);
create index filament_stock_location_idx on public.filament_stock (location_id);
create index audit_log_created_at_idx on public.audit_log (created_at desc);

-- Realtime: estoque e pedidos atualizam ao vivo entre usuários.
alter publication supabase_realtime add table public.filament_stock;
alter publication supabase_realtime add table public.orders;
