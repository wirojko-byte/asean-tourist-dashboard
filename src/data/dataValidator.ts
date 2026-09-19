import { AllDatasets } from './dataLoader';
import { DATASET_METADATA_MAP } from './datasetMetadata';
import { DataQualityReport } from '../types/dashboard';

export function validateAllDatasets(datasets: AllDatasets): DataQualityReport[] {
  const reports: DataQualityReport[] = [];

  for (const [key, metadata] of Object.entries(DATASET_METADATA_MAP)) {
    const data = (datasets as any)[key] as any[];
    const issues: string[] = [];

    if (!data || data.length === 0) {
      reports.push({
        datasetKey: key,
        filename: metadata.filename,
        status: 'error',
        rowCount: 0,
        yearsAvailable: [],
        issues: ['ไม่พบข้อมูลหรือชุดข้อมูลว่างเปล่า (Dataset empty or missing)']
      });
      continue;
    }

    const rowCount = data.length;
    const yearsAvailable = Array.from(new Set(data.map(d => d.year))).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const countriesAvailable = Array.from(new Set(data.map(d => d.country)));

    // Check if years are limited (e.g. Flight or Income covering only 2562–2563)
    if (yearsAvailable.length < 5) {
      issues.push(`ชุดข้อมูลครอบคลุมช่วงปีจำกัด (${yearsAvailable.join(', ')})`);
    }

    // Check country coverage
    if (countriesAvailable.length < 9) {
      issues.push(`มีข้อมูลประเทศไม่ครบ 9 ประเทศ (พบ ${countriesAvailable.length} ประเทศ)`);
    }

    // Check for NaN or negative values in numeric fields
    let nanCount = 0;
    for (const row of data) {
      for (const [field, val] of Object.entries(row)) {
        if (field !== 'country' && field !== 'year') {
          if (typeof val === 'number' && isNaN(val)) {
            nanCount++;
          }
        }
      }
    }
    if (nanCount > 0) {
      issues.push(`พบค่าที่ไม่ใช่ตัวเลข (NaN) จำนวน ${nanCount} จุด`);
    }

    let status: 'ready' | 'warning' | 'error' = 'ready';
    if (issues.length > 0) {
      status = 'warning';
    }

    reports.push({
      datasetKey: key,
      filename: metadata.filename,
      status,
      rowCount,
      yearsAvailable,
      issues
    });
  }

  return reports;
}
