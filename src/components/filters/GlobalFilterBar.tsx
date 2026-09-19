import React from 'react';
import { RotateCcw, Filter, Globe2, Calendar } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { ALL_YEARS, ASEAN_COUNTRIES } from '../../data/datasetMetadata';
import { TRANSLATIONS, getCountryName } from '../../utils/translations';
import { formatYear } from '../../utils/formatters';

export const GlobalFilterBar: React.FC = () => {
  const {
    selectedYear,
    setSelectedYear,
    selectedCountry,
    setSelectedCountry,
    weightMode,
    activePage,
    language,
    setLanguage,
    resetFilters,
  } = useDashboard();

  const t = TRANSLATIONS[language];

  const hasActiveFilters = selectedYear !== 'all' || selectedCountry !== 'all' || weightMode !== 'unweighted';

  const getIsYearAvailableForPage = (page: number, year: string): boolean => {
    if (year === 'all') return true;
    const y = parseInt(year, 10);
    switch (page) {
      case 1:
        return y >= 2554 && y <= 2567;
      case 2:
      case 3:
      case 4:
      case 6:
        return y >= 2554 && y <= 2563;
      case 5:
        return y >= 2554 && y <= 2565;
      case 7:
        return y >= 2554 && y <= 2564;
      default:
        return true;
    }
  };

  return (
    <div className="bg-white border-b border-slate-200/90 px-4 sm:px-6 py-3 shadow-2xs sticky top-0 z-30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filter Controls Group */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5 text-brand-blue" />
            <span className="hidden sm:inline">{language === 'th' ? 'ตัวกรองข้อมูล' : 'Filters'}:</span>
          </div>

          {/* Year Filter */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="year-select" className="text-xs font-medium text-slate-500 hidden md:inline">
              {t.filterYear}:
            </label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue font-medium"
            >
              <option value="all">{t.allYears}</option>
              {ALL_YEARS.map((yr) => {
                const isAvail = getIsYearAvailableForPage(activePage, yr);
                return (
                  <option key={yr} value={yr}>
                    {formatYear(yr, language)}{!isAvail ? (language === 'th' ? ' — ไม่มีข้อมูลในหน้านี้' : ' — No data on this page') : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Country Filter */}
          <div className="flex items-center gap-1.5">
            <label htmlFor="country-select" className="text-xs font-medium text-slate-500 hidden md:inline">
              {t.filterCountry}:
            </label>
            <select
              id="country-select"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue font-medium"
            >
              <option value="all">{t.allCountries}</option>
              {ASEAN_COUNTRIES.map((c) => (
                <option key={c.th} value={c.th}>
                  {getCountryName(c.th, language)}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              title={t.resetFilters}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetFilters}</span>
            </button>
          )}
        </div>

        {/* Right side: Language Toggle & Active status badge */}
        <div className="flex items-center gap-3">
          {/* Active Filter Context Badge */}
          <div className="hidden sm:flex items-center text-xs">
            <div
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                hasActiveFilters
                  ? 'bg-blue-50/90 text-brand-blue border-blue-200 shadow-2xs'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-brand-blue/70" />
              <span>
                {selectedYear === 'all'
                  ? language === 'th' ? 'ทุกปี (2554–2567)' : 'All Years'
                  : formatYear(selectedYear, language)}
              </span>
              <span className="text-slate-300 font-normal">|</span>
              <Globe2 className="w-3.5 h-3.5 text-brand-blue/70" />
              <span>
                {selectedCountry === 'all'
                  ? language === 'th' ? 'ทุกประเทศ (9)' : 'All Countries (9)'
                  : getCountryName(selectedCountry, language)}
              </span>
              {weightMode === 'weighted' && (
                <>
                  <span className="text-slate-300 font-normal">|</span>
                  <span className="text-amber-700 font-bold text-[11px] bg-amber-100/80 px-1.5 py-0.2 rounded">
                    {language === 'th' ? 'ถ่วงน้ำหนัก' : 'Weighted'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setLanguage('th')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'th'
                  ? 'bg-white text-brand-blue shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              TH
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-all ${
                language === 'en'
                  ? 'bg-white text-brand-blue shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
