import React, { useMemo } from 'react';
import { Target, Compass, Briefcase } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
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
  filterByYear,
  filterByCountry,
  getAvailableYears,
  getDatasetAvailability,
} from '../utils/calculations';
import { formatNumber, formatPercentage, formatYear } from '../utils/formatters';
import { getCountryName, getCategoryName } from '../utils/translations';
import { ASEAN_COUNTRIES } from '../data/datasetMetadata';

const GOAL_KEYS: { key: string; labelTh: string }[] = [
  { key: 'tourism', labelTh: 'ท่องเที่ยว' },
  { key: 'business', labelTh: 'ธุรกิจ' },
  { key: 'orgMeeting', labelTh: 'ประชุมของหน่วยงาน' },
  { key: 'assocMeeting', labelTh: 'ประชุมของสมาคม' },
  { key: 'bizMeeting', labelTh: 'ประชุมเชิงธุรกิจ' },
  { key: 'exhibition', labelTh: 'งานแสดงสินค้า/นิทรรศการ' },
  { key: 'medical', labelTh: 'ทางการแพทย์' },
  { key: 'education', labelTh: 'การศึกษา' },
  { key: 'sports', labelTh: 'การกีฬา' },
  { key: 'transport', labelTh: 'การขนส่ง' },
  { key: 'employment', labelTh: 'การจ้างแรงงาน' },
  { key: 'other', labelTh: 'อื่น_ๆ' },
];

export const TravelObjectivesPage: React.FC = () => {
  const { datasets, selectedYear, selectedCountry, setSelectedCountry, language } = useDashboard();

  const goalData = datasets?.goal || [];
  const availableYears = useMemo(() => getAvailableYears(goalData), [goalData]);
  const availability = useMemo(
    () => getDatasetAvailability(availableYears, selectedYear),
    [availableYears, selectedYear]
  );

  const isDataAvailable = availability.isAvailable;

  // Filtered data
  const filteredGoal = useMemo(() => {
    let res = goalData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);
    return res;
  }, [goalData, selectedYear, selectedCountry]);

  // Overall Goal Summary (sorted descending)
  const goalSummary = useMemo(() => {
    const list = GOAL_KEYS.map((g) => {
      const val = calculateTotal(filteredGoal.map((d: any) => d[g.key] || 0));
      return {
        key: g.key,
        category: g.labelTh,
        label: getCategoryName(g.labelTh, language),
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
  }, [filteredGoal, language]);

  // Total tourists across all goals
  const totalGoalTourists = useMemo(() => {
    return calculateTotal(goalSummary.map((d) => d.value));
  }, [goalSummary]);

  // Top purpose
  const topGoal = useMemo(() => {
    return goalSummary.length > 0 ? goalSummary[0] : null;
  }, [goalSummary]);

  // Leisure / Holiday share
  const leisureShare = useMemo(() => {
    const tourism = goalSummary.find((g) => g.key === 'tourism');
    return tourism ? tourism.pct : 0;
  }, [goalSummary]);

  // Business & MICE share (business + orgMeeting + assocMeeting + bizMeeting + exhibition)
  const miceShare = useMemo(() => {
    const miceKeys = ['business', 'orgMeeting', 'assocMeeting', 'bizMeeting', 'exhibition'];
    const miceVal = calculateTotal(
      goalSummary.filter((g) => miceKeys.includes(g.key)).map((g) => g.value)
    );
    return calculatePercentage(miceVal, totalGoalTourists);
  }, [goalSummary, totalGoalTourists]);

  // Country × Purpose Stacked Data (Top 4 purposes + Other)
  const countryPurposeStacked = useMemo(() => {
    const base = selectedYear !== 'all' ? filterByYear(goalData, selectedYear) : goalData;

    return ASEAN_COUNTRIES.map((c) => {
      const rows = filterByCountry(base, c.th);
      const tourism = calculateTotal(rows.map((d) => d.tourism));
      const business = calculateTotal(rows.map((d) => d.business));
      const meetings = calculateTotal(
        rows.map((d) => d.orgMeeting + d.assocMeeting + d.bizMeeting + d.exhibition)
      );
      const medical = calculateTotal(rows.map((d) => d.medical));
      const other = calculateTotal(
        rows.map((d) => d.sports + d.transport + d.employment + d.education + d.other)
      );

      const total = tourism + business + meetings + medical + other;

      return {
        country: c.th,
        countryName: getCountryName(c.th, language),
        tourism: total > 0 ? calculatePercentage(tourism, total) : 0,
        business: total > 0 ? calculatePercentage(business, total) : 0,
        meetings: total > 0 ? calculatePercentage(meetings, total) : 0,
        medical: total > 0 ? calculatePercentage(medical, total) : 0,
        other: total > 0 ? calculatePercentage(other, total) : 0,
      };
    });
  }, [goalData, selectedYear, language]);

  // Inspection Table Data
  const tableData = useMemo(() => {
    const countries = selectedCountry === 'all' ? ASEAN_COUNTRIES : ASEAN_COUNTRIES.filter((c) => c.th === selectedCountry);

    if (selectedYear !== 'all') {
      const base = filterByYear(goalData, selectedYear);

      return countries.map((c) => {
        const row = base.find((d) => d.country === c.th);
        return {
          country: c.th,
          countryName: getCountryName(c.th, language),
          year: selectedYear,
          tourism: row?.tourism || 0,
          business: row?.business || 0,
          meetings:
            (row?.orgMeeting || 0) +
            (row?.assocMeeting || 0) +
            (row?.bizMeeting || 0) +
            (row?.exhibition || 0),
          medical: row?.medical || 0,
          education: row?.education || 0,
          other: (row?.sports || 0) + (row?.transport || 0) + (row?.employment || 0) + (row?.other || 0),
        };
      });
    }

    // All Years: generate rows for each year (2554–2563) and country, sorted by year descending
    const rows: any[] = [];
    const sortedYears = [...availableYears].sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

    for (const yr of sortedYears) {
      const base = filterByYear(goalData, yr);

      for (const c of countries) {
        const row = base.find((d) => d.country === c.th);
        rows.push({
          country: c.th,
          countryName: getCountryName(c.th, language),
          year: yr,
          tourism: row?.tourism || 0,
          business: row?.business || 0,
          meetings:
            (row?.orgMeeting || 0) +
            (row?.assocMeeting || 0) +
            (row?.bizMeeting || 0) +
            (row?.exhibition || 0),
          medical: row?.medical || 0,
          education: row?.education || 0,
          other: (row?.sports || 0) + (row?.transport || 0) + (row?.employment || 0) + (row?.other || 0),
        });
      }
    }

    return rows;
  }, [goalData, selectedYear, selectedCountry, availableYears, language]);

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
      headerTh: 'ท่องเที่ยว (คน)',
      headerEn: 'Holiday (Persons)',
      accessor: 'tourism',
      align: 'right',
      cell: (v) => formatNumber(v),
    },
    {
      headerTh: 'ธุรกิจ (คน)',
      headerEn: 'Business',
      accessor: 'business',
      align: 'right',
      cell: (v) => formatNumber(v),
    },
    {
      headerTh: 'การประชุม/นิทรรศการ (MICE)',
      headerEn: 'Meetings & MICE',
      accessor: 'meetings',
      align: 'right',
      cell: (v) => formatNumber(v),
    },
    {
      headerTh: 'ทางการแพทย์ (คน)',
      headerEn: 'Medical',
      accessor: 'medical',
      align: 'right',
      cell: (v) => formatNumber(v),
    },
    {
      headerTh: 'การศึกษา (คน)',
      headerEn: 'Education',
      accessor: 'education',
      align: 'right',
      cell: (v) => formatNumber(v),
    },
  ];

  // Factual insights
  const insights = useMemo(() => {
    const th: string[] = [];
    const en: string[] = [];

    if (topGoal) {
      th.push(
        `วัตถุประสงค์หลักอันดับ 1 ของนักท่องเที่ยวอาเซียนคือ ${topGoal.label} มีจำนวน ${formatNumber(
          topGoal.value
        )} คน คิดเป็นสัดส่วน ${topGoal.pct.toFixed(2)}% ของวัตถุประสงค์ทั้งหมด`
      );
      en.push(
        `The primary travel purpose for ASEAN tourists is ${topGoal.label} with ${formatNumber(
          topGoal.value
        )} arrivals (${topGoal.pct.toFixed(2)}% of total objectives).`
      );
    }

    if (miceShare > 0) {
      th.push(
        `กลุ่มการเดินทางเพื่อธุรกิจและการประชุมสัมมนา/นิทรรศการ (MICE) มีสัดส่วนรวม ${miceShare.toFixed(2)}%`
      );
      en.push(
        `Business and MICE-related visits (meetings, conventions, exhibitions) comprise ${miceShare.toFixed(2)}% of all travel.`
      );
    }

    return { th, en };
  }, [topGoal, miceShare]);

  if (!isDataAvailable) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {language === 'th' ? '04 วัตถุประสงค์การเดินทาง' : '04 Travel Objectives'}
          </h2>
        </div>
        <DataAvailabilityNotice availableYears={availableYears} selectedYear={selectedYear} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {language === 'th' ? '04 วัตถุประสงค์การเดินทาง' : '04 Travel Objectives'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {language === 'th'
            ? 'การวิเคราะห์เป้าหมายและวัตถุประสงค์หลัก 12 หมวดของนักท่องเที่ยวประชาคมเศรษฐกิจอาเซียน (พ.ศ. 2554–2563)'
            : 'Analysis of primary travel purposes across 12 categories for ASEAN visitors (2554–2563 BE).'}
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          titleTh="วัตถุประสงค์หลักอันดับ 1"
          titleEn="Primary Travel Purpose"
          value={topGoal ? topGoal.label : '-'}
          subtextTh={topGoal ? `${formatNumber(topGoal.value)} คน (${topGoal.pct.toFixed(2)}%)` : ''}
          subtextEn={topGoal ? `${formatNumber(topGoal.value)} persons (${topGoal.pct.toFixed(2)}%)` : ''}
          icon={<Target className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="สัดส่วนการท่องเที่ยวพักผ่อน"
          titleEn="Holiday & Leisure Share"
          value={formatPercentage(leisureShare)}
          subtextTh="เดินทางเพื่อการท่องเที่ยวและพักผ่อน"
          subtextEn="Travel for vacation & leisure"
          icon={<Compass className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="สัดส่วนธุรกิจและการประชุม (MICE)"
          titleEn="Business & MICE Share"
          value={formatPercentage(miceShare)}
          subtextTh="รวมธุรกิจ ประชุมหน่วยงาน สมาคม และนิทรรศการ"
          subtextEn="Includes corporate, association meetings & expos"
          icon={<Briefcase className="w-5 h-5" />}
        />
      </div>

      {/* Dynamic Factual Insight Box */}
      <InsightBox insightsTh={insights.th} insightsEn={insights.en} />

      {/* Main Chart: Horizontal Bar Chart of Purpose of Travel */}
      <ChartCard
        titleTh="วัตถุประสงค์การเดินทาง (Purpose of Travel)"
        titleEn="Purpose of Travel Breakdown"
        subtitleTh="เรียงลำดับจากวัตถุประสงค์ที่มีจำนวนนักท่องเที่ยวสูงสุดไปน้อยสุด"
        subtitleEn="Ranked in descending order from highest to lowest"
      >
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={goalSummary} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
              />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#334155' }} width={140} />
              <Tooltip
                formatter={(val: any, _, item: any) => [
                  `${formatNumber(Number(val))} ${language === 'th' ? 'คน' : 'Persons'} (${item.payload.pct.toFixed(2)}%)`,
                  language === 'th' ? 'จำนวนนักท่องเที่ยว' : 'Tourist Arrivals',
                ]}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="value" fill="#1e3a8a" radius={[0, 4, 4, 0]}>
                {goalSummary.map((_, idx) => (
                  <Cell key={`goal-${idx}`} fill={idx === 0 ? '#1e3a8a' : idx === 1 ? '#d97706' : '#0284c7'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Cross-Analysis: Country × Purpose 100% Stacked Bar */}
      <ChartCard
        titleTh="การวิเคราะห์ร่วม: สัดส่วนวัตถุประสงค์จำแนกตามประเทศอาเซียน (Country × Purpose %)"
        titleEn="Cross-Analysis: Purpose Composition by Country (100% Stacked)"
        subtitleTh="เปรียบเทียบโครงสร้างวัตถุประสงค์การเดินทางของแต่ละประเทศสมาชิกอาเซียน"
        subtitleEn="100% stacked comparison of visitor motivations across member states"
      >
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={countryPurposeStacked} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="countryName"
                tick={{ fontSize: 11, fill: '#64748b' }}
                angle={-30}
                textAnchor="end"
                height={40}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
              />
              <Tooltip
                formatter={(val: any, name: any) => [`${Number(val).toFixed(2)}%`, name]}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" align="right" iconSize={10} wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
              <Bar dataKey="tourism" name={language === 'th' ? 'ท่องเที่ยว' : 'Holiday'} fill="#1e3a8a" stackId="a" />
              <Bar dataKey="business" name={language === 'th' ? 'ธุรกิจ' : 'Business'} fill="#d97706" stackId="a" />
              <Bar dataKey="meetings" name={language === 'th' ? 'ประชุม/MICE' : 'Meetings & MICE'} fill="#059669" stackId="a" />
              <Bar dataKey="medical" name={language === 'th' ? 'ทางการแพทย์' : 'Medical'} fill="#ec4899" stackId="a" />
              <Bar dataKey="other" name={language === 'th' ? 'อื่นๆ' : 'Others'} fill="#94a3b8" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Data Table */}
      <DataTable
        data={tableData}
        columns={tableColumns}
        filename={`ASEAN_Travel_Objectives_${selectedYear}.csv`}
        titleTh={`ตารางตรวจสอบสถิติวัตถุประสงค์การเดินทาง (${selectedYear === 'all' ? 'ทุกปี พ.ศ. 2554–2563' : `ปี พ.ศ. ${selectedYear}`})`}
        titleEn={`Travel Objectives Statistical Table (${selectedYear === 'all' ? 'All Years 2554–2563 BE' : `Year ${selectedYear} BE`})`}
      />
    </div>
  );
};
