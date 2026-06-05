// Domínio de filamentos e estoque por local: tipos + lógica pura (sem I/O),
// testável isolada. O filamento descreve o material (cor/material obrigatórios);
// o estoque (filament_stock) guarda rolos por local — em estoque e encomendados.
// As server actions usam `filamentSchema` (./schema) antes de tocar no banco.

// Materiais comuns de impressão 3D FDM. A coluna é text livre no banco, mas a UI
// restringe à lista para padronizar os valores (agrupar, alertar estoque baixo).
export const MATERIALS = [
  "PLA",
  "PETG",
  "ABS",
  "TPU",
  "ASA",
  "Nylon",
  "PC",
] as const;

export type Material = (typeof MATERIALS)[number];

export type Filament = {
  id: string;
  color: string;
  material: string;
  brand: string | null;
  weight: string | null;
  low_stock_threshold: number;
  created_at: string;
  updated_at: string;
};

// Estoque de um filamento em um local específico (rolos).
export type FilamentStock = {
  filament_id: string;
  location_id: string;
  in_stock: number;
  on_order: number;
  updated_at: string;
};

// Campos ajustáveis pelo +/- de um toque.
export type StockField = "in_stock" | "on_order";

// Aplica um delta a uma contagem de rolos, sem deixar ficar negativo —
// espelha o `check (... >= 0)` do banco para o ajuste rápido não estourar.
export function applyStockDelta(current: number, delta: number): number {
  return Math.max(0, current + delta);
}

// Rótulo curto de um filamento para listas/cabeçalhos (ex.: "Preto · PLA").
export function filamentLabel(filament: Pick<Filament, "color" | "material">): string {
  return `${filament.color} · ${filament.material}`;
}
