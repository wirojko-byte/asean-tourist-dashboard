import React, { useMemo } from 'react';
import { TrendingUp, Coins, Award, Users } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useDashboard } from '../context/DashboardContext';
import { KpiCard } from '../components/common/KpiCard';
import { ChartCard } from '../components/common/ChartCard';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { InsightBox } from '../components/common/InsightBox';
import { DataAvailabilityNotice } from '../components/common/DataAvailabilityNotice';
import {
  calculateTotal,
  calculatePercentage,
  calculatePercentageChange,
  filterByYear,
  filterByCountry,
  getAvailableYears,
  getDatasetAvailability,
  getYoYChange,
} from '../utils/calculations';
import { formatNumber, formatPercentage, formatYear } from '../utils/formatters';
import { getCountryName, getCategoryName } from '../utils/translations';
import { ASEAN_COUNTRIES } from '../data/datasetMetadata';

const INCOME_KEYS: { key: string; labelTh: string }[] = [
  { key: 'incomeUnder20k', labelTh: 'น้อยกว่า_20,000_ดอลลาร์สหรัฐ' },
  { key: 'income20k_60k', labelTh: '20,001_-_60,000_ดอลลาร์สหรัฐ' },
  { key: 'incomeOver60k', labelTh: 'มากกว่า_60,000_ดอลลาร์สหรัฐ' },
  { key: 'noIncome', labelTh: 'ไม่มีรายได้' },
];

export const IncomeRevenuePage: React.FC = () => {
  const { datasets, selectedYear, selectedCountry, setSelectedCountry, language } = useDashboard();

  const revenueData = datasets?.revenue || [];
  const incomeData = datasets?.touristYearIncome || [];

  const availableRevenueYears = useMemo(() => getAvailableYears(revenueData), [revenueData]);
  const availableIncomeYears = useMemo(() => getAvailableYears(incomeData), [incomeData]);

  const revenueAvailability = useMemo(
    () => getDatasetAvailability(availableRevenueYears, selectedYear),
    [availableRevenueYears, selectedYear]
  );
  const incomeAvailability = useMemo(
    () => getDatasetAvailability(availableIncomeYears, selectedYear),
    [availableIncomeYears, selectedYear]
  );

  // Filtered revenue
  const filteredRevenue = useMemo(() => {
    let res = revenueData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);
    return res;
  }, [revenueData, selectedYear, selectedCountry]);

  // Filtered income
  const filteredIncome = useMemo(() => {
    let res = incomeData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);
    return res;
  }, [incomeData, selectedYear, selectedCountry]);

  // Total Revenue for current view
  const currentTotalRevenue = useMemo(() => {
    return calculateTotal(filteredRevenue.map((d) => d.revenueMillionThb));
  }, [filteredRevenue]);

  // Revenue by Year series
  const yearlyRevenueSeries = useMemo(() => {
    return availableRevenueYears.map((yr) => {
      let rows = filterByYear(revenueData, yr);
      if (selectedCountry !== 'all') {
        rows = filterByCountry(rows, selectedCountry);
      }
      const total = calculateTotal(rows.map((d) => d.revenueMillionThb));
      return {
        year: yr,
        displayYear: formatYear(yr, language),
        revenueMillionThb: parseFloat(total.toFixed(2)),
      };
    });
  }, [revenueData, availableRevenueYears, selectedCountry, language]);

  // Peak Revenue Year
  const peakYear = useMemo(() => {
    if (yearlyRevenueSeries.length === 0) return null;
    return [...yearlyRevenueSeries].sort((a, b) => b.revenueMillionThb - a.revenueMillionThb)[0];
  }, [yearlyRevenueSeries]);

  // YoY Revenue Change
  const currentYoY = useMemo(() => {
    const series = yearlyRevenueSeries.map((d) => ({
      year: d.year,
      value: d.revenueMillionThb,
    }));
    if (selectedYear === 'all') {
      if (series.length < 2) return null;
      return calculatePercentageChange(series[series.length - 1].value, series[series.length - 2].value);
    } else {
      return getYoYChange(selectedYear, series);
    }
  }, [yearlyRevenueSeries, selectedYear]);

  // Diverging Bar: YoY Growth Rate per Year
  const yoyGrowthSeries = useMemo(() => {
    const list: { year: string; displayYear: string; yoy: number }[] = [];
    for (let i = 1; i < yearlyRevenueSeries.length; i++) {
      const prev = yearlyRevenueSeries[i - 1].revenueMillionThb;
      const cur = yearlyRevenueSeries[i].revenueMillionThb;
      const yoy = calculatePercentageChange(cur, prev);
      if (yoy !== null) {
        list.push({
          year: yearlyRevenueSeries[i].year,
          displayYear: yearlyRevenueSeries[i].displayYear,
          yoy: parseFloat(yoy.toFixed(2)),
        });
      }
    }
    return list;
  }, [yearlyRevenueSeries]);

  // Revenue by Country (for current selected year or latest available year)
  const revenueByCountry = useMemo(() => {
    const effYear = selectedYear === 'all' ? availableRevenueYears[availableRevenueYears.length - 1] : selectedYear;
    const rows = filterByYear(revenueData, effYear);

    return ASEAN_COUNTRIES.map((c) => {
      const r = rows.find((d) => d.country === c.th);
      return {
        country: c.th,
        countryName: getCountryName(c.th, language),
        revenueMillionThb: r ? r.revenueMillionThb : 0,
      };
    }).sort((a, b) => b.revenueMillionThb - a.revenueMillionThb);
  }, [revenueData, selectedYear, availableRevenueYears, language]);

  // Tourist Income Summary (2562–2563)
  const incomeSummary = useMemo(() => {
    const list = INCOME_KEYS.map((k) => {
      const val = calculateTotal(filteredIncome.map((d: any) => d[k.key] || 0));
      return {
        key: k.key,
        category: k.labelTh,
        label: getCategoryName(k.labelTh, language),
        value: val,
      };
    });

    const total = calculateTotal(list.map((d) => d.value));

    return list.map((item) => ({
      ...item,
      pct: calculatePercentage(item.value, total),
    }));
  }, [filteredIncome, language]);

  // High Income Tourist Share (> 60k USD)
  const highIncomeShare = useMemo(() => {
    const item = incomeSummary.find((i) => i.key === 'incomeOver60k');
    return item ? item.pct : 0;
  }, [incomeSummary]);

  // Inspection Table Data
  const tableData = useMemo(() => {
    const countries = selectedCountry === 'all' ? ASEAN_COUNTRIES : ASEAN_COUNTRIES.filter((c) => c.th === selectedCountry);

    if (selectedYear !== 'all') {
      const rRows = filterByYear(revenueData, selectedYear);
      const iRows = filterByYear(incomeData, selectedYear);
      const prevYear = String(parseInt(selectedYear, 10) - 1);
      const prevRRows = filterByYear(revenueData, prevYear);

      return countries.map((c) => {
        const r = rRows.find((d) => d.country === c.th);
        const prevR = prevRRows.find((d) => d.country === c.th);
        const inc = iRows.find((d) => d.country === c.th);

        const rev = r?.revenueMillionThb || 0;
        const prevRev = prevR?.revenueMillionThb || 0;
        const yoy = prevRev > 0 ? calculatePercentageChange(rev, prevRev) : null;

        return {
          country: c.th,
          countryName: getCountryName(c.th, language),
          year: selectedYear,
          revenue: rev,
          yoy,
          incomeUnder20k: inc ? inc.incomeUnder20k : null,
          income20k_60k: inc ? inc.income20k_60k : null,
          incomeOver60k: inc ? inc.incomeOver60k : null,
          noIncome: inc ? inc.noIncome : null,
        };
      }).sort((a, b) => b.revenue - a.revenue);
    }

    // All Years: generate rows for each year (2554–2564) and country, sorted by year descending
    const rows: any[] = [];
    const sortedYears = [...availableRevenueYears].sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

    for (const yr of sortedYears) {
      const rRows = filterByYear(revenueData, yr);
      const iRows = filterByYear(incomeData, yr);
      const prevYear = String(parseInt(yr, 10) - 1);
      const prevRRows = filterByYear(revenueData, prevYear);

      for (const c of countries) {
        const r = rRows.find((d) => d.country === c.th);
        const prevR = prevRRows.find((d) => d.country === c.th);
        const inc = iRows.find((d) => d.country === c.th);

        const rev = r?.revenueMillionThb || 0;
        const prevRev = prevR?.revenueMillionThb || 0;
        const yoy = prevRev > 0 ? calculatePercentageChange(rev, prevRev) : null;

        rows.push({
          country: c.th,
          countryName: getCountryName(c.th, language),
          year: yr,
          revenue: rev,
          yoy,
          incomeUnder20k: inc ? inc.incomeUnder20k : null,
          income20k_60k: inc ? inc.income20k_60k : null,
          incomeOver60k: inc ? inc.incomeOver60k : null,
          noIncome: inc ? inc.noIncome : null,
        });
      }
    }

    return rows;
  }, [revenueData, incomeData, selectedYear, selectedCountry, availableRevenueYears, language]);

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
      headerTh: 'รายได้จากการท่องเที่ยว (ล้านบาท)',
      headerEn: 'Revenue (Million THB)',
      accessor: 'revenue',
      align: 'right',
      cell: (v) => <span className="font-semibold text-slate-800">{formatNumber(v, 2)}</span>,
    },
    {
      headerTh: 'การเปลี่ยนแปลง YoY (%)',
      headerEn: 'YoY Change (%)',
      accessor: 'yoy',
      align: 'right',
      cell: (v) => {
        if (v === null || v === undefined) return <span className="text-slate-400">-</span>;
        return (
          <span
            className={`font-semibold ${
              v > 0 ? 'text-emerald-700' : v < 0 ? 'text-rose-700' : 'text-slate-700'
            }`}
          >
            {v > 0 ? `+${v.toFixed(2)}%` : `${v.toFixed(2)}%`}
          </span>
        );
      },
    },
    {
      headerTh: 'รายได้ > $60k (คน)',
      headerEn: 'Income > $60k (Persons)',
      accessor: 'incomeOver60k',
      align: 'right',
      cell: (v) => formatNumber(v),
    },
  ];

  // Factual insights
  const insights = useMemo(() => {
    const th: string[] = [];
    const en: string[] = [];

    if (peakYear) {
      th.push(
        `ปีที่สร้างรายได้จากการท่องเที่ยวสูงสุดในประวัติศาสตร์ของชุดข้อมูลคือ พ.ศ. ${peakYear.year} มียอดรายได้รวม ${formatNumber(
          peakYear.revenueMillionThb,
          2
        )} ล้านบาท`
      );
      en.push(
        `The peak revenue year was ${peakYear.year} BE, generating a record total of ${formatNumber(
          peakYear.revenueMillionThb,
          2
        )} Million THB.`
      );
    }

    if (revenueByCountry.length > 0) {
      const top = revenueByCountry[0];
      const effYr = selectedYear === 'all' ? 'ปีล่าสุด' : `ปี ${selectedYear}`;
      const effYrEn = selectedYear === 'all' ? 'the latest recorded year' : `year ${selectedYear} BE`;

      th.push(
        `ใน${effYr} ${top.country}เป็นประเทศที่สร้างรายได้จากการท่องเที่ยวให้แก่ประเทศไทยสูงสุด ด้วยมูลค่า ${formatNumber(
          top.revenueMillionThb,
          2
        )} ล้านบาท`
      );
      en.push(
        `In ${effYrEn}, ${top.countryName} contributed the highest tourism revenue to Thailand, generating ${formatNumber(
          top.revenueMillionThb,
          2
        )} Million THB.`
      );
    }

    if (currentYoY !== null) {
      const isPos = currentYoY > 0;
      th.push(
        `รายได้จากการท่องเที่ยวรวมมีอัตราการเปลี่ยนแปลง${isPos ? 'เพิ่มขึ้น' : 'ลดลง'} ${Math.abs(currentYoY).toFixed(2)}% จากปีก่อนหน้า`
      );
      en.push(
        `Total tourism revenue ${isPos ? 'increased' : 'decreased'} by ${Math.abs(currentYoY).toFixed(2)}% compared to the previous year.`
      );
    }

    return { th, en };
  }, [peakYear, revenueByCountry, currentYoY, selectedYear]);

  if (!revenueAvailability.isAvailable) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {language === 'th' ? '07 รายได้และรายรับจากการท่องเที่ยว' : '07 Income & Revenue'}
          </h2>
        </div>
        <DataAvailabilityNotice availableYears={availableRevenueYears} selectedYear={selectedYear} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {language === 'th' ? '07 รายได้และรายรับจากการท่องเที่ยว' : '07 Income & Tourism Revenue'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {language === 'th'
            ? 'วิเคราะห์รายได้จากการท่องเที่ยวรวมที่ประเทศไทยได้รับ (พ.ศ. 2554–2564) และระดับรายได้ประจำปีของนักท่องเที่ยว'
            : 'Analysis of total tourism revenue generated for Thailand (2554–2564 BE) and tourist annual income brackets.'}
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          titleTh="รายได้จากการท่องเที่ยวรวม"
          titleEn="Total Tourism Revenue"
          value={formatNumber(currentTotalRevenue, 2)}
          unitTh="ล้านบาท"
          unitEn="Million THB"
          change={currentYoY}
          changeLabelTh="YoY เติบโต"
          changeLabelEn="YoY Growth"
          icon={<Coins className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="ปีที่สร้างรายได้สูงสุด (Peak)"
          titleEn="Peak Revenue Year"
          value={peakYear ? `พ.ศ. ${peakYear.year}` : '-'}
          subtextTh={peakYear ? `${formatNumber(peakYear.revenueMillionThb, 2)} ล้านบาท` : ''}
          subtextEn={peakYear ? `${formatNumber(peakYear.revenueMillionThb, 2)} M THB` : ''}
          icon={<Award className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="อัตราการเปลี่ยนแปลงรายได้ (YoY)"
          titleEn="YoY Revenue Change"
          value={currentYoY !== null ? (currentYoY > 0 ? `+${currentYoY.toFixed(2)}%` : `${currentYoY.toFixed(2)}%`) : '-'}
          status={currentYoY !== null ? (currentYoY > 0 ? 'positive' : currentYoY < 0 ? 'negative' : 'neutral') : 'neutral'}
          subtextTh="เทียบกับปีก่อนหน้า"
          subtextEn="Compared to previous year"
          icon={<TrendingUp className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="สัดส่วนนักท่องเที่ยวรายได้สูง"
          titleEn="High Income Tourist Share"
          value={
            incomeAvailability.isAvailable
              ? formatPercentage(highIncomeShare)
              : language === 'th'
              ? 'ไม่มีข้อมูลสำหรับปีนี้'
              : 'No data for this year'
          }
          subtextTh={
            incomeAvailability.isAvailable
              ? 'รายได้มากกว่า 60,000 ดอลลาร์สหรัฐ/ปี'
              : 'ข้อมูลมีเฉพาะปี พ.ศ. 2562–2563'
          }
          subtextEn={
            incomeAvailability.isAvailable
              ? 'Annual income > $60,000 USD'
              : 'Data available for 2562–2563 BE only'
          }
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Dynamic Factual Insight Box */}
      <InsightBox insightsTh={insights.th} insightsEn={insights.en} />

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION B: Revenue by Year (Area Chart) */}
        <div className="lg:col-span-12">
          <ChartCard
            titleTh="แนวโน้มรายได้จากการท่องเที่ยวรายปี (พ.ศ. 2554–2564)"
            titleEn="Total Tourism Revenue by Year (2554–2564 BE)"
            subtitleTh="มูลค่ารายได้จากการท่องเที่ยวที่ประเทศไทยได้รับจาก 9 ประเทศสมาชิกอาเซียน (ล้านบาท)"
            subtitleEn="Total tourism revenue generated from 9 ASEAN markets in Million THB"
          >
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearlyRevenueSeries} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="displayYear" tick={{ fontSize: 11, fill: '#64748b' }} angle={-30} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(val: any) => [
                      `${formatNumber(Number(val), 2)} ล้านบาท`,
                      language === 'th' ? 'รายได้' : 'Revenue',
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenueMillionThb"
                    stroke="#1e3a8a"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* SECTION C: Revenue by Country */}
        <div className="lg:col-span-6">
          <ChartCard
            titleTh="รายได้จากการท่องเที่ยวจำแนกตามประเทศอาเซียน"
            titleEn="Tourism Revenue by ASEAN Country"
            subtitleTh={`ข้อมูลประจำ${selectedYear === 'all' ? 'ปีล่าสุด' : `ปี พ.ศ. ${selectedYear}`} (ล้านบาท)`}
            subtitleEn={`Data for ${selectedYear === 'all' ? 'latest year' : `year ${selectedYear} BE`} (Million THB)`}
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueByCountry} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <YAxis type="category" dataKey="countryName" tick={{ fontSize: 11, fill: '#334155' }} width={95} />
                  <Tooltip
                    formatter={(val: any) => [
                      `${formatNumber(Number(val), 2)} ล้านบาท`,
                      language === 'th' ? 'รายได้' : 'Revenue',
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="revenueMillionThb" fill="#1e3a8a" radius={[0, 4, 4, 0]}>
                    {revenueByCountry.map((entry, idx) => (
                      <Cell
                        key={`rev-${idx}`}
                        fill={selectedCountry === entry.country ? '#d97706' : '#1e3a8a'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* SECTION D: Diverging YoY Growth Rate Chart */}
        <div className="lg:col-span-6">
          <ChartCard
            titleTh="อัตราการเติบโตของรายได้รายปี (YoY Growth Rate %)"
            titleEn="Annual Revenue Growth Rate (YoY %)"
            subtitleTh="การเปรียบเทียบการขยายตัวและการหดตัวของรายได้ในแต่ละปี (พ.ศ. 2555–2564)"
            subtitleEn="Expansion and contraction trajectory year-over-year"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yoyGrowthSeries} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1} />
                  <XAxis dataKey="displayYear" tick={{ fontSize: 11, fill: '#64748b' }} angle={-30} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    formatter={(val: any) => [`${Number(val).toFixed(2)}%`, language === 'th' ? 'การเติบโต YoY' : 'YoY Growth']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="yoy">
                    {yoyGrowthSeries.map((entry, idx) => (
                      <Cell
                        key={`yoy-${idx}`}
                        fill={entry.yoy >= 0 ? '#059669' : '#dc2626'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* SECTION A: Tourist Income Distribution (2562–2563) */}
        <div className="lg:col-span-12">
          <ChartCard
            titleTh="ระดับรายได้ประจำปีของนักท่องเที่ยว (Tourist Annual Income)"
            titleEn="Annual Income Level of Tourists"
            subtitleTh="การกระจายตัวของนักท่องเที่ยวตาม 4 ระดับรายได้ต่อปี (ครอบคลุมเฉพาะปี พ.ศ. 2562–2563)"
            subtitleEn="Tourist distribution across 4 annual income tiers (Available only for 2562–2563 BE)"
          >
            {!incomeAvailability.isAvailable ? (
              <DataAvailabilityNotice availableYears={availableIncomeYears} selectedYear={selectedYear} />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeSummary} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                    <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#334155' }} width={160} />
                    <Tooltip
                      formatter={(val: any, _, item: any) => [
                        `${formatNumber(Number(val))} คน (${item.payload.pct.toFixed(2)}%)`,
                        language === 'th' ? 'จำนวนนักท่องเที่ยว' : 'Tourist Count',
                      ]}
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                    />
                    <Bar dataKey="value" fill="#d97706" radius={[0, 4, 4, 0]}>
                      <Cell fill="#0ea5e9" />
                      <Cell fill="#1e3a8a" />
                      <Cell fill="#d97706" />
                      <Cell fill="#94a3b8" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={tableData}
        columns={tableColumns}
        filename={`ASEAN_Revenue_Income_${selectedYear}.csv`}
        defaultSortKey="revenue"
        titleTh={`ตารางตรวจสอบสถิติรายได้และระดับรายได้ (${selectedYear === 'all' ? 'ทุกปี พ.ศ. 2554–2564' : `ปี พ.ศ. ${selectedYear}`})`}
        titleEn={`Revenue & Income Statistical Table (${selectedYear === 'all' ? 'All Years 2554–2564 BE' : `Year ${selectedYear} BE`})`}
      />
    </div>
  );
};
