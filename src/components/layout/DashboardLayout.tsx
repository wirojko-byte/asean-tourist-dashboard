import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { GlobalFilterBar } from '../filters/GlobalFilterBar';
import { MethodologyModal } from '../common/MethodologyModal';
import { DataQualityModal } from '../common/DataQualityModal';
import { useDashboard } from '../../context/DashboardContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { loading, error } = useDashboard();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <Header onToggleSidebar={() => setSidebarOpen(true)} />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Global Sticky Filter Bar */}
          <GlobalFilterBar />

          {/* Page Container */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {loading ? (
              <div className="min-h-[450px] flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500 font-medium">
                  กำลังประมวลผลชุดข้อมูลสถิติทั้ง 15 ชุด... (Processing datasets...)
                </p>
              </div>
            ) : error ? (
              <div className="min-h-[450px] flex flex-col items-center justify-center p-6 text-center">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 max-w-md">
                  <h3 className="text-sm font-bold">เกิดข้อผิดพลาดในการโหลดข้อมูล</h3>
                  <p className="text-xs mt-1">{error}</p>
                </div>
              </div>
            ) : (
              children
            )}
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>

      {/* Modals */}
      <MethodologyModal />
      <DataQualityModal />
    </div>
  );
};
