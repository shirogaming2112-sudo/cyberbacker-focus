import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  searchKeys,
  searchPlaceholder = "Search…",
  pageSize = 10,
  toolbar,
  empty = "No records found",
  mobileCard,
}: {
  columns: Column<T>[];
  rows: T[];
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  pageSize?: number;
  toolbar?: ReactNode;
  empty?: string;
  mobileCard?: (row: T) => ReactNode;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!q || !searchKeys?.length) return rows;
    const needle = q.toLowerCase();
    return rows.filter((r) =>
      searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(needle)),
    );
  }, [q, rows, searchKeys]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <Card className="overflow-hidden shadow-soft">
      <div className="flex flex-wrap items-center gap-2 border-b p-3">
        {searchKeys && (
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="h-9 pl-8"
            />
          </div>
        )}
        {toolbar}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">Data table</caption>
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                {columns.map((c) => (
                  <th key={c.key} scope="col" className={`px-4 py-2.5 font-medium ${c.className ?? ""}`}>
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    {empty}
                  </td>
                </tr>
              ) : (
                visible.map((row) => (
                  <tr key={row.id} className="border-b transition-colors last:border-0 hover:bg-muted/40 focus-within:bg-muted/40">
                    {columns.map((c) => (
                      <td key={c.key} className={`px-4 py-2.5 align-middle ${c.className ?? ""}`}>
                        {c.cell(row)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          <ul className="divide-y">
            {visible.map((row) => (
              <li key={row.id} className="p-3">
                {mobileCard ? mobileCard(row) : columns.map((c) => (
                  <div key={c.key} className="flex justify-between gap-3 py-0.5 text-sm">
                    <span className="text-muted-foreground">{c.header}</span>
                    <span className="text-right">{c.cell(row)}</span>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 border-t p-3 text-xs text-muted-foreground">
        <span>
          {filtered.length === 0
            ? "0 results"
            : `Showing ${(safePage - 1) * pageSize + 1}-${Math.min(safePage * pageSize, filtered.length)} of ${filtered.length}`}
        </span>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="outline" className="h-7 w-7" disabled={safePage <= 1} onClick={() => setPage((p) => p - 1)} aria-label="Previous page">
            <ChevronLeft className="size-3.5" />
          </Button>
          <span className="px-1 tabular-nums">
            {safePage}/{totalPages}
          </span>
          <Button size="icon" variant="outline" className="h-7 w-7" disabled={safePage >= totalPages} onClick={() => setPage((p) => p + 1)} aria-label="Next page">
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
