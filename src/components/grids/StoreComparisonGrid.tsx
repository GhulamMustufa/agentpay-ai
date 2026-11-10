"use client";

import { useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ColDef,
  ICellRendererParams,
  ModuleRegistry,
  RowClassParams,
  colorSchemeDark,
  colorSchemeLight,
  themeQuartz,
} from "ag-grid-community";
import { Check, Download, Search, XCircle } from "lucide-react";
import { ShoppingQuote } from "@/lib/ai/shopping-agent";
import { useTheme } from "@/components/ThemeProvider";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

ModuleRegistry.registerModules([AllCommunityModule]);

interface StoreComparisonGridProps {
  quotes: ShoppingQuote[];
}

export function StoreComparisonGrid({ quotes }: StoreComparisonGridProps) {
  const { theme } = useTheme();
  const gridRef = useRef<AgGridReact<ShoppingQuote>>(null);
  const [quickFilter, setQuickFilter] = useState("");

  const gridTheme = useMemo(() => {
    const scheme = theme === "dark" ? colorSchemeDark : colorSchemeLight;
    return themeQuartz.withPart(scheme).withParams({
      backgroundColor: "transparent",
      headerBackgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)",
      borderColor: theme === "dark" ? "rgba(255,255,255,0.09)" : "rgba(15,23,42,0.1)",
      fontFamily: "inherit",
      fontSize: 12,
      rowVerticalPaddingScale: 0.9,
    });
  }, [theme]);

  const colDefs = useMemo<ColDef<ShoppingQuote>[]>(
    () => [
      {
        field: "vendor",
        headerName: "Seller / Store",
        minWidth: 200,
        flex: 1.4,
        cellRenderer: (params: ICellRendererParams<ShoppingQuote>) => {
          const row = params.data;
          if (!row) return null;
          return (
            <div className="flex items-center gap-1.5 font-medium h-full">
              {!row.isCompliant ? (
                <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              ) : (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              <span className="truncate">{row.vendor}</span>
            </div>
          );
        },
      },
      {
        field: "item",
        headerName: "Item",
        minWidth: 180,
        flex: 1.3,
        tooltipField: "specs",
      },
      {
        field: "price",
        headerName: "Price",
        width: 110,
        sort: "asc",
        cellRenderer: (params: ICellRendererParams<ShoppingQuote>) => {
          const row = params.data;
          if (!row) return null;
          return (
            <span className={`font-semibold ${!row.isCompliant ? "text-rose-400" : "text-emerald-400"}`}>
              ${row.price.toFixed(2)}
            </span>
          );
        },
      },
      {
        headerName: "Fee & Rule Check",
        minWidth: 220,
        flex: 1.5,
        valueGetter: (params) => {
          const row = params.data;
          if (!row) return "";
          return !row.isCompliant
            ? `Over budget (+$${row.markup.toFixed(2)} ${row.markupReason || "extra fee"})`
            : `Fair price (${row.warranty})`;
        },
        cellRenderer: (params: ICellRendererParams<ShoppingQuote>) => {
          const row = params.data;
          if (!row) return null;
          return (
            <span className={!row.isCompliant ? "text-rose-300" : "text-emerald-400"}>
              {params.value}
            </span>
          );
        },
      },
      {
        field: "isCompliant",
        headerName: "Decision",
        width: 115,
        cellRenderer: (params: ICellRendererParams<ShoppingQuote>) => {
          const row = params.data;
          if (!row) return null;
          return (
            <div className="flex items-center h-full">
              {!row.isCompliant ? (
                <Badge variant="destructive" className="text-[10px]">
                  Blocked
                </Badge>
              ) : (
                <Badge variant="success" className="text-[10px]">
                  Approved
                </Badge>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef<ShoppingQuote>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  const getRowStyle = (params: RowClassParams<ShoppingQuote>) => {
    if (params.data?.isCompliant) {
      return { backgroundColor: "rgba(16, 185, 129, 0.05)" };
    }
    return undefined;
  };

  const handleExportCsv = () => {
    gridRef.current?.api?.exportDataAsCsv({
      fileName: "agentpay-store-comparison.csv",
    });
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
            placeholder="Filter stores, specs, or fees..."
            className="w-full h-7 pl-8 pr-2.5 text-xs rounded-md bg-muted/40 border border-border/70 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground hidden sm:inline">
            Powered by AG Grid
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-7 px-2.5 text-[11px]"
          >
            <Download className="w-3 h-3 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="w-full rounded-lg overflow-hidden border border-border/60">
        <AgGridReact<ShoppingQuote>
          ref={gridRef}
          theme={gridTheme}
          rowData={quotes}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilter}
          domLayout="autoHeight"
          getRowStyle={getRowStyle}
          suppressCellFocus={true}
          rowHeight={42}
          headerHeight={36}
        />
      </div>
    </div>
  );
}

