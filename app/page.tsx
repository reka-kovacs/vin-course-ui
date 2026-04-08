"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ClientSideRowModelModule,
  ColDef,
  ColumnApiModule,
  ColumnAutoSizeModule,
  ValidationModule,
  CellStyleModule,
  ModuleRegistry,
  PaginationModule,
} from "ag-grid-community";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { RowInfo, RawRecord, TransformedData, CellData, Course } from "./types";
import { formatCell, getColor } from "./helpers";
import { myTheme } from "./types";

const modules = [
  CellStyleModule,
  PaginationModule,
  ColumnApiModule,
  ColumnAutoSizeModule,
  ClientSideRowModelModule,
  CellStyleModule,
  ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
];

ModuleRegistry.registerModules(modules);

// TRANSFORMATION
function transformForTable(data: RawRecord[]): TransformedData {
  const participants: Record<number, RowInfo> = {};
  const coursesMap = new Map<number, string>();

  data.forEach((row) => {
    const {
      participant_id,
      course_id,
      course_title,
      completion,
      last_accessed,
    } = row;

    if (!participants[participant_id]) {
      participants[participant_id] = {
        participant_id,
      };
    }

    participants[participant_id][course_id] = {
      completion,
      last_accessed,
      metadata: {
        time_last_accessed: last_accessed || "",
      },
    };

    if (!coursesMap.has(course_id)) {
      coursesMap.set(course_id, course_title || `Course ${course_id}`);
    }
  });

  return {
    rows: Object.values(participants),
    courses: Array.from(coursesMap.entries()).map(([id, title]) => ({
      id,
      title,
    })),
  };
}

function transformColumns(courses: Course[]): ColDef[] {
  const dynamicCols: ColDef[] = courses.map((course) => ({
    field: String(course.id),
    headerName: "Course " + String(course.id),
    sortable: true,
    valueFormatter: (params) => formatCell(params.value),
    cellStyle: function (params) {
      return {
        backgroundColor: getColor(params.value?.completion),
        color: "#faf5f5",
      };
    },
    comparator: (a: CellData, b: CellData) => {
      const valA = a?.completion ?? -1;
      const valB = b?.completion ?? -1;
      return valA - valB;
    },
  }));

  const cols: ColDef[] = [
    {
      field: "participant_id",
      headerName: "Participant",
      pinned: "left",
      sortable: true,
    },
    ...dynamicCols,
  ];

  return cols;
}

// COMPONENT
export default function MyTable() {
  const [rowData, setRowData] = useState<RowInfo[]>([]);
  const [colData, setColData] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 120,
      resizable: true,
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/progress");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const res = await response.json();
        // const rawData: RawRecord[] = res;
        const transformed = transformForTable(res);

        setRowData(transformed.rows);
        setColData(transformColumns(transformed.courses));
      } catch (error: any) {
        setError(error.message);
        setRowData([]);
        setColData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // empty dependency array to run only once

  if (loading) {
    return <div className="info-container">Loading...</div>;
  }

  if (error) {
    return <div className="info-container">Error: {error}</div>;
  }

  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            VIN Course Progress
          </div>

          {/* CTA Button */}
          <a
            href="#"
            className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-700 transition"
          >
            Learn More
          </a>
        </div>
      </header>

      <div>
        <AgGridProvider modules={modules}>
          <div
            style={{
              width: "100%",
              height: "81vh",
              fontFamily: "Roboto, sans-serif",
            }}
          >
            <AgGridReact
              rowData={rowData}
              columnDefs={colData}
              theme={myTheme}
              defaultColDef={defaultColDef}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              animateRows={true}
            />
          </div>
        </AgGridProvider>
      </div>
    </div>
  );
}
