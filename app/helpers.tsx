import { CellData } from "./types";

// HELPERS
export function formatCell(cell?: CellData) {
  if (!cell) return "-";

  const percent =
    cell.completion != null ? `${(cell.completion * 100).toFixed(0)}%` : "N/A";

  const date = cell.last_accessed
    ? new Date(cell.last_accessed).toLocaleDateString()
    : "—";
  const time = cell.last_accessed
    ? new Date(cell.last_accessed).toLocaleTimeString()
    : "—";

  return `${percent}\n${date}`;
}

export function getColor(completion?: number | null) {
  if (completion == null) return "transparent";
  if (completion < 0.5) return "#f87171";
  if (completion < 0.8) return "#facc15";
  return "#4ade80";
}
