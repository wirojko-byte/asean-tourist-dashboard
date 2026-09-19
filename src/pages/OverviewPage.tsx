import React, { useMemo } from 'react';
import {
  Users,
  Globe2,
  Calendar,
  TrendingUp,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
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
import {
  calculateTotal,
  calculatePercentage,
  calculatePercentageChange,
  filterByYear,
  filterByCountry,
  getAvailableYears,
  getYoYChange,
} from '../utils/calculations';
import { formatNumber, formatPercentage, formatYear } from '../utils/formatters';
import { getCountryName } from '../utils/translations';
import { ASEAN_COUNTRIES } from '../data/datasetMetadata';

const CHART_COLORS = [
  '#1e3a8a', '#d97706', '#0284c7', '#059669', '#7c3aed',
  '#dc2626', '#d946ef', '#ea580c', '#64748b'
];

export const OverviewPage: React.FC = () => {
  const { datasets, selectedYear, selectedCountry, setSelectedCountry, language } = useDashboard();

  const touristData = datasets?.touristAmount || [];
  const availableYears = useMemo(() => getAvailableYears(touristData), [touristData]);

  // Filtered by year and country
  const filteredData = useMemo(() => {
    let res = touristData;
    if (selectedYear !== 'all') {
      res = filterByYear(res, selectedYear);
    }
    if (selectedCountry !== 'all') {
      res = filterByCountry(res, selectedCountry);
    }
    return res;
  }, [touristData, selectedYear, selectedCountry]);

  // Overall ASEAN total for current selected year (for calculating share)
  const currentYearTotalAllAsean = useMemo(() => {
    const yearFiltered = selectedYear !== 'all' ? filterByYear(touristData, selectedYear) : touristData;
    return calculateTotal(yearFiltered.map((d) => d.tourists));
  }, [touristData, selectedYear]);

  // Current filtered total
  const currentTotal = useMemo(() => {
    return calculateTotal(filteredData.map((d) => d.tourists));
  }, [filteredData]);

  // Yearly trend series for the Line Chart
  const yearlyTrendData = useMemo(() => {
    const years = availableYears;
    return years.map((yr) => {
      let dataForYear = filterByYear(touristData, yr);
      if (selectedCountry !== 'all') {
        dataForYear = filterByCountry(dataForYear, selectedCountry);
      }
      const total = calculateTotal(dataForYear.map((d) => d.tourists));
      return {
        year: yr,
        displayYear: formatYear(yr, language),
        tourists: total,
      };
    });
  }, [touristData, availableYears, selectedCountry, language]);

  // YoY change calculation for current view
  const currentYoY = useMemo(() => {
    if (selectedYear === 'all') {
      // Compare latest year with previous year
      if (yearlyTrendData.length < 2) return null;
      const latest = yearlyTrendData[yearlyTrendData.length - 1].tourists;
      const prev = yearlyTrendData[yearlyTrendData.length - 2].tourists;
      return calculatePercentageChange(latest, prev);
    } else {
      return getYoYChange(selectedYear, yearlyTrendData.map((d) => ({ year: d.year, value: d.tourists })));
    }
  }, [selectedYear, yearlyTrendData]);

  // By country breakdown for Bar and Donut Charts
  const countryBreakdown = useMemo(() => {
    // If specific year selected, use that; if all years, aggregate
    const baseData = selectedYear !== 'all' ? filterByYear(touristData, selectedYear) : touristData;
    const map = new Map<string, number>();

    ASEAN_COUNTRIES.forEach((c) => map.set(c.th, 0));
    baseData.forEach((row) => {
      const cur = map.get(row.country) || 0;
      map.set(row.country, cur + row.tourists);
    });

    const totalAll = calculateTotal(Array.from(map.values()));

    return Array.from(map.entries())
      .map(([country, tourists]) => ({
        country,
        countryLabel: getCountryName(country, language),
        tourists,
        share: calculatePercentage(tourists, totalAll),
      }))
      .sort((a, b) => b.tourists - a.tourists);
  }, [touristData, selectedYear, language]);

  // Comparison Table rows with previous year change
  const comparisonTableData = useMemo(() => {
    const countries = selectedCountry === 'all' ? ASEAN_COUNTRIES : ASEAN_COUNTRIES.filter((c) => c.th === selectedCountry);

    if (selectedYear !== 'all') {
      const curYearData = filterByYear(touristData, selectedYear);
      const prevYear = String(parseInt(selectedYear, 10) - 1);
      const prevYearData = filterByYear(touristData, prevYear);
      const totalCurYear = calculateTotal(curYearData.map((d) => d.tourists));

      return countries.map((c) => {
        const curRow = curYearData.find((d) => d.country === c.th);
        const prevRow = prevYearData.find((d) => d.country === c.th);
        const tourists = curRow ? curRow.tourists : 0;
        const prevTourists = prevRow ? prevRow.tourists : 0;
        const share = calculatePercentage(tourists, totalCurYear);
        const change = prevTourists > 0 ? calculatePercentageChange(tourists, prevTourists) : null;

        return {
          country: c.th,
          countryName: getCountryName(c.th, language),
          year: selectedYear,
          tourists,
          share,
          change,
        };
      }).sort((a, b) => b.tourists - a.tourists);
    }

    // All Years: generate rows for each year and country, sorted by year descending
    const rows: any[] = [];
    const sortedYears = [...availableYears].sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

    for (const yr of sortedYears) {
      const curYearData = filterByYear(touristData, yr);
      const prevYear = String(parseInt(yr, 10) - 1);
      const prevYearData = filterByYear(touristData, prevYear);
      const totalCurYear = calculateTotal(curYearData.map((d) => d.tourists));

      for (const c of countries) {
        const curRow = curYearData.find((d) => d.country === c.th);
        const prevRow = prevYearData.find((d) => d.country === c.th);
        const tourists = curRow ? curRow.tourists : 0;
        const prevTourists = prevRow ? prevRow.tourists : 0;
        const share = calculatePercentage(tourists, totalCurYear);
        const change = prevTourists > 0 ? calculatePercentageChange(tourists, prevTourists) : null;

        rows.push({
          country: c.th,
          countryName: getCountryName(c.th, language),
          year: yr,
          tourists,
          share,
          change,
        });
      }
    }

    return rows;
  }, [touristData, selectedYear, selectedCountry, availableYears, language]);

  // Table Column Definitions
  const tableColumns: ColumnDef<any>[] = [
    {
      headerTh: 'ประเทศ',
      headerEn: 'Country',
      accessor: 'countryName',
      cell: (_, row) => (
        <button
          onClick={() => setSelectedCountry(row.country)}
          className="font-medium text-brand-blue hover:underline text-left"
          title={language === 'th' ? `คลิกเพื่อกรองเฉพาะประเทศ ${row.countryName}` : `Click to filter by ${row.countryName}`}
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
      headerTh: 'จำนวนนักท่องเที่ยว (คน)',
      headerEn: 'Arrivals (Persons)',
      accessor: 'tourists',
      align: 'right',
      cell: (val) => <span className="font-semibold text-slate-800">{formatNumber(val)}</span>,
    },
    {
      headerTh: 'สัดส่วนในอาเซียน (%)',
      headerEn: 'Share of ASEAN (%)',
      accessor: 'share',
      align: 'right',
      cell: (val) => formatPercentage(val),
    },
    {
      headerTh: 'เปลี่ยนแปลงจากปีก่อน (%)',
      headerEn: 'YoY Change (%)',
      accessor: 'change',
      align: 'right',
      cell: (val) => {
        if (val === null || val === undefined) return <span className="text-slate-400">-</span>;
        const isPos = val > 0;
        const isNeg = val < 0;
        return (
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
              isPos
                ? 'bg-emerald-50 text-emerald-700'
                : isNeg
                ? 'bg-rose-50 text-rose-700'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {isPos && <ArrowUpRight className="w-3 h-3" />}
            {isNeg && <ArrowDownRight className="w-3 h-3" />}
            {!isPos && !isNeg && <Minus className="w-3 h-3" />}
            {isPos ? `+${val.toFixed(2)}%` : `${val.toFixed(2)}%`}
          </span>
        );
      },
    },
  ];

  // Dynamic Factual Insights
  const insights = useMemo(() => {
    const listTh: string[] = [];
    const listEn: string[] = [];

    if (countryBreakdown.length > 0) {
      const top = countryBreakdown[0];
      const effYearStr = selectedYear === 'all' ? 'พ.ศ. 2554–2567' : `พ.ศ. ${selectedYear}`;
      const effYearStrEn = selectedYear === 'all' ? '2554–2567 BE' : `${selectedYear} BE`;

      listTh.push(
        `ในระยะเวลา ${effYearStr} ประเทศที่มีจำนวนนักท่องเที่ยวเดินทางเข้าไทยสูงสุดคือ ${top.country} จำนวน ${formatNumber(
          top.tourists
        )} คน คิดเป็นสัดส่วน ${top.share.toFixed(2)}% ของนักท่องเที่ยวอาเซียนทั้งหมด`
      );
      listEn.push(
        `During ${effYearStrEn}, ${top.countryLabel} recorded the highest tourist arrivals with ${formatNumber(
          top.tourists
        )} visitors, representing ${top.share.toFixed(2)}% of all ASEAN arrivals.`
      );
    }

    if (currentYoY !== null) {
      const yoyStr = currentYoY > 0 ? `เพิ่มขึ้น ${currentYoY.toFixed(2)}%` : `ลดลง ${Math.abs(currentYoY).toFixed(2)}%`;
      const yoyStrEn = currentYoY > 0 ? `increased by ${currentYoY.toFixed(2)}%` : `decreased by ${Math.abs(currentYoY).toFixed(2)}%`;
      const yrLabel = selectedYear === 'all' ? 'ปีล่าสุด' : `ปี ${selectedYear}`;
      const yrLabelEn = selectedYear === 'all' ? 'the latest recorded year' : `year ${selectedYear} BE`;

      listTh.push(`จำนวนนักท่องเที่ยวใน${yrLabel} มีอัตราการเปลี่ยนแปลง${yoyStr} เมื่อเปรียบเทียบกับปีก่อนหน้า`);
      listEn.push(`Tourist arrivals in ${yrLabelEn} ${yoyStrEn} compared to the previous year.`);
    }

    return { th: listTh, en: listEn };
  }, [countryBreakdown, selectedYear, currentYoY]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {language === 'th' ? '01 ภาพรวมการท่องเที่ยว' : '01 Tourism Overview'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {language === 'th'
            ? 'สถิติภาพรวมจำนวนนักท่องเที่ยวจาก 9 ประเทศสมาชิกประชาคมเศรษฐกิจอาเซียนที่เดินทางเข้าประเทศไทย (พ.ศ. 2554–2567)'
            : 'Statistical overview of tourist arrivals from 9 ASEAN member countries traveling to Thailand (2554–2567 BE).'}
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          titleTh="จำนวนนักท่องเที่ยวรวม"
          titleEn="Total Tourist Arrivals"
          value={formatNumber(currentTotal)}
          unitTh="คน"
          unitEn="Persons"
          change={currentYoY}
          changeLabelTh="จากปีก่อนหน้า"
          changeLabelEn="vs previous year"
          icon={<Users className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="จำนวนประเทศในอาเซียน"
          titleEn="ASEAN Countries"
          value={selectedCountry === 'all' ? '9' : '1'}
          unitTh="ประเทศ"
          unitEn="Countries"
          subtextTh={selectedCountry === 'all' ? 'ครอบคลุมครบ 9 ประเทศ' : `กรองเฉพาะ ${selectedCountry}`}
          subtextEn={selectedCountry === 'all' ? 'All 9 nations included' : `Filtered: ${getCountryName(selectedCountry, language)}`}
          icon={<Globe2 className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="ปีที่เลือก"
          titleEn="Selected Year"
          value={selectedYear === 'all' ? (language === 'th' ? 'ทุกปี' : 'All') : selectedYear}
          unitTh={selectedYear === 'all' ? '2554-2567' : 'พ.ศ.'}
          unitEn={selectedYear === 'all' ? '2554-2567 BE' : 'BE'}
          subtextTh="ช่วงข้อมูล 14 ปี"
          subtextEn="14-year data range"
          icon={<Calendar className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="การเปลี่ยนแปลงจากปีก่อน"
          titleEn="Year-over-Year Change"
          value={currentYoY !== null ? (currentYoY > 0 ? `+${currentYoY.toFixed(2)}%` : `${currentYoY.toFixed(2)}%`) : '-'}
          status={currentYoY !== null ? (currentYoY > 0 ? 'positive' : currentYoY < 0 ? 'negative' : 'neutral') : 'neutral'}
          subtextTh="คำนวณจากปีก่อนหน้าที่มีข้อมูล"
          subtextEn="Calculated from previous year"
          icon={<TrendingUp className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="สัดส่วนในอาเซียน"
          titleEn="ASEAN Market Share"
          value={
            selectedCountry === 'all'
              ? '100%'
              : formatPercentage(calculatePercentage(currentTotal, currentYearTotalAllAsean))
          }
          subtextTh={selectedCountry === 'all' ? 'รวม 9 ประเทศ' : `สัดส่วนของ ${selectedCountry}`}
          subtextEn={selectedCountry === 'all' ? 'Total across 9 countries' : `Share of ${getCountryName(selectedCountry, language)}`}
          icon={<PieIcon className="w-5 h-5" />}
        />
      </div>

      {/* Dynamic Factual Insight Box */}
      <InsightBox insightsTh={insights.th} insightsEn={insights.en} />

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart A: Line Chart - Arrivals by Year */}
        <div className="lg:col-span-12">
          <ChartCard
            titleTh="แนวโน้มจำนวนนักท่องเที่ยวรายปี (พ.ศ. 2554–2567)"
            titleEn="Tourist Arrivals by Year (2554–2567 BE)"
            subtitleTh="แสดงแนวโน้มการเติบโตและการฟื้นตัวของนักท่องเที่ยวชาวอาเซียนที่เดินทางเข้าประเทศไทย"
            subtitleEn="Displaying growth trends and recovery trajectory of ASEAN tourist arrivals to Thailand"
            footerNoteTh="*ข้อมูลปี 2563–2564 สะท้อนผลกระทบจากสถานการณ์การแพร่ระบาดของโรคโควิด-19 และการฟื้นตัวอย่างต่อเนื่องตั้งแต่ปี 2565 เป็นต้นมา"
            footerNoteEn="*Years 2563–2564 BE reflect COVID-19 border restrictions followed by steady rebound starting in 2565 BE."
          >
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearlyTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="displayYear"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    angle={-30}
                    textAnchor="end"
                    height={40}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    formatter={(value: any) => [formatNumber(Number(value)) + ' ' + (language === 'th' ? 'คน' : 'Persons'), language === 'th' ? 'จำนวนนักท่องเที่ยว' : 'Tourist Arrivals']}
                    labelFormatter={(label) => `${language === 'th' ? 'ปี' : 'Year'}: ${label}`}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tourists"
                    name={language === 'th' ? 'จำนวนนักท่องเที่ยว (คน)' : 'Tourist Arrivals (Persons)'}
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

        {/* Chart B: Bar Chart - Arrivals by Country */}
        <div className="lg:col-span-7">
          <ChartCard
            titleTh="จำนวนนักท่องเที่ยวจำแนกตามประเทศอาเซียน"
            titleEn="Tourist Arrivals by ASEAN Country"
            subtitleTh={`ข้อมูลประจำ${selectedYear === 'all' ? 'ทุกปี (รวม 2554–2567)' : `ปี พ.ศ. ${selectedYear}`} (คลิกที่แท่งกราฟเพื่อเลือกประเทศ)`}
            subtitleEn={`Data for ${selectedYear === 'all' ? 'All Years (2554–2567 BE)' : `Year ${selectedYear} BE`} (Click bar to filter)`}
          >
            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={countryBreakdown}
                  layout="vertical"
                  margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                  onClick={(data) => {
                    if (data && data.activePayload && data.activePayload[0]) {
                      const c = data.activePayload[0].payload.country;
                      setSelectedCountry(c);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <YAxis
                    type="category"
                    dataKey="countryLabel"
                    tick={{ fontSize: 11, fill: '#334155' }}
                    width={90}
                  />
                  <Tooltip
                    formatter={(val: any) => [formatNumber(Number(val)) + ' ' + (language === 'th' ? 'คน' : 'Persons'), language === 'th' ? 'นักท่องเที่ยว' : 'Arrivals']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar
                    dataKey="tourists"
                    fill="#1e3a8a"
                    radius={[0, 4, 4, 0]}
                    cursor="pointer"
                  >
                    {countryBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={selectedCountry === entry.country ? '#d97706' : '#1e3a8a'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Chart C: Donut Chart - Market Share */}
        <div className="lg:col-span-5">
          <ChartCard
            titleTh="สัดส่วนตลาดนักท่องเที่ยวอาเซียน (%)"
            titleEn="Market Share of ASEAN Arrivals (%)"
            subtitleTh="สัดส่วนร้อยละของแต่ละประเทศสมาชิกอาเซียน"
            subtitleEn="Percentage contribution of each ASEAN member state"
          >
            <div className="h-72 sm:h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={countryBreakdown}
                    dataKey="tourists"
                    nameKey="countryLabel"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                    cursor="pointer"
                    onClick={(data) => {
                      if (data && data.payload && data.payload.country) {
                        setSelectedCountry(data.payload.country);
                      }
                    }}
                  >
                    {countryBreakdown.map((entry, index) => (
                      <Cell
                        key={`donut-cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                        stroke={selectedCountry === entry.country ? '#0f172a' : '#ffffff'}
                        strokeWidth={selectedCountry === entry.country ? 2 : 1}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${formatNumber(Number(val))} ${language === 'th' ? 'คน' : 'Persons'} (${item.payload.share.toFixed(2)}%)`,
                      name
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend
                    layout="horizontal"
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
      </div>

      {/* Table D: Country Comparison Table */}
      <DataTable
        data={comparisonTableData}
        columns={tableColumns}
        filename={`ASEAN_Tourists_Comparison_${selectedYear}.csv`}
        defaultSortKey="tourists"
        titleTh={`ตารางตรวจสอบสถิติจำนวนนักท่องเที่ยว (${selectedYear === 'all' ? 'ทุกปี พ.ศ. 2554–2567' : `ปี พ.ศ. ${selectedYear}`})`}
        titleEn={`Tourist Arrivals Statistical Table (${selectedYear === 'all' ? 'All Years 2554–2567 BE' : `Year ${selectedYear} BE`})`}
        defaultExpanded={true}
      />
    </div>
  );
};
