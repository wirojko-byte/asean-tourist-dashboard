import React, { useMemo } from 'react';
import { Clock, BarChart2, TrendingDown, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { useDashboard } from '../context/DashboardContext';
import { KpiCard } from '../components/common/KpiCard';
import { ChartCard } from '../components/common/ChartCard';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { InsightBox } from '../components/common/InsightBox';
import { DataAvailabilityNotice } from '../components/common/DataAvailabilityNotice';
import {
  calculateAverage,
  filterByYear,
  filterByCountry,
  getAvailableYears,
  getDatasetAvailability,
} from '../utils/calculations';
import { formatNumber, formatYear } from '../utils/formatters';
import { getCountryName } from '../utils/translations';
import { ASEAN_COUNTRIES } from '../data/datasetMetadata';

export const LengthOfStayPage: React.FC = () => {
  const {
    datasets,
    selectedYear,
    selectedCountry,
    setSelectedCountry,
    weightMode,
    setWeightMode,
    language,
  } = useDashboard();

  const stayData = datasets?.stay || [];
  const touristData = datasets?.touristAmount || [];
  const availableYears = useMemo(() => getAvailableYears(stayData), [stayData]);
  const availability = useMemo(
    () => getDatasetAvailability(availableYears, selectedYear),
    [availableYears, selectedYear]
  );

  const isDataAvailable = availability.isAvailable;

  // Filtered stay data
  const filteredStay = useMemo(() => {
    let res = stayData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);
    return res;
  }, [stayData, selectedYear, selectedCountry]);

  // Statistical calculations across filtered data (with weighting support)
  const stats = useMemo(() => {
    const values = filteredStay.map((d) => d.avgDays).filter((v) => !isNaN(v) && v > 0);
    if (values.length === 0) {
      return { avg: 0, median: 0, min: 0, max: 0 };
    }

    let avg = calculateAverage(values);
    if (selectedCountry === 'all' && weightMode === 'weighted') {
      let totalVisitorDays = 0;
      let totalTourists = 0;
      for (const r of filteredStay) {
        const tRow = touristData.find((t) => t.country === r.country && t.year === r.year);
        const count = tRow?.tourists || 0;
        totalVisitorDays += r.avgDays * count;
        totalTourists += count;
      }
      avg = totalTourists > 0 ? totalVisitorDays / totalTourists : avg;
    }

    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    const min = sorted[0];
    const max = sorted[sorted.length - 1];

    return { avg, median, min, max };
  }, [filteredStay, touristData, selectedCountry, weightMode]);

  // Chart A: Stay by Country (for current selected year or latest available year)
  const stayByCountry = useMemo(() => {
    const effYear = selectedYear === 'all' ? availableYears[availableYears.length - 1] : selectedYear;
    const rows = filterByYear(stayData, effYear);

    return ASEAN_COUNTRIES.map((c) => {
      const r = rows.find((d) => d.country === c.th);
      return {
        country: c.th,
        countryName: getCountryName(c.th, language),
        avgDays: r ? r.avgDays : 0,
      };
    }).sort((a, b) => b.avgDays - a.avgDays);
  }, [stayData, selectedYear, availableYears, language]);

  // Chart B: Yearly Trend of Length of Stay
  const yearlyTrend = useMemo(() => {
    return availableYears.map((yr) => {
      let rows = filterByYear(stayData, yr);
      if (selectedCountry !== 'all') {
        rows = filterByCountry(rows, selectedCountry);
        const avg = calculateAverage(rows.map((d) => d.avgDays));
        return {
          year: yr,
          displayYear: formatYear(yr, language),
          avgDays: parseFloat(avg.toFixed(2)),
        };
      } else if (weightMode === 'weighted') {
        let vDays = 0;
        let tCount = 0;
        for (const r of rows) {
          const t = touristData.find((d) => d.country === r.country && d.year === yr);
          const count = t?.tourists || 0;
          vDays += r.avgDays * count;
          tCount += count;
        }
        return {
          year: yr,
          displayYear: formatYear(yr, language),
          avgDays: parseFloat((tCount > 0 ? vDays / tCount : 0).toFixed(2)),
        };
      } else {
        const avg = calculateAverage(rows.map((d) => d.avgDays));
        return {
          year: yr,
          displayYear: formatYear(yr, language),
          avgDays: parseFloat(avg.toFixed(2)),
        };
      }
    });
  }, [stayData, touristData, availableYears, selectedCountry, weightMode, language]);

  // Table Data
  const tableData = useMemo(() => {
    let res = stayData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);

    return res.map((r) => ({
      country: r.country,
      countryName: getCountryName(r.country, language),
      year: r.year,
      avgDays: r.avgDays,
    })).sort((a, b) => parseInt(b.year, 10) - parseInt(a.year, 10) || b.avgDays - a.avgDays);
  }, [stayData, selectedYear, selectedCountry, language]);

  const tableColumns: ColumnDef<any>[] = [
    {
      headerTh: 'ประเทศ',
      headerEn: 'Country',
      accessor: 'countryName',
      cell: (_, row) => (
        <button
          onClick={() => setSelectedCountry(row.country)}
          className="font-medium text-brand-blue hover:underline text-left"
        >
          {row.countryName}
        </button>
      ),
    },
    {
      headerTh: 'ปี พ.ศ.',
      headerEn: 'Year',
      accessor: 'year',
      align: 'center',
      cell: (val) => formatYear(String(val), language),
    },
    {
      headerTh: 'ระยะเวลาพำนักเฉลี่ย (วัน)',
      headerEn: 'Average Stay (Days)',
      accessor: 'avgDays',
      align: 'right',
      cell: (val) => <span className="font-semibold text-slate-800">{formatNumber(val, 2)}</span>,
    },
  ];

  // Factual insights
  const insights = useMemo(() => {
    const th: string[] = [];
    const en: string[] = [];

    if (stayByCountry.length > 0) {
      const top = stayByCountry[0];
      const lowest = stayByCountry[stayByCountry.length - 1];
      const effYr = selectedYear === 'all' ? `ปีล่าสุด (พ.ศ. ${availableYears[availableYears.length - 1]})` : `ปี พ.ศ. ${selectedYear}`;
      const effYrEn = selectedYear === 'all' ? `latest year (${availableYears[availableYears.length - 1]} BE)` : `year ${selectedYear} BE`;

      th.push(
        `ใน${effYr} นักท่องเที่ยวจาก${top.country}มีระยะเวลาพำนักเฉลี่ยยาวนานที่สุดอยู่ที่ ${top.avgDays.toFixed(
          2
        )} วัน ขณะที่${lowest.country}มีระยะเวลาพำนักสั้นที่สุดอยู่ที่ ${lowest.avgDays.toFixed(2)} วัน`
      );
      en.push(
        `In ${effYrEn}, visitors from ${top.countryName} had the longest average duration of stay at ${top.avgDays.toFixed(
          2
        )} days, while ${lowest.countryName} recorded the shortest at ${lowest.avgDays.toFixed(2)} days.`
      );
    }

    th.push(
      `ค่ามัธยฐานของระยะเวลาพำนักในกลุ่มข้อมูลที่เลือกอยู่ที่ ${stats.median.toFixed(
        2
      )} วัน โดยมีช่วงระหว่าง ${stats.min.toFixed(2)} ถึง ${stats.max.toFixed(2)} วัน`
    );
    en.push(
      `The median length of stay across the selected data is ${stats.median.toFixed(
        2
      )} days, ranging from ${stats.min.toFixed(2)} to ${stats.max.toFixed(2)} days.`
    );

    return { th, en };
  }, [stayByCountry, selectedYear, availableYears, stats]);

  if (!isDataAvailable) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {language === 'th' ? '05 ระยะเวลาพำนักเฉลี่ย' : '05 Length of Stay'}
          </h2>
        </div>
        <DataAvailabilityNotice availableYears={availableYears} selectedYear={selectedYear} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Weight Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {language === 'th' ? '05 ระยะเวลาพำนักเฉลี่ย' : '05 Length of Stay'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'th'
              ? 'วิเคราะห์ระยะเวลาพำนักเฉลี่ย (วัน) ของนักท่องเที่ยวอาเซียนที่เดินทางมายังประเทศไทย (พ.ศ. 2554–2565)'
              : 'Analysis of average duration of stay (days) for ASEAN tourists visiting Thailand (2554–2565 BE).'}
          </p>
        </div>

        {/* Weighted Average Toggle */}
        <div className="flex flex-col items-start sm:items-end gap-1">
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
            <button
              onClick={() => setWeightMode('unweighted')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                weightMode === 'unweighted'
                  ? 'bg-brand-blue text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'th' ? 'ค่าเฉลี่ยระดับประเทศ' : 'Country Mean'}
            </button>
            <button
              onClick={() => setWeightMode('weighted')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                weightMode === 'weighted'
                  ? 'bg-brand-blue text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {language === 'th' ? 'ค่าเฉลี่ยถ่วงน้ำหนักตามจำนวนนักท่องเที่ยว' : 'Tourist-Volume Weighted Mean'}
            </button>
          </div>
          <span className="text-[10px] text-slate-500 italic">
            {language === 'th'
              ? 'ค่าเฉลี่ยถ่วงน้ำหนักคำนวณโดยให้น้ำหนักตามจำนวนนักท่องเที่ยวของแต่ละประเทศ'
              : 'The weighted mean uses tourist arrivals as the weight for each ASEAN country.'}
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          titleTh="ระยะเวลาพำนักเฉลี่ย"
          titleEn="Average Length of Stay"
          value={formatNumber(stats.avg, 2)}
          unitTh="วัน/คน"
          unitEn="Days/Person"
          subtextTh={
            selectedCountry !== 'all'
              ? `ข้อมูลของ ${selectedCountry}`
              : weightMode === 'weighted'
              ? 'ถ่วงน้ำหนักตามจำนวนนักท่องเที่ยว'
              : 'ค่าเฉลี่ยของข้อมูลระดับประเทศ'
          }
          subtextEn={
            selectedCountry !== 'all'
              ? `Data for ${getCountryName(selectedCountry, language)}`
              : weightMode === 'weighted'
              ? 'Tourist-volume weighted mean'
              : 'National-level survey average'
          }
          icon={<Clock className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="ค่ามัธยฐาน (Median)"
          titleEn="Median Stay Duration"
          value={formatNumber(stats.median, 2)}
          unitTh="วัน/คน"
          unitEn="Days/Person"
          subtextTh="ค่ากึ่งกลางทางสถิติ"
          subtextEn="50th percentile duration"
          icon={<BarChart2 className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="ระยะเวลาพำนักสั้นที่สุด (Min)"
          titleEn="Minimum Stay Duration"
          value={formatNumber(stats.min, 2)}
          unitTh="วัน/คน"
          unitEn="Days/Person"
          subtextTh="ค่าต่ำสุดในกลุ่มที่เลือก"
          subtextEn="Shortest duration recorded"
          icon={<TrendingDown className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="ระยะเวลาพำนักยาวที่สุด (Max)"
          titleEn="Maximum Stay Duration"
          value={formatNumber(stats.max, 2)}
          unitTh="วัน/คน"
          unitEn="Days/Person"
          subtextTh="ค่าสูงสุดในกลุ่มที่เลือก"
          subtextEn="Longest duration recorded"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Statistical Integrity Callout */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
        <strong className="font-semibold block mb-1">
          {language === 'th' ? 'หมายเหตุความถูกต้องทางสถิติ (Statistical Integrity Note):' : 'Statistical Integrity Note:'}
        </strong>
        {language === 'th'
          ? 'ค่าที่แสดงเป็นค่าเฉลี่ยจากข้อมูลระดับประเทศ/ปี ตามชุดข้อมูลสถิติของกระทรวงการท่องเที่ยวและกีฬา ไม่ใช่ข้อมูลระดับบุคคลเดี่ยว จึงไม่มีการคำนวณการกระจายตัวเทียมหรือเฉลี่ยซ้ำซ้อนโดยปราศจากการถ่วงน้ำหนัก'
          : 'Values displayed are official country/year aggregate averages from the Ministry of Tourism and Sports statistics. They are reported directly without synthetic micro-data distributions.'}
      </div>

      {/* Dynamic Factual Insight Box */}
      <InsightBox insightsTh={insights.th} insightsEn={insights.en} />

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart A: Stay by Country */}
        <div className="lg:col-span-6">
          <ChartCard
            titleTh="ระยะเวลาพำนักเฉลี่ยจำแนกตามประเทศอาเซียน"
            titleEn="Average Length of Stay by Country"
            subtitleTh={`ข้อมูลประจำ${selectedYear === 'all' ? 'ปีล่าสุด' : `ปี พ.ศ. ${selectedYear}`} (วัน)`}
            subtitleEn={`Data for ${selectedYear === 'all' ? 'latest year' : `year ${selectedYear} BE`} (Days)`}
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stayByCountry} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 'dataMax + 2']} />
                  <YAxis type="category" dataKey="countryName" tick={{ fontSize: 11, fill: '#334155' }} width={95} />
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toFixed(2)} ${language === 'th' ? 'วัน' : 'Days'}`, language === 'th' ? 'พำนักเฉลี่ย' : 'Avg Stay']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="avgDays" fill="#1e3a8a" radius={[0, 4, 4, 0]}>
                    {stayByCountry.map((entry, idx) => (
                      <Cell
                        key={`stay-${idx}`}
                        fill={selectedCountry === entry.country ? '#d97706' : '#1e3a8a'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart B: Stay by Year */}
        <div className="lg:col-span-6">
          <ChartCard
            titleTh="แนวโน้มระยะเวลาพำนักเฉลี่ยรายปี (พ.ศ. 2554–2565)"
            titleEn="Average Length of Stay by Year"
            subtitleTh="การเปลี่ยนแปลงของระยะเวลาพำนักตลอดช่วง 12 ปี"
            subtitleEn="Temporal evolution of stay duration over 12 years"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyTrend} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="displayYear" tick={{ fontSize: 11, fill: '#64748b' }} angle={-30} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toFixed(2)} ${language === 'th' ? 'วัน' : 'Days'}`, language === 'th' ? 'พำนักเฉลี่ย' : 'Avg Stay']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgDays"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#059669' }}
                    activeDot={{ r: 6, fill: '#d97706' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={tableData}
        columns={tableColumns}
        filename={`ASEAN_Length_of_Stay_${selectedYear}.csv`}
        defaultSortKey="avgDays"
        titleTh={`ตารางตรวจสอบสถิติระยะเวลาพำนักเฉลี่ย (${selectedYear === 'all' ? 'ทุกปี พ.ศ. 2554–2565' : `ปี พ.ศ. ${selectedYear}`})`}
        titleEn={`Length of Stay Statistical Table (${selectedYear === 'all' ? 'All Years 2554–2565 BE' : `Year ${selectedYear} BE`})`}
      />
    </div>
  );
};
