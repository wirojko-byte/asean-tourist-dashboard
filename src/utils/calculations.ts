export function calculateTotal(values: number[]): number {
  if (!values || values.length === 0) return 0;
  return values.reduce((sum, v) => sum + (isNaN(v) ? 0 : v), 0);
}

export function calculateAverage(values: number[]): number {
  if (!values || values.length === 0) return 0;
  const valid = values.filter(v => typeof v === 'number' && !isNaN(v));
  if (valid.length === 0) return 0;
  return calculateTotal(valid) / valid.length;
}

export function calculatePercentage(part: number, total: number): number {
  if (!total || total === 0 || isNaN(part) || isNaN(total)) return 0;
  return (part / total) * 100;
}

export function calculateShareOfTotal(item: number, total: number): number {
  return calculatePercentage(item, total);
}

export function calculatePercentageChange(current: number, previous: number): number | null {
  if (previous === 0 || isNaN(current) || isNaN(previous) || previous === undefined || current === undefined) {
    return null;
  }
  return ((current - previous) / previous) * 100;
}

export function calculateAbsoluteChange(current: number, previous: number): number {
  return current - previous;
}

export function filterByYear<T extends { year: string }>(data: T[], year: string): T[] {
  if (!data) return [];
  if (year === 'all') return data;
  return data.filter(item => item.year === year);
}

export function filterByCountry<T extends { country: string }>(data: T[], country: string): T[] {
  if (!data) return [];
  if (country === 'all') return data;
  return data.filter(item => item.country === country);
}

export function getAvailableYears<T extends { year: string }>(data: T[]): string[] {
  if (!data || data.length === 0) return [];
  const years = Array.from(new Set(data.map(d => d.year)));
  return years.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
}

export function getAvailableCountries<T extends { country: string }>(data: T[]): string[] {
  if (!data || data.length === 0) return [];
  return Array.from(new Set(data.map(d => d.country)));
}

export function getDatasetAvailability(
  datasetYears: string[],
  selectedYear: string
): { isAvailable: boolean; minYear: string; maxYear: string } {
  if (!datasetYears || datasetYears.length === 0) {
    return { isAvailable: false, minYear: '', maxYear: '' };
  }
  const sorted = [...datasetYears].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  const minYear = sorted[0];
  const maxYear = sorted[sorted.length - 1];

  if (selectedYear === 'all') {
    return { isAvailable: true, minYear, maxYear };
  }

  const isAvailable = datasetYears.includes(selectedYear);
  return { isAvailable, minYear, maxYear };
}

export function getPreviousYear(year: string, availableYears: string[]): string | null {
  const sorted = [...availableYears].sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
  const idx = sorted.indexOf(year);
  if (idx > 0) {
    return sorted[idx - 1];
  }
  return null;
}

export function getYoYChange(
  currentYear: string,
  series: { year: string; value: number }[]
): number | null {
  const sorted = [...series].sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));
  const currentItem = sorted.find(s => s.year === currentYear);
  if (!currentItem) return null;

  const currentIdx = sorted.findIndex(s => s.year === currentYear);
  if (currentIdx <= 0) return null;

  const prevItem = sorted[currentIdx - 1];
  return calculatePercentageChange(currentItem.value, prevItem.value);
}

export function calculateGrowthRate(series: { year: string; value: number }[]): number | null {
  if (!series || series.length < 2) return null;
  const sorted = [...series].sort((a, b) => parseInt(a.year, 10) - parseInt(b.year, 10));
  const first = sorted[0].value;
  const last = sorted[sorted.length - 1].value;
  const n = sorted.length - 1;
  if (first <= 0 || last <= 0) return null;
  // Compound annual growth rate
  return (Math.pow(last / first, 1 / n) - 1) * 100;
}
