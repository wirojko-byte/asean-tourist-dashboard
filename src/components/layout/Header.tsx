import React from 'react';
import { Menu, BookOpen, GraduationCap } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { TRANSLATIONS } from '../../utils/translations';
import { DataQualityBadge } from '../common/DataQualityBadge';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { language, setShowMethodology } = useDashboard();
  const t = TRANSLATIONS[language];

  return (
    <header className="bg-navy-900 text-white border-b border-navy-800 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-md">
      {/* Left: Mobile Menu + Titles */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition-colors focus:outline-none"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-blue flex items-center justify-center text-amber-400 shadow-inner border border-blue-400/30 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                {t.appTitle}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 tracking-wide uppercase">
                {t.researchBadge}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 line-clamp-1">
              {t.appSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Quality Badge + Methodology Button */}
      <div className="flex items-center gap-2 sm:gap-3">
        <DataQualityBadge />

        <button
          onClick={() => setShowMethodology(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-800 hover:bg-navy-700 text-slate-200 border border-slate-700 transition-colors"
          title={t.methodology}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">{t.methodology}</span>
        </button>
      </div>
    </header>
  );
};
