"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type Column<T> = {
  key: string;
  header: React.ReactNode;
  /** Renderer for the cell. */
  cell: (row: T) => React.ReactNode;
  /** Value used for sorting; if absent the column is not sortable. */
  sortValue?: (row: T) => number | string | null | undefined;
  align?: "left" | "right";
  className?: string;
  /** Skip stretching this column on narrow viewports. */
  hideOn?: "sm" | "md";
};

type Props<T> = {
  rows: T[];
  columns: Column<T>[];
  rowKey: (row: T) => string;
  rowHref?: (row: T) => string;
  initialSort?: { key: string; dir: "asc" | "desc" };
  empty?: React.ReactNode;
  className?: string;
};

export function SortableTable<T>({
  rows,
  columns,
  rowKey,
  rowHref,
  initialSort,
  empty,
  className,
}: Props<T>) {
  const [sort, setSort] = React.useState<{
    key: string;
    dir: "asc" | "desc";
  } | null>(initialSort ?? null);

  const sorted = React.useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * dir;
      }
      return String(av).localeCompare(String(bv)) * dir;
    });
  }, [rows, columns, sort]);

  const onHeaderClick = (col: Column<T>) => {
    if (!col.sortValue) return;
    setSort((prev) => {
      if (prev?.key !== col.key) return { key: col.key, dir: "desc" };
      if (prev.dir === "desc") return { key: col.key, dir: "asc" };
      return null;
    });
  };

  return (
    <div className={cn("w-full overflow-x-auto", className)}>
      <table className="w-full text-sm">
        <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
          <tr className="border-b border-border">
            {columns.map((col) => {
              const sortable = !!col.sortValue;
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
                  {sortable ? (
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
          {sorted.map((row) => {
            const href = rowHref?.(row);
            return (
              <tr
                key={rowKey(row)}
                className={cn(
                  "group border-b border-border/50 transition-colors last:border-0",
                  href && "cursor-pointer hover:bg-accent/40",
                )}
                onClick={
                  href
                    ? (e) => {
                        // Don't hijack clicks on inner links/buttons.
                        if (
                          (e.target as HTMLElement).closest("a,button,input")
                        ) {
                          return;
                        }
                        window.location.href = href;
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
                    {href && i === 0 ? (
                      <Link
                        href={href}
                        className="block focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      >
                        {col.cell(row)}
                      </Link>
                    ) : (
                      col.cell(row)
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
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
