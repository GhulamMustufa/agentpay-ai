"use client";

import { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ColDef,
  ICellRendererParams,
  ModuleRegistry,
  colorSchemeDark,
  colorSchemeLight,
  themeQuartz,
} from "ag-grid-community";
import { Download, ExternalLink } from "lucide-react";
import { LedgerRecord } from "@/lib/storage/ledger";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/Button";

ModuleRegistry.registerModules([AllCommunityModule]);

interface LedgerHistoryGridProps {
  records: LedgerRecord[];
}

export function LedgerHistoryGrid({ records }: LedgerHistoryGridProps) {
  const { theme } = useTheme();
  const gridRef = useRef<AgGridReact<LedgerRecord>>(null);

  const gridTheme = useMemo(() => {
    const scheme = theme === "dark" ? colorSchemeDark : colorSchemeLight;
    return themeQuartz.withPart(scheme).withParams({
      backgroundColor: "transparent",
      headerBackgroundColor: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)",
      borderColor: theme === "dark" ? "rgba(255,255,255,0.09)" : "rgba(15,23,42,0.1)",
      fontFamily: "inherit",
      fontSize: 11,
      rowVerticalPaddingScale: 0.85,
    });
  }, [theme]);

  const colDefs = useMemo<ColDef<LedgerRecord>[]>(
    () => [
      {
        field: "timestamp",
        headerName: "Date",
        width: 105,
        valueFormatter: (p) => (p.value ? new Date(p.value).toLocaleDateString() : ""),
      },
      {
        field: "item",
        headerName: "Product & Store",
        minWidth: 200,
        flex: 1.5,
        cellRenderer: (params: ICellRendererParams<LedgerRecord>) => {
          const r = params.data;
          if (!r) return null;
          return (
            <span className="truncate">
              <span className="font-medium text-foreground">{r.item}</span>{" "}
              <span className="text-muted-foreground">({r.merchant})</span>
            </span>
          );
        },
      },
      {
        field: "paidAmount",
        headerName: "Price Paid",
        width: 105,
        cellRenderer: (params: ICellRendererParams<LedgerRecord>) => {
          const r = params.data;
          if (!r) return null;
          return <span className="text-emerald-400 font-semibold">${r.paidAmount.toFixed(2)}</span>;
        },
      },
      {
        field: "moneySaved",
        headerName: "Money Saved",
        width: 115,
        cellRenderer: (params: ICellRendererParams<LedgerRecord>) => {
          const r = params.data;
          if (!r) return null;
          return <span className="text-purple-400 font-semibold">+${r.moneySaved.toFixed(2)}</span>;
        },
      },
      {
        field: "paypalOrderId",
        headerName: "PayPal Order ID",
        minWidth: 160,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<LedgerRecord>) => {
          const r = params.data;
          if (!r) return null;
          return r.receiptUrl ? (
            <a
              href={r.receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-mono text-[10px] text-primary hover:underline"
            >
              #{r.paypalOrderId} <ExternalLink className="w-2.5 h-2.5" />
            </a>
          ) : (
            <span className="font-mono text-[10px] text-primary">#{r.paypalOrderId}</span>
          );
        },
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef<LedgerRecord>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
    }),
    []
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => gridRef.current?.api?.exportDataAsCsv({ fileName: "agentpay-ledger.csv" })}
          className="h-6 px-2 text-[10px]"
        >
          <Download className="w-2.5 h-2.5 mr-1" /> Export Ledger CSV
        </Button>
      </div>
      <div className="w-full rounded-lg overflow-hidden border border-border/60">
        <AgGridReact<LedgerRecord>
          ref={gridRef}
          theme={gridTheme}
          rowData={records}
          columnDefs={colDefs}
          defaultColDef={defaultColDef}
          domLayout="autoHeight"
          suppressCellFocus={true}
          rowHeight={36}
          headerHeight={32}
        />
      </div>
    </div>
  );
}

