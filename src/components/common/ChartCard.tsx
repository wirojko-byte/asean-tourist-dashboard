import React from 'react';
import { useDashboard } from '../../context/DashboardContext';

interface ChartCardProps {
  titleTh: string;
  titleEn: string;
  subtitleTh?: string;
  subtitleEn?: string;
  children: React.ReactNode;
  actionNode?: React.ReactNode;
  footerNoteTh?: string;
  footerNoteEn?: string;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  titleTh,
  titleEn,
  subtitleTh,
  subtitleEn,
  children,
  actionNode,
  footerNoteTh,
  footerNoteEn,
  className = '',
}) => {
  const { language } = useDashboard();
  const title = language === 'th' ? titleTh : titleEn;
  const subtitle = language === 'th' ? subtitleTh : subtitleEn;
  const footerNote = language === 'th' ? footerNoteTh : footerNoteEn;

  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col ${className}`}>
      {/* Card Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        {actionNode && <div className="flex items-center gap-2 self-end sm:self-auto">{actionNode}</div>}
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 min-h-[300px] flex flex-col justify-center">
        {children}
      </div>

      {/* Optional Card Footer */}
      {footerNote && (
        <div className="px-5 py-2.5 bg-slate-50/60 border-t border-slate-100 text-[11px] text-slate-500 italic">
          {footerNote}
        </div>
      )}
    </div>
  );
};
