import React, { useState, useMemo } from 'react';
import { Wallet, DollarSign, ShoppingBag, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useDashboard } from '../context/DashboardContext';
import { KpiCard } from '../components/common/KpiCard';
import { ChartCard } from '../components/common/ChartCard';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { InsightBox } from '../components/common/InsightBox';
import { DataAvailabilityNotice } from '../components/common/DataAvailabilityNotice';
import {
  calculateAverage,
  calculateTotal,
  calculatePercentage,
  calculatePercentageChange,
  filterByYear,
  filterByCountry,
  getAvailableYears,
  getDatasetAvailability,
  getYoYChange,
} from '../utils/calculations';
import { formatNumber, formatYear } from '../utils/formatters';
import { getCountryName, getCategoryName } from '../utils/translations';
import { ASEAN_COUNTRIES } from '../data/datasetMetadata';

const ITEM_COLORS = [
  '#1e3a8a', '#d97706', '#059669', '#7c3aed', '#ec4899', '#0284c7', '#64748b'
];

const EXPENSE_ITEMS_KEYS: { key: string; labelTh: string }[] = [
  { key: 'souvenirs', labelTh: 'ค่าซื้อสินค้าที่ระลึก' },
  { key: 'foodDrink', labelTh: 'ค่าอาหารและเครื่องดื่ม' },
  { key: 'transport', labelTh: 'ค่าพาหนะในการเดินทาง' },
  { key: 'entertainment', labelTh: 'ค่าใช้จ่ายเพื่อการบันเทิง' },
  { key: 'tourServices', labelTh: 'ค่าบริการท่องเที่ยว' },
  { key: 'medical', labelTh: 'การรักษาพยาบาล' },
  { key: 'miscellaneous', labelTh: 'เบ็ดเตล็ด' },
];

export const ExpensesPage: React.FC = () => {
  const {
    datasets,
    selectedYear,
    selectedCountry,
    setSelectedCountry,
    weightMode,
    setWeightMode,
    language,
  } = useDashboard();
  const [currency, setCurrency] = useState<'THB' | 'USD'>('THB');

  const dailyData = datasets?.dailyExpenses || [];
  const itemsData = datasets?.expensesItems || [];
  const touristData = datasets?.touristAmount || [];

  const availableYears = useMemo(() => getAvailableYears(dailyData), [dailyData]);
  const availability = useMemo(
    () => getDatasetAvailability(availableYears, selectedYear),
    [availableYears, selectedYear]
  );

  const isDataAvailable = availability.isAvailable;

  // Filtered data
  const filteredDaily = useMemo(() => {
    let res = dailyData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);
    return res;
  }, [dailyData, selectedYear, selectedCountry]);

  const filteredItems = useMemo(() => {
    let res = itemsData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);
    return res;
  }, [itemsData, selectedYear, selectedCountry]);

  // Daily Expense Average (THB & USD) with weighting support
  const avgDailyThb = useMemo(() => {
    if (selectedCountry !== 'all' || weightMode === 'unweighted') {
      return calculateAverage(filteredDaily.map((d) => d.expenseThb));
    }
    let totalThbExp = 0;
    let totalTourists = 0;
    for (const r of filteredDaily) {
      const tRow = touristData.find((t) => t.country === r.country && t.year === r.year);
      const count = tRow?.tourists || 0;
      totalThbExp += r.expenseThb * count;
      totalTourists += count;
    }
    return totalTourists > 0 ? totalThbExp / totalTourists : 0;
  }, [filteredDaily, touristData, selectedCountry, weightMode]);

  const avgDailyUsd = useMemo(() => {
    if (selectedCountry !== 'all' || weightMode === 'unweighted') {
      return calculateAverage(filteredDaily.map((d) => d.expenseUsd));
    }
    let totalUsdExp = 0;
    let totalTourists = 0;
    for (const r of filteredDaily) {
      const tRow = touristData.find((t) => t.country === r.country && t.year === r.year);
      const count = tRow?.tourists || 0;
      totalUsdExp += r.expenseUsd * count;
      totalTourists += count;
    }
    return totalTourists > 0 ? totalUsdExp / totalTourists : 0;
  }, [filteredDaily, touristData, selectedCountry, weightMode]);

  // Spending by Item Summary (sorted descending)
  const itemsSummary = useMemo(() => {
    const list = EXPENSE_ITEMS_KEYS.map((k) => {
      const val = calculateAverage(filteredItems.map((d: any) => d[k.key] || 0));
      return {
        key: k.key,
        category: k.labelTh,
        label: getCategoryName(k.labelTh, language),
        value: val,
      };
    });

    const total = calculateTotal(list.map((d) => d.value));

    return list
      .map((item) => ({
        ...item,
        pct: calculatePercentage(item.value, total),
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredItems, language]);

  // Top spending item
  const topExpenseItem = useMemo(() => {
    return itemsSummary.length > 0 ? itemsSummary[0] : null;
  }, [itemsSummary]);

  // Yearly Trend of Daily Expenses
  const yearlyTrend = useMemo(() => {
    return availableYears.map((yr) => {
      let rows = filterByYear(dailyData, yr);
      if (selectedCountry !== 'all') {
        rows = filterByCountry(rows, selectedCountry);
        const thb = calculateAverage(rows.map((d) => d.expenseThb));
        const usd = calculateAverage(rows.map((d) => d.expenseUsd));
        return {
          year: yr,
          displayYear: formatYear(yr, language),
          expenseThb: parseFloat(thb.toFixed(2)),
          expenseUsd: parseFloat(usd.toFixed(2)),
        };
      } else if (weightMode === 'weighted') {
        let tThb = 0;
        let tUsd = 0;
        let tCount = 0;
        for (const r of rows) {
          const t = touristData.find((d) => d.country === r.country && d.year === yr);
          const count = t?.tourists || 0;
          tThb += r.expenseThb * count;
          tUsd += r.expenseUsd * count;
          tCount += count;
        }
        return {
          year: yr,
          displayYear: formatYear(yr, language),
          expenseThb: parseFloat((tCount > 0 ? tThb / tCount : 0).toFixed(2)),
          expenseUsd: parseFloat((tCount > 0 ? tUsd / tCount : 0).toFixed(2)),
        };
      } else {
        const thb = calculateAverage(rows.map((d) => d.expenseThb));
        const usd = calculateAverage(rows.map((d) => d.expenseUsd));
        return {
          year: yr,
          displayYear: formatYear(yr, language),
          expenseThb: parseFloat(thb.toFixed(2)),
          expenseUsd: parseFloat(usd.toFixed(2)),
        };
      }
    });
  }, [dailyData, touristData, availableYears, selectedCountry, weightMode, language]);

  // YoY Expense Change
  const currentYoY = useMemo(() => {
    const series = yearlyTrend.map((d) => ({
      year: d.year,
      value: currency === 'THB' ? d.expenseThb : d.expenseUsd,
    }));
    if (selectedYear === 'all') {
      if (series.length < 2) return null;
      return calculatePercentageChange(series[series.length - 1].value, series[series.length - 2].value);
    } else {
      return getYoYChange(selectedYear, series);
    }
  }, [yearlyTrend, selectedYear, currency]);

  // By Country Daily Expense
  const countryDailyExpenses = useMemo(() => {
    const effYear = selectedYear === 'all' ? availableYears[availableYears.length - 1] : selectedYear;
    const rows = filterByYear(dailyData, effYear);

    return ASEAN_COUNTRIES.map((c) => {
      const r = rows.find((d) => d.country === c.th);
      return {
        country: c.th,
        countryName: getCountryName(c.th, language),
        expenseThb: r ? r.expenseThb : 0,
        expenseUsd: r ? r.expenseUsd : 0,
        displayValue: r ? (currency === 'THB' ? r.expenseThb : r.expenseUsd) : 0,
      };
    }).sort((a, b) => b.displayValue - a.displayValue);
  }, [dailyData, selectedYear, availableYears, currency, language]);

  // Inspection Table Data
  const tableData = useMemo(() => {
    const countries = selectedCountry === 'all' ? ASEAN_COUNTRIES : ASEAN_COUNTRIES.filter((c) => c.th === selectedCountry);

    if (selectedYear !== 'all') {
      const dRows = filterByYear(dailyData, selectedYear);
      const iRows = filterByYear(itemsData, selectedYear);

      return countries.map((c) => {
        const d = dRows.find((r) => r.country === c.th);
        const i = iRows.find((r) => r.country === c.th);

        return {
          country: c.th,
          countryName: getCountryName(c.th, language),
          year: selectedYear,
          thb: d?.expenseThb || 0,
          usd: d?.expenseUsd || 0,
          souvenirs: i?.souvenirs || 0,
          foodDrink: i?.foodDrink || 0,
          transport: i?.transport || 0,
          entertainment: i?.entertainment || 0,
          tourServices: i?.tourServices || 0,
          medical: i?.medical || 0,
          miscellaneous: i?.miscellaneous || 0,
        };
      });
    }

    // All Years: generate rows for each year (2554–2563) and country, sorted by year descending
    const rows: any[] = [];
    const sortedYears = [...availableYears].sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

    for (const yr of sortedYears) {
      const dRows = filterByYear(dailyData, yr);
      const iRows = filterByYear(itemsData, yr);

      for (const c of countries) {
        const d = dRows.find((r) => r.country === c.th);
        const i = iRows.find((r) => r.country === c.th);

        rows.push({
          country: c.th,
          countryName: getCountryName(c.th, language),
          year: yr,
          thb: d?.expenseThb || 0,
          usd: d?.expenseUsd || 0,
          souvenirs: i?.souvenirs || 0,
          foodDrink: i?.foodDrink || 0,
          transport: i?.transport || 0,
          entertainment: i?.entertainment || 0,
          tourServices: i?.tourServices || 0,
          medical: i?.medical || 0,
          miscellaneous: i?.miscellaneous || 0,
        });
      }
    }

    return rows;
  }, [dailyData, itemsData, selectedYear, selectedCountry, availableYears, language]);

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
      headerTh: 'ค่าใช้จ่าย (บาท/วัน)',
      headerEn: 'Daily Exp (THB)',
      accessor: 'thb',
      align: 'right',
      cell: (v) => formatNumber(v, 2),
    },
    {
      headerTh: 'ค่าใช้จ่าย (USD/วัน)',
      headerEn: 'Daily Exp (USD)',
      accessor: 'usd',
      align: 'right',
      cell: (v) => formatNumber(v, 2),
    },
    {
      headerTh: 'ของที่ระลึก (บาท)',
      headerEn: 'Souvenirs (THB)',
      accessor: 'souvenirs',
      align: 'right',
      cell: (v) => formatNumber(v, 2),
    },
    {
      headerTh: 'อาหารและเครื่องดื่ม',
      headerEn: 'Food & Beverage',
      accessor: 'foodDrink',
      align: 'right',
      cell: (v) => formatNumber(v, 2),
    },
    {
      headerTh: 'พาหนะเดินทาง',
      headerEn: 'Transport',
      accessor: 'transport',
      align: 'right',
      cell: (v) => formatNumber(v, 2),
    },
  ];

  // Factual insights
  const insights = useMemo(() => {
    const th: string[] = [];
    const en: string[] = [];

    if (countryDailyExpenses.length > 0) {
      const top = countryDailyExpenses[0];
      const effYr = selectedYear === 'all' ? `ปีล่าสุด (พ.ศ. ${availableYears[availableYears.length - 1]})` : `ปี พ.ศ. ${selectedYear}`;
      const effYrEn = selectedYear === 'all' ? `the latest year (${availableYears[availableYears.length - 1]} BE)` : `year ${selectedYear} BE`;

      th.push(
        `ใน${effYr} นักท่องเที่ยวจาก${top.country}มีค่าใช้จ่ายเฉลี่ยต่อวันสูงสุดอยู่ที่ ${formatNumber(
          top.expenseThb,
          2
        )} บาท/วัน (${formatNumber(top.expenseUsd, 2)} USD/วัน)`
      );
      en.push(
        `In ${effYrEn}, tourists from ${top.countryName} spent the most per day at ${formatNumber(
          top.expenseThb,
          2
        )} THB/day (${formatNumber(top.expenseUsd, 2)} USD/day).`
      );
    }

    if (topExpenseItem) {
      th.push(
        `หมวดค่าใช้จ่ายที่มีสัดส่วนสูงสุดคือ ${topExpenseItem.label} คิดเป็น ${topExpenseItem.pct.toFixed(
          2
        )}% ของโครงสร้างค่าใช้จ่ายเฉลี่ย`
      );
      en.push(
        `The largest expenditure component is ${topExpenseItem.label} accounting for ${topExpenseItem.pct.toFixed(
          2
        )}% of daily spending.`
      );
    }

    if (currentYoY !== null) {
      const isPos = currentYoY > 0;
      th.push(
        `ค่าใช้จ่ายเฉลี่ยต่อวัน${isPos ? 'เพิ่มขึ้น' : 'ลดลง'} ${Math.abs(currentYoY).toFixed(2)}% เมื่อเทียบกับปีก่อนหน้า`
      );
      en.push(
        `Average daily spending ${isPos ? 'increased' : 'decreased'} by ${Math.abs(currentYoY).toFixed(2)}% compared to the preceding year.`
      );
    }

    return { th, en };
  }, [countryDailyExpenses, topExpenseItem, currentYoY, selectedYear, availableYears]);

  if (!isDataAvailable) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {language === 'th' ? '06 ค่าใช้จ่ายของนักท่องเที่ยว' : '06 Tourist Expenses'}
          </h2>
        </div>
        <DataAvailabilityNotice availableYears={availableYears} selectedYear={selectedYear} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {language === 'th' ? '06 ค่าใช้จ่ายของนักท่องเที่ยว' : '06 Tourist Expenses'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {language === 'th'
              ? 'การวิเคราะห์พฤติกรรมการใช้จ่ายรายวันและจำแนกตาม 7 หมวดรายการ (พ.ศ. 2554–2563)'
              : 'Analysis of daily expenditures and breakdown across 7 spending items (2554–2563 BE).'}
          </p>
        </div>

        {/* Switchers Group */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          {/* Weight Mode Switcher */}
          <div className="flex flex-col items-start lg:items-end gap-1">
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

          {/* Currency Switcher */}
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-xs font-medium text-slate-500 pl-2">
              {language === 'th' ? 'สกุลเงิน:' : 'Currency:'}
            </span>
            <button
              onClick={() => setCurrency('THB')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                currency === 'THB'
                  ? 'bg-brand-blue text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              บาท (THB)
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                currency === 'USD'
                  ? 'bg-brand-blue text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          titleTh="ค่าใช้จ่ายเฉลี่ยต่อวัน"
          titleEn="Average Daily Expenditure"
          value={currency === 'THB' ? formatNumber(avgDailyThb, 2) : formatNumber(avgDailyUsd, 2)}
          unitTh={currency === 'THB' ? 'บาท/คน/วัน' : 'USD/คน/วัน'}
          unitEn={currency === 'THB' ? 'THB/Person/Day' : 'USD/Person/Day'}
          change={currentYoY}
          changeLabelTh="YoY เติบโต"
          changeLabelEn="YoY Growth"
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
          icon={currency === 'THB' ? <Wallet className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="หมวดค่าใช้จ่ายสูงสุด"
          titleEn="Top Spending Category"
          value={topExpenseItem ? topExpenseItem.label : '-'}
          subtextTh={topExpenseItem ? `${formatNumber(topExpenseItem.value, 2)} บาท/คน/วัน (${topExpenseItem.pct.toFixed(2)}%)` : ''}
          subtextEn={topExpenseItem ? `${formatNumber(topExpenseItem.value, 2)} THB/day (${topExpenseItem.pct.toFixed(2)}%)` : ''}
          icon={<ShoppingBag className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="อัตราการเปลี่ยนแปลงจากปีก่อน"
          titleEn="YoY Expense Growth"
          value={currentYoY !== null ? (currentYoY > 0 ? `+${currentYoY.toFixed(2)}%` : `${currentYoY.toFixed(2)}%`) : '-'}
          status={currentYoY !== null ? (currentYoY > 0 ? 'positive' : currentYoY < 0 ? 'negative' : 'neutral') : 'neutral'}
          subtextTh="เทียบกับปีก่อนหน้า"
          subtextEn="Compared to previous year"
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Dynamic Factual Insight Box */}
      <InsightBox insightsTh={insights.th} insightsEn={insights.en} />

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION A: Average Daily Expenditure by Country */}
        <div className="lg:col-span-7">
          <ChartCard
            titleTh={`ค่าใช้จ่ายเฉลี่ยต่อวันจำแนกตามประเทศ (${currency})`}
            titleEn={`Average Daily Expenditure by Country (${currency})`}
            subtitleTh={`ข้อมูลประจำ${selectedYear === 'all' ? 'ปีล่าสุด' : `ปี พ.ศ. ${selectedYear}`}`}
            subtitleEn={`Data for ${selectedYear === 'all' ? 'latest year' : `year ${selectedYear} BE`}`}
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={countryDailyExpenses} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="countryName" tick={{ fontSize: 11, fill: '#334155' }} width={95} />
                  <Tooltip
                    formatter={(val: any) => [
                      `${formatNumber(Number(val), 2)} ${currency === 'THB' ? 'บาท/วัน' : 'USD/day'}`,
                      language === 'th' ? 'ค่าใช้จ่ายเฉลี่ย' : 'Daily Expenditure',
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="displayValue" fill="#1e3a8a" radius={[0, 4, 4, 0]}>
                    {countryDailyExpenses.map((entry, idx) => (
                      <Cell
                        key={`exp-${idx}`}
                        fill={selectedCountry === entry.country ? '#d97706' : '#1e3a8a'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* SECTION C: Expense Composition Donut */}
        <div className="lg:col-span-5">
          <ChartCard
            titleTh="สัดส่วนโครงสร้างค่าใช้จ่าย (%)"
            titleEn="Expenditure Composition (%)"
            subtitleTh="ร้อยละของค่าใช้จ่ายจำแนกตาม 7 หมวดรายการ"
            subtitleEn="Percentage distribution across 7 spending items"
          >
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={itemsSummary}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {itemsSummary.map((_, idx) => (
                      <Cell key={`donut-${idx}`} fill={ITEM_COLORS[idx % ITEM_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${formatNumber(Number(val), 2)} บาท (${item.payload.pct.toFixed(2)}%)`,
                      name,
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* SECTION B: Expenditure by Item Bar Chart */}
        <div className="lg:col-span-6">
          <ChartCard
            titleTh="ค่าใช้จ่ายจำแนกตามหมวดรายการ (บาท/คน/วัน)"
            titleEn="Expenditure by Item (THB/Person/Day)"
            subtitleTh="ค่าใช้จ่ายเฉลี่ยต่อคนต่อวันในแต่ละหมวด"
            subtitleEn="Average spending per person per day by category"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={itemsSummary} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#334155' }} width={130} />
                  <Tooltip
                    formatter={(val: any) => [
                      `${formatNumber(Number(val), 2)} บาท/คน/วัน`,
                      language === 'th' ? 'ค่าใช้จ่าย' : 'Spending',
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {itemsSummary.map((_, idx) => (
                      <Cell key={`item-${idx}`} fill={ITEM_COLORS[idx % ITEM_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* SECTION D: Time Trend */}
        <div className="lg:col-span-6">
          <ChartCard
            titleTh={`แนวโน้มค่าใช้จ่ายเฉลี่ยต่อวันรายปี (${currency})`}
            titleEn={`Average Daily Expenditure by Year (${currency})`}
            subtitleTh="แนวโน้มการเปลี่ยนแปลงของค่าใช้จ่ายตลอดช่วง 10 ปี (พ.ศ. 2554–2563)"
            subtitleEn="10-year temporal trend of daily spending (2554–2563 BE)"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyTrend} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="displayYear" tick={{ fontSize: 11, fill: '#64748b' }} angle={-30} textAnchor="end" height={40} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(val: any) => [
                      `${formatNumber(Number(val), 2)} ${currency === 'THB' ? 'บาท/วัน' : 'USD/day'}`,
                      language === 'th' ? 'ค่าใช้จ่ายเฉลี่ย' : 'Daily Expenditure',
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey={currency === 'THB' ? 'expenseThb' : 'expenseUsd'}
                    stroke="#1e3a8a"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#1e3a8a' }}
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
        filename={`ASEAN_Expenses_${selectedYear}.csv`}
        defaultSortKey="thb"
        titleTh={`ตารางตรวจสอบสถิติค่าใช้จ่ายของนักท่องเที่ยว (${selectedYear === 'all' ? 'ทุกปี พ.ศ. 2554–2563' : `ปี พ.ศ. ${selectedYear}`})`}
        titleEn={`Tourist Expenses Statistical Table (${selectedYear === 'all' ? 'All Years 2554–2563 BE' : `Year ${selectedYear} BE`})`}
      />
    </div>
  );
};
