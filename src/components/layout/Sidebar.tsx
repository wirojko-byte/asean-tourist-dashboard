import React from 'react';
import {
  BarChart3,
  Users,
  Compass,
  Target,
  Clock,
  Wallet,
  TrendingUp,
  X
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { DashboardPage } from '../../types/dashboard';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activePage, setActivePage, language } = useDashboard();

  const navItems: { page: DashboardPage; number: string; labelTh: string; labelEn: string; icon: React.ReactNode }[] = [
    {
      page: 1,
      number: '01',
      labelTh: 'ภาพรวมการท่องเที่ยว',
      labelEn: 'Overview',
      icon: <BarChart3 className="w-4 h-4" />
    },
    {
      page: 2,
      number: '02',
      labelTh: 'ลักษณะทางประชากรศาสตร์',
      labelEn: 'Tourist Characteristics',
      icon: <Users className="w-4 h-4" />
    },
    {
      page: 3,
      number: '03',
      labelTh: 'พฤติกรรมการเดินทาง',
      labelEn: 'Travel Behavior',
      icon: <Compass className="w-4 h-4" />
    },
    {
      page: 4,
      number: '04',
      labelTh: 'วัตถุประสงค์การเดินทาง',
      labelEn: 'Travel Objectives',
      icon: <Target className="w-4 h-4" />
    },
    {
      page: 5,
      number: '05',
      labelTh: 'ระยะเวลาพำนักเฉลี่ย',
      labelEn: 'Length of Stay',
      icon: <Clock className="w-4 h-4" />
    },
    {
      page: 6,
      number: '06',
      labelTh: 'ค่าใช้จ่ายของนักท่องเที่ยว',
      labelEn: 'Expenses',
      icon: <Wallet className="w-4 h-4" />
    },
    {
      page: 7,
      number: '07',
      labelTh: 'รายได้และรายรับจากการท่องเที่ยว',
      labelEn: 'Income & Revenue',
      icon: <TrendingUp className="w-4 h-4" />
    }
  ];

  const handleSelectPage = (page: DashboardPage) => {
    setActivePage(page);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-navy-900 text-slate-300 flex flex-col border-r border-navy-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header (Mobile close button) */}
        <div className="p-4 border-b border-navy-800 flex items-center justify-between lg:hidden">
          <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            {language === 'th' ? 'เมนูแดชบอร์ด' : 'Dashboard Menu'}
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Heading */}
        <div className="px-5 pt-6 pb-2">
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {language === 'th' ? 'การนำทางในรายงาน (7 หมวด)' : 'Navigation (7 Sections)'}
          </p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activePage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => handleSelectPage(item.page)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-md shadow-brand-blue/30 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-navy-800/80 hover:text-white'
                }`}
              >
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-blue-900/60 text-amber-300' : 'bg-navy-800 text-slate-400'
                  }`}
                >
                  {item.number}
                </span>

                <span className="p-1 rounded-md">{item.icon}</span>

                <span className="flex-1 leading-tight">
                  {language === 'th' ? item.labelTh : item.labelEn}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Info */}
        <div className="p-4 border-t border-navy-800 bg-navy-950/40 text-[11px] text-slate-400">
          <p className="font-medium text-slate-300">
            {language === 'th' ? 'โครงการวิจัยพฤติกรรมนักท่องเที่ยวอาเซียน' : 'ASEAN Tourism Research Project'}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {language === 'th' ? '15 ชุดข้อมูลสถิติ • 9 ประเทศสมาชิก' : '15 Statistical Datasets • 9 Member States'}
          </p>
        </div>
      </aside>
    </>
  );
};
