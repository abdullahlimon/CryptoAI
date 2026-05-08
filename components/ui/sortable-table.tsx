"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortableColumn = {
  key: string;
  header: React.ReactNode;
  align?: "left" | "right";
  className?: string;
  hideOn?: "sm" | "md";
  sortable?: boolean;
};

export type SortableRow = {
  /** Stable React key. */
  key: string;
  /** Optional click target. */
  href?: string;
  /** Pre-rendered cells, parallel to columns. */
  cells: React.ReactNode[];
  /** Parallel array of values used to sort that column.
   * `null` / `undefined` sort to the bottom. Length must match columns. */
  sort: Array<number | string | null | undefined>;
};

type Props = {
  rows: SortableRow[];
  columns: SortableColumn[];
  initialSort?: { key: string; dir: "asc" | "desc" };
  empty?: React.ReactNode;
  className?: string;
};

export function SortableTable({
  rows,
  columns,
  initialSort,
  empty,
  className,
}: Props) {
  const [sort, setSort] = React.useState<{
    key: string;
    dir: "asc" | "desc";
  } | null>(initialSort ?? null);

  const colIndex = React.useMemo(
    () => Object.fromEntries(columns.map((c, i) => [c.key, i])),
    [columns],
  );

  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const i = colIndex[sort.key];
    if (i == null) return rows;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a.sort[i];
      const bv = b.sort[i];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * dir;
      }
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [rows, sort, colIndex]);

  const onHeaderClick = (col: SortableColumn) => {
    if (!col.sortable) return;
    setSort((prev) => {
      if (prev?.key !== col.key) return { key: col.key, dir: "desc" };
      if (prev.dir === "desc") return { key: col.key, dir: "asc" };
      return null;
    });
  };

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-[1] bg-card/95 text-[10px] uppercase tracking-wider text-muted-foreground backdrop-blur">
          <tr className="border-b border-border">
            {columns.map((col) => {
              const active = sort?.key === col.key;
              return (
                <th
                  key={col.key}
                  className={cn(
                    "px-3 py-2 font-medium",
                    col.align === "right" ? "text-right" : "text-left",
                    col.hideOn === "sm" && "hidden sm:table-cell",
                    col.hideOn === "md" && "hidden md:table-cell",
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => onHeaderClick(col)}
                      className={cn(
                        "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                        active && "text-primary",
                      )}
                    >
                      {col.header}
                      <SortIcon
                        active={active}
                        dir={active ? sort!.dir : undefined}
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-10 text-center text-xs text-muted-foreground"
              >
                {empty ?? "No data."}
              </td>
            </tr>
          )}
          {sorted.map((row) => (
            <tr
              key={row.key}
              className={cn(
                "group border-b border-border/50 transition-colors last:border-0",
                row.href && "cursor-pointer hover:bg-accent/40",
              )}
              onClick={
                row.href
                  ? (e) => {
                      if ((e.target as HTMLElement).closest("a,button,input")) {
                        return;
                      }
                      window.location.href = row.href!;
                    }
                  : undefined
              }
            >
              {columns.map((col, i) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-3 py-2",
                    col.align === "right" ? "text-right" : "text-left",
                    col.hideOn === "sm" && "hidden sm:table-cell",
                    col.hideOn === "md" && "hidden md:table-cell",
                    col.className,
                  )}
                >
                  {row.href && i === 0 ? (
                    <Link
                      href={row.href}
                      className="block focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    >
                      {row.cells[i]}
                    </Link>
                  ) : (
                    row.cells[i]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortIcon({
  active,
  dir,
}: {
  active: boolean;
  dir?: "asc" | "desc";
}) {
  if (!active) return <ChevronsUpDown className="h-3 w-3 opacity-50" />;
  return dir === "asc" ? (
    <ArrowUp className="h-3 w-3" />
  ) : (
    <ArrowDown className="h-3 w-3" />
  );
}
