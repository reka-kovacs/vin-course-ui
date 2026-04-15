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
import { formatCell, courseComparator, getColor } from "./helpers";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
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

export type CellData = {
  completion: number | null;
  last_accessed: string | null;
  metadata?: {
    time_last_accessed: string;
  };
};

// COMPONENT
export default function MyTable() {
  const [rowData, setRowData] = useState<any>([]);
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
        const response = await fetch(
          "http://localhost:3001/api/progress/crosstab",
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        const rowData = (data.participants ?? []).map((p: string) => ({
          participant_id: p,
          ...data.matrix?.[p],
        }));

        const sortedCourses = [...(data.courses ?? [])].sort(
          (a, b) => a.id - b.id,
        );

        const colDefs = [
          {
            field: "participant_id",
            headerName: "Participant ID",
            pinned: "left",
            sortable: true,
          },
          ...sortedCourses.map((c: any) => ({
            field: c.id,
            headerName: `Course ${c.id}`,
            sortable: true,
            valueFormatter: (params: any) => formatCell(params.value),
            cellStyle: (params: any) => ({
              backgroundColor: getColor(params.value?.completion),
            }),
            comparator: courseComparator,
          })),
        ];

        setRowData(rowData);
        setColData(colDefs);
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
            domLayout={"autoHeight"}
          />
        </div>
      </AgGridProvider>
    </div>
  );
}

const myTheme = themeQuartz.withParams({
  accentColor: "#3575A8",
  browserColorScheme: "light",
  headerBackgroundColor: "#EEEAEA",
  columnBorder: true,
  fontFamily: {
    googleFont: "Roboto",
  },
  fontSize: 15,
  headerRowBorder: true,
  oddRowBackgroundColor: "#EEEAEA",
});
