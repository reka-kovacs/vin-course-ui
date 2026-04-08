import { themeQuartz } from "ag-grid-community";

// TYPES
export type RawRecord = {
  participant_id: number;
  course_id: number;
  course_title: string | null;
  completion: number | null;
  last_accessed: string | null;
};

export type CellData = {
  completion: number | null;
  last_accessed: string | null;
  metadata?: {
    time_last_accessed: string;
  };
};

export type RowInfo = {
  participant_id: number;
  [courseID: number]: CellData | number;
};

export type Course = {
  id: number;
  title: string;
};

// TData
export type TransformedData = {
  rows: RowInfo[];
  courses: Course[];
};

export const myTheme = themeQuartz.withParams({
  accentColor: "#15BDE8",
  backgroundColor: "#0C0C0D",
  borderColor: "#ffffff00",
  borderRadius: 20,
  browserColorScheme: "dark",
  cellHorizontalPaddingScale: 1,
  chromeBackgroundColor: {
    ref: "backgroundColor",
  },
  columnBorder: false,
  fontFamily: {
    googleFont: "Roboto",
  },
  fontSize: 16,
  foregroundColor: "#BBBEC9",
  headerBackgroundColor: "#182226",
  headerFontWeight: 500,
  headerTextColor: "#FFFFFF",
  headerVerticalPaddingScale: 0.9,
  iconSize: 20,
  rowBorder: true,
  rowVerticalPaddingScale: 1.2,
  sidePanelBorder: false,
  spacing: 8,
  wrapperBorder: false,
  wrapperBorderRadius: 0,
});
