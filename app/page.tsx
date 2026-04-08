"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ClientSideRowModelModule,
  ColDef,
  ColumnApiModule,
  ColumnAutoSizeModule,
  ValidationModule,
  CellStyleModule,
  ModuleRegistry,
  PaginationModule,
  QuickFilterModule,
  themeQuartz,
} from "ag-grid-community";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { RowInfo, RawRecord, TransformedData, CellData, Course } from "./types";
import { formatCell, getColor } from "./helpers";
import "./page.css";

const modules = [
  CellStyleModule,
  PaginationModule,
  ColumnApiModule,
  ColumnAutoSizeModule,
  ClientSideRowModelModule,
  CellStyleModule,
  QuickFilterModule,
  ...(process.env.NODE_ENV !== "production" ? [ValidationModule] : []),
];

ModuleRegistry.registerModules(modules);

// TRANSFORMATION
function transformDataForTable(data: RawRecord[]): TransformedData {
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
      };
    },
    comparator: (a: CellData, b: CellData) => {
      const valA = a?.completion ?? -1;
      const valB = b?.completion ?? -1;
      // if completion percentages are equal, sort by last accessed date
      if (valA === valB) {
        const dateA = a?.last_accessed
          ? new Date(a.last_accessed).getTime()
          : 0;
        const dateB = b?.last_accessed
          ? new Date(b.last_accessed).getTime()
          : 0;
        return dateA - dateB;
      }
      return valA - valB;
    },
  }));

  // sort columns by increasing course ID
  dynamicCols.sort((a, b) => {
    const idA = parseInt(a.field?.toString() || "0") || 0;
    const idB = parseInt(b.field?.toString() || "0") || 0;
    return idA - idB;
  });

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

  const gridRef = useRef<AgGridReact>(null);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 160,
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
        const transformed = transformDataForTable(res);

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

  const onFilterTextBoxChanged = useCallback(() => {
    gridRef.current!.api.setGridOption(
      "quickFilterText",
      (document.getElementById("search-text-box") as HTMLInputElement).value,
    );
  }, []);

  if (loading) {
    return <div className="info-container">Loading...</div>;
  }

  if (error) {
    return <div className="info-container">Error: {error}</div>;
  }

  return (
    <div className="min-h-full">
      <header className="header">
        <div className="header-content">
          <div className="gradient-text">VIN Course Progress</div>
          <a
            href="https://www.vin.com/vin/default.aspx?pId=130&id=8285988"
            target="_blank"
            className="learn-button"
          >
            Learn More
          </a>
        </div>
      </header>

      <AgGridProvider modules={modules}>
        <div className="grid-wrapper">
          <div className="search-box">
            <span className="search-label">Search Participants:</span>
            <input
              className="search-input"
              type="text"
              id="search-text-box"
              placeholder="Search..."
              onInput={onFilterTextBoxChanged}
            />
          </div>

          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={colData}
            theme={myTheme}
            loadThemeGoogleFonts={true}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
            animateRows={true}
            domLayout="autoHeight"
          />
        </div>
      </AgGridProvider>
    </div>
  );
}

const myTheme = themeQuartz.withParams({
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
