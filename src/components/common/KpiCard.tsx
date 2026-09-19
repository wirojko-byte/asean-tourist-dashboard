import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

interface KpiCardProps {
  titleTh: string;
  titleEn: string;
  value: string | number;
  unitTh?: string;
  unitEn?: string;
  change?: number | null;
  changeLabelTh?: string;
  changeLabelEn?: string;
  subtextTh?: string;
  subtextEn?: string;
  status?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  titleTh,
  titleEn,
  value,
  unitTh,
  unitEn,
  change,
  changeLabelTh = 'จากปีก่อนหน้า',
  changeLabelEn = 'vs previous year',
  subtextTh,
  subtextEn,
  status,
  icon,
}) => {
  const { language } = useDashboard();
  const title = language === 'th' ? titleTh : titleEn;
  const unit = language === 'th' ? unitTh : unitEn;
  const subtext = language === 'th' ? subtextTh : subtextEn;
  const changeLabel = language === 'th' ? changeLabelTh : changeLabelEn;

  const resolvedStatus =
    status || (change !== undefined && change !== null ? (change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral') : 'neutral');

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-shadow duration-200 flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {value}
            </span>
            {unit && <span className="text-xs font-medium text-slate-500">{unit}</span>}
          </div>
        </div>
        {icon && (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-brand-blue">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {change !== undefined && change !== null ? (
          <div className="flex items-center gap-1.5 font-medium">
            <span
              className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-semibold ${
                resolvedStatus === 'positive'
                  ? 'bg-emerald-50 text-emerald-700'
                  : resolvedStatus === 'negative'
                  ? 'bg-rose-50 text-rose-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {resolvedStatus === 'positive' && <ArrowUpRight className="w-3.5 h-3.5" />}
              {resolvedStatus === 'negative' && <ArrowDownRight className="w-3.5 h-3.5" />}
              {resolvedStatus === 'neutral' && <Minus className="w-3.5 h-3.5" />}
              {change > 0 ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
            </span>
            <span className="text-slate-500 text-[11px]">{changeLabel}</span>
          </div>
        ) : subtext ? (
          <span className="text-slate-500 text-[11px]">{subtext}</span>
        ) : (
          <span className="text-slate-400 text-[11px]">-</span>
        )}
      </div>
    </div>
  );
};
