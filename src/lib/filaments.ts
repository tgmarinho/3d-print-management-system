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

// Estoque baixo: só sinaliza quando há limite configurado (>0) e o total em
// estoque está nele ou abaixo. Fonte única de verdade para lista, editor e
// dashboard — mantém o critério consistente em toda a UI.
export function isLowStock(inStock: number, threshold: number): boolean {
  return threshold > 0 && inStock <= threshold;
}

// Soma o `in_stock` de cada filamento a partir das linhas de filament_stock
// (um filamento tem uma linha por local). Chave: filament_id → total em estoque.
export function sumInStockByFilament(
  rows: Pick<FilamentStock, "filament_id" | "in_stock">[],
): Map<string, number> {
  const total = new Map<string, number>();
  for (const row of rows) {
    total.set(row.filament_id, (total.get(row.filament_id) ?? 0) + row.in_stock);
  }
  return total;
}

// Filamento com o total em estoque e a flag de estoque baixo já resolvidos.
export type FilamentStockSummary = Filament & { inStock: number; low: boolean };

// Junta filamentos com o total em estoque por filamento e marca os baixos.
export function summarizeFilamentStock(
  filaments: Filament[],
  inStockById: Map<string, number>,
): FilamentStockSummary[] {
  return filaments.map((filament) => {
    const inStock = inStockById.get(filament.id) ?? 0;
    return {
      ...filament,
      inStock,
      low: isLowStock(inStock, filament.low_stock_threshold),
    };
  });
}
