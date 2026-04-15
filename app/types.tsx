// TYPES
export type RawRecord = {
  participant_id: number;
  course_id: number;
  course_title: string | null;
  completion: number | null;
  first_accessed: string | null;
  last_accessed: string | null;
};

export type CellData = {
  completion: number | null;
  first_accessed: string | null;
  last_accessed: string | null;
  metadata?: {
    time_first_accessed: string;
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
