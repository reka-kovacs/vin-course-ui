import { CellData } from "./page";

// HELPERS
export function formatCell(cell?: CellData) {
  if (!cell || (cell.completion == null && !cell.last_accessed)) return "—";

  const percent =
    cell.completion != null ? `${(cell.completion * 100).toFixed(0)}%` : "N/A";

  let date = cell.last_accessed
    ? new Date(cell.last_accessed).toLocaleDateString()
    : "—";

  return `${percent}\n${date}`;
}

export function getColor(completion?: number | null) {
  if (completion == null) return "transparent";
  if (completion < 0.5) return "#f8b9b9";
  if (completion < 0.8) return "#f1e09b";
  return "#a7f5c4";
}

export function courseComparator(valueA: any, valueB: any) {
  const a = valueA as CellData | undefined;
  const b = valueB as CellData | undefined;

  const valA = a?.completion ?? -1;
  const valB = b?.completion ?? -1;

  if (valA === valB) {
    const dateA = a?.last_accessed ? new Date(a.last_accessed).getTime() : 0;
    const dateB = b?.last_accessed ? new Date(b.last_accessed).getTime() : 0;
    return dateA - dateB;
  }

  return valA - valB;
}
