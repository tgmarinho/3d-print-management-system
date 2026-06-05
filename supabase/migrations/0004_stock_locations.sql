-- Locais de estoque: nome único (case-insensitive) e locais reais iniciais.

-- Impede dois locais com o mesmo nome (ignorando caixa); reforça a checagem da app.
create unique index if not exists stock_locations_name_lower_idx
  on public.stock_locations (lower(name));

-- Locais reais com que a operação já começa; idempotente.
insert into public.stock_locations (name)
select v.name
from (values ('casa da Karen'), ('casa da Letícia')) as v(name)
where not exists (
  select 1 from public.stock_locations s
  where lower(s.name) = lower(v.name)
);
