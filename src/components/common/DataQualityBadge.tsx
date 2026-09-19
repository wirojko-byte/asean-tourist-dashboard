import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const DataQualityBadge: React.FC = () => {
  const { qualityReports, setShowQualityModal, language } = useDashboard();

  // Determine overall status
  const hasError = qualityReports.some(r => r.status === 'error');
  const hasWarning = qualityReports.some(r => r.status === 'warning');

  const status = hasError ? 'error' : hasWarning ? 'warning' : 'ready';

  return (
    <button
      onClick={() => setShowQualityModal(true)}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
        status === 'ready'
          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
          : status === 'warning'
          ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
      }`}
      title={language === 'th' ? 'คลิกเพื่อตรวจสอบสถานะความสมบูรณ์ของชุดข้อมูลทั้ง 15 ชุด' : 'Click to inspect quality status of all 15 datasets'}
    >
      {status === 'ready' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
      {status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
      {status === 'error' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}

      <span>
        {language === 'th'
          ? status === 'ready'
            ? 'ข้อมูลสมบูรณ์ (15/15)'
            : status === 'warning'
            ? 'ข้อมูลพร้อมใช้งาน (มีข้อจำกัดช่วงปี)'
            : 'พบข้อผิดพลาดในข้อมูล'
          : status === 'ready'
          ? 'Data Ready (15/15)'
          : status === 'warning'
          ? 'Data Ready (Year Limits)'
          : 'Data Errors Detected'}
      </span>
    </button>
  );
};
