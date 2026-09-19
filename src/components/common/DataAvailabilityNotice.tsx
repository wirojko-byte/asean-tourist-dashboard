import React from 'react';
import { AlertCircle, Calendar } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

interface DataAvailabilityNoticeProps {
  availableYears: string[];
  selectedYear: string;
}

export const DataAvailabilityNotice: React.FC<DataAvailabilityNoticeProps> = ({
  availableYears,
  selectedYear,
}) => {
  const { language, setSelectedYear } = useDashboard();
  const sorted = [...availableYears].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  const minYear = sorted[0];
  const maxYear = sorted[sorted.length - 1];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50/70 border border-dashed border-slate-300 rounded-xl my-4">
      <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800">
        {language === 'th'
          ? 'ข้อมูลไม่เพียงพอสำหรับปีที่เลือก'
          : 'Data unavailable for the selected year'}
      </h4>
      <p className="text-xs text-slate-500 mt-1 max-w-md">
        {language === 'th' ? (
          <>
            ชุดข้อมูลนี้ครอบคลุมเฉพาะปี พ.ศ. <span className="font-semibold text-slate-700">{minYear}–{maxYear}</span> (ปีที่เลือกคือ พ.ศ. {selectedYear})
          </>
        ) : (
          <>
            This dataset covers the period <span className="font-semibold text-slate-700">{minYear}–{maxYear} BE</span> (selected year is {selectedYear} BE)
          </>
        )}
      </p>

      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setSelectedYear(maxYear)}
          className="px-3 py-1.5 text-xs font-medium text-brand-blue bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5"
        >
          <Calendar className="w-3.5 h-3.5" />
          {language === 'th' ? `ดูข้อมูลปีล่าสุดที่พร้อมใช้งาน (พ.ศ. ${maxYear})` : `View latest available year (${maxYear} BE)`}
        </button>
        <button
          onClick={() => setSelectedYear('all')}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
        >
          {language === 'th' ? 'ดูข้อมูลภาพรวมทุกปี' : 'View all years'}
        </button>
      </div>
    </div>
  );
};
