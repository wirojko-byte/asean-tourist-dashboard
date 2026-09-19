import React from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, Database } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

export const DataQualityModal: React.FC = () => {
  const { showQualityModal, setShowQualityModal, qualityReports, language } = useDashboard();

  if (!showQualityModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-brand-blue">
            <Database className="w-5 h-5" />
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              {language === 'th' ? 'รายงานการตรวจสอบคุณภาพข้อมูล (Data Quality Audit)' : 'Data Quality Audit Report'}
            </h2>
          </div>
          <button
            onClick={() => setShowQualityModal(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar text-xs text-slate-700 space-y-4">
          <p className="text-slate-600">
            {language === 'th'
              ? 'ระบบทำการตรวจสอบชุดข้อมูล CSV ทั้ง 15 ชุดโดยอัตโนมัติ เพื่อยืนยันความถูกต้องของจำนวนแถว ความครบถ้วนของตัวเลข และขอบเขตช่วงปีของแต่ละชุดข้อมูล:'
              : 'The system has automatically validated all 15 CSV datasets to verify row integrity, numerical parsing, and year coverage limitations:'}
          </p>

          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-100 text-slate-700 font-semibold">
                <tr>
                  <th className="p-2.5">สถานะ (Status)</th>
                  <th className="p-2.5">ไฟล์ข้อมูล (CSV File)</th>
                  <th className="p-2.5 text-center">จำนวนแถว (Rows)</th>
                  <th className="p-2.5">ปีที่ครอบคลุม (Years)</th>
                  <th className="p-2.5">ข้อสังเกต / ข้อจำกัด (Notes)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {qualityReports.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-2.5">
                      {r.status === 'ready' && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> พร้อมใช้งาน
                        </span>
                      )}
                      {r.status === 'warning' && (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" /> ช่วงปีจำกัด
                        </span>
                      )}
                      {r.status === 'error' && (
                        <span className="inline-flex items-center gap-1 text-rose-700 font-semibold">
                          <XCircle className="w-3.5 h-3.5" /> ข้อผิดพลาด
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 font-mono text-[10px] text-slate-800">{r.filename}</td>
                    <td className="p-2.5 text-center font-medium">{r.rowCount}</td>
                    <td className="p-2.5 font-medium text-brand-blue">
                      {r.yearsAvailable.length > 0
                        ? `${r.yearsAvailable[0]}–${r.yearsAvailable[r.yearsAvailable.length - 1]}`
                        : '-'}
                    </td>
                    <td className="p-2.5 text-slate-500">
                      {r.issues.length > 0 ? r.issues.join('; ') : 'ข้อมูลสมบูรณ์ครบถ้วน'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={() => setShowQualityModal(false)}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-blue hover:bg-navy-800 rounded-lg transition-colors"
          >
            {language === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
