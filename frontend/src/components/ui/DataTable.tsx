'use client';

import React from 'react';
import { clsx } from 'clsx';
import { Search, Filter, NavArrowDown } from 'iconoir-react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
}

export function DataTable<T>({ columns, data, searchPlaceholder = "Search..." }: DataTableProps<T>) {
  return (
    <div className="w-full flex flex-col">
      {/* Table Action Bar */}
      <div className="flex items-center justify-between py-3 border-b border-hairline bg-canvas">
        <div className="flex items-center gap-2 px-4 w-[320px]">
          <Search height={16} width={16} className="text-ink-muted" />
          <input 
            type="text" 
            placeholder={searchPlaceholder}
            className="w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-muted"
          />
        </div>
        <div className="flex items-center gap-4 px-4">
          <button className="flex items-center gap-2 text-[12px] font-medium text-ink hover:text-ink-muted transition-colors">
            <Filter height={14} width={14} /> Filter
          </button>
          <button className="flex items-center gap-2 text-[12px] font-medium text-ink hover:text-ink-muted transition-colors">
            Sort <NavArrowDown height={14} width={14} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto bg-canvas">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className="px-4 py-3 text-[12px] font-semibold text-ink-muted border-b border-hairline bg-canvas-soft whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[13px] text-ink-muted italic">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-canvas-soft/50 transition-colors group">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-4 py-3 text-[13px] text-ink border-b border-hairline whitespace-nowrap">
                      {col.render ? col.render(item) : String((item as any)[col.key] || '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
