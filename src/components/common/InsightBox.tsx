import React from 'react';
import { Info } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

interface InsightBoxProps {
  insightsTh: string[];
  insightsEn: string[];
  className?: string;
}

export const InsightBox: React.FC<InsightBoxProps> = ({
  insightsTh,
  insightsEn,
  className = '',
}) => {
  const { language } = useDashboard();
  const insights = language === 'th' ? insightsTh : insightsEn;

  if (!insights || insights.length === 0) return null;

  return (
    <div className={`p-4 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-3 ${className}`}>
      <div className="p-1 rounded-md bg-blue-100 text-brand-blue shrink-0 mt-0.5">
        <Info className="w-4 h-4" />
      </div>
      <div className="flex-1 text-xs text-slate-700 space-y-1">
        <div className="font-semibold text-brand-blue tracking-wide uppercase text-[10px]">
          {language === 'th' ? 'ข้อค้นพบเชิงสถิติ (Statistical Findings)' : 'Key Statistical Insights'}
        </div>
        <ul className="list-disc list-inside space-y-0.5">
          {insights.map((text, idx) => (
            <li key={idx} className="leading-relaxed">
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
