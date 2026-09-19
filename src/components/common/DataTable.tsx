import React, { useState, useMemo } from 'react';
import { Download, Search, ChevronLeft, ChevronRight, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { TRANSLATIONS } from '../../utils/translations';

export interface ColumnDef<T> {
  headerTh: string;
  headerEn: string;
  accessor: keyof T | ((row: T) => any);
  cell?: (value: any, row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  filename?: string;
  defaultSortKey?: string;
  defaultSortDirection?: 'asc' | 'desc';
  titleTh?: string;
  titleEn?: string;
  isExpandable?: boolean;
  defaultExpanded?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  filename = 'asean_tourism_data.csv',
  defaultSortKey,
  defaultSortDirection = 'desc',
  titleTh = 'ตารางตรวจสอบข้อมูลเชิงสถิติ',
  titleEn = 'Statistical Data Inspection Table',
  isExpandable = true,
  defaultExpanded = false,
}: DataTableProps<T>) {
  const { language } = useDashboard();
  const t = TRANSLATIONS[language];

  const [expanded, setExpanded] = useState<boolean>(!isExpandable || defaultExpanded);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortKey, setSortKey] = useState<string | null>(defaultSortKey || null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Filter by search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter((row) =>
      Object.values(row).some((val) =>
        val !== null && val !== undefined && String(val).toLowerCase().includes(lower)
      )
    );
  }, [data, searchTerm]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const col = columns.find((c) => String(c.accessor) === sortKey);
      let valA = col ? (typeof col.accessor === 'function' ? col.accessor(a) : a[col.accessor]) : a[sortKey];
      let valB = col ? (typeof col.accessor === 'function' ? col.accessor(b) : b[col.accessor]) : b[sortKey];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return sortDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredData, sortKey, sortDirection, columns]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Handle Sort toggle
  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  // CSV Export
  const exportToCsv = () => {
    const headers = columns.map((c) => (language === 'th' ? c.headerTh : c.headerEn));
    const rows = sortedData.map((row) =>
      columns.map((col) => {
        const val = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
        return `"${String(val ?? '').replace(/"/g, '""')}"`;
      })
    );

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden mt-6">
      {/* Table Toggle Header */}
      <div
        onClick={() => isExpandable && setExpanded(!expanded)}
        className={`px-5 py-3.5 flex items-center justify-between bg-slate-50/70 border-b border-slate-100 ${
          isExpandable ? 'cursor-pointer hover:bg-slate-100/70 transition-colors' : ''
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 tracking-tight">
            {language === 'th' ? titleTh : titleEn}
          </span>
          <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-200 text-slate-700 rounded-full">
            {sortedData.length} {t.entries}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              exportToCsv();
            }}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
            title={t.exportCsv}
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">{t.exportCsv}</span>
          </button>

          {isExpandable && (
            <button className="text-slate-400 hover:text-slate-600">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Table Content */}
      {expanded && (
        <div className="p-4 sm:p-5">
          {/* Controls: Search + PageSize */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={t.search}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-500">
              <span>{t.rowsPerPage}:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-blue"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto custom-scrollbar border border-slate-200 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  {columns.map((col, idx) => {
                    const colKey = String(col.accessor);
                    const isSorted = sortKey === colKey;
                    return (
                      <th
                        key={idx}
                        onClick={() => col.sortable !== false && handleSort(colKey)}
                        className={`px-4 py-2.5 whitespace-nowrap ${
                          col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                        } ${col.sortable !== false ? 'cursor-pointer hover:bg-slate-100 select-none' : ''}`}
                      >
                        <div
                          className={`inline-flex items-center gap-1.5 ${
                            col.align === 'right' ? 'flex-row-reverse' : ''
                          }`}
                        >
                          <span>{language === 'th' ? col.headerTh : col.headerEn}</span>
                          {col.sortable !== false && (
                            <ArrowUpDown
                              className={`w-3 h-3 ${
                                isSorted ? 'text-brand-blue' : 'text-slate-300'
                              }`}
                            />
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400 italic">
                      {language === 'th' ? 'ไม่พบข้อมูลที่ค้นหา' : 'No data matching your search'}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                      {columns.map((col, cIdx) => {
                        const val =
                          typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
                        return (
                          <td
                            key={cIdx}
                            className={`px-4 py-2.5 whitespace-nowrap text-slate-700 ${
                              col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                            }`}
                          >
                            {col.cell ? col.cell(val, row) : val}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 text-xs text-slate-500">
            <div>
              {t.showing} {Math.min(sortedData.length, (currentPage - 1) * pageSize + 1)} {t.to}{' '}
              {Math.min(sortedData.length, currentPage * pageSize)} {t.of} {sortedData.length} {t.entries}
            </div>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-medium text-slate-700">
                {currentPage} / {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
