import React from 'react';
import { useDashboard } from '../../context/DashboardContext';
import { TRANSLATIONS } from '../../utils/translations';

export const Footer: React.FC = () => {
  const { language, setShowMethodology } = useDashboard();
  const t = TRANSLATIONS[language];

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white px-4 sm:px-8 py-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="font-medium text-slate-700">
          {language === 'th'
            ? 'แดชบอร์ดการวิจัย: รูปแบบการท่องเที่ยวของนักท่องเที่ยวประชาคมเศรษฐกิจอาเซียน'
            : 'Research Dashboard: Tourist Behavior Patterns of ASEAN Tourists Traveling to Thailand'}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5">{t.sourceNote}</p>
      </div>

      <div className="flex items-center gap-4 text-[11px]">
        <button
          onClick={() => setShowMethodology(true)}
          className="text-brand-blue hover:underline font-medium"
        >
          {t.methodology}
        </button>
        <span className="text-slate-300">•</span>
        <span>{language === 'th' ? 'พ.ศ. 2554–2567' : '2554–2567 BE'}</span>
      </div>
    </footer>
  );
};
