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

export type TransformedData = {
  rows: RowInfo[];
  courses: Course[];
};

export const myTheme = themeQuartz.withParams({
  accentColor: "#3575A8",
  browserColorScheme: "light",
  columnBorder: true,
  fontFamily: {
    googleFont: "Roboto",
  },
  fontSize: 15,
  headerRowBorder: true,
  oddRowBackgroundColor: "#EEEAEA",
});
