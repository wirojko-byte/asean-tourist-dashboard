export type Language = 'th' | 'en';

export type DashboardPage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type CalculationWeightMode = 'unweighted' | 'weighted';

export interface GlobalFilterState {
  selectedYear: string; // 'all' or specific year like '2562'
  selectedCountry: string; // 'all' or specific country like 'มาเลเซีย'
  weightMode: CalculationWeightMode;
  language: Language;
  activePage: DashboardPage;
}

export interface KpiItem {
  id: string;
  titleTh: string;
  titleEn: string;
  value: string | number;
  change?: number | null; // percentage change
  changeLabelTh?: string;
  changeLabelEn?: string;
  subtextTh?: string;
  subtextEn?: string;
  unitTh?: string;
  unitEn?: string;
  status?: 'positive' | 'negative' | 'neutral';
}

export interface DataQualityReport {
  datasetKey: string;
  filename: string;
  status: 'ready' | 'warning' | 'error';
  rowCount: number;
  yearsAvailable: string[];
  issues: string[];
}
