export function formatNumber(value: number | null | undefined, decimals = 0): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatPercentage(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return `${value >= 0 ? '' : ''}${formatNumber(value, decimals)}%`;
}

export function formatYoY(value: number | null | undefined, decimals = 2): { text: string; status: 'positive' | 'negative' | 'neutral' } {
  if (value === null || value === undefined || isNaN(value)) {
    return { text: '-', status: 'neutral' };
  }
  const prefix = value > 0 ? '+' : '';
  const text = `${prefix}${formatNumber(value, decimals)}%`;
  const status = value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';
  return { text, status };
}

export function formatYear(year: string, lang: 'th' | 'en'): string {
  if (year === 'all') {
    return lang === 'th' ? 'ทุกปี (พ.ศ. 2554–2567)' : 'All Years (2554–2567 BE)';
  }
  return lang === 'th' ? `พ.ศ. ${year}` : `${year} BE`;
}

export function formatCurrency(value: number | null | undefined, unit: string, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return `${formatNumber(value, decimals)} ${unit}`;
}
