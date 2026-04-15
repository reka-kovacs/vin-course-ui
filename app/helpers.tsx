import { CellData } from "./types";

// HELPERS
export function formatCell(cell?: CellData) {
  if (
    !cell ||
    (!cell.completion && !cell.last_accessed && !cell.first_accessed)
  )
    return "—";

  const percent =
    cell.completion != null ? `${(cell.completion * 100).toFixed(0)}%` : "N/A";

  let date = cell.last_accessed
    ? new Date(cell.last_accessed).toLocaleDateString()
    : "—";
  // if no last accessed date, try first accessed date
  if (date === "—" && cell.first_accessed) {
    date = new Date(cell.first_accessed).toLocaleDateString();
  }

  // could be use to show tooltip with last accessed time
  let time = cell.metadata?.time_last_accessed
    ? new Date(cell.metadata.time_last_accessed).toLocaleTimeString()
    : "—";
  // if no last accessed time, try first accessed time
  if (time === "—" && cell.metadata?.time_first_accessed) {
    time = new Date(cell.metadata.time_first_accessed).toLocaleTimeString();
  }

  return `${percent}\n${date}`;
}

export function getColor(completion?: number | null) {
  if (completion == null) return "transparent";
  if (completion < 0.5) return "#f8b9b9";
  if (completion < 0.8) return "#f1e09b";
  return "#a7f5c4";
}

export function courseComparator(a: CellData, b: CellData) {
  const valA = a?.completion ?? -1;
  const valB = b?.completion ?? -1;

  if (valA === valB) {
    const dateA = a?.last_accessed ? new Date(a.last_accessed).getTime() : 0;
    const dateB = b?.last_accessed ? new Date(b.last_accessed).getTime() : 0;
    return dateA - dateB;
  }

  return valA - valB;
}
