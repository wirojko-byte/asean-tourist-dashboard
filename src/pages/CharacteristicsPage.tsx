import React, { useMemo } from 'react';
import { Users, UserCheck, Briefcase, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer,
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

const AGE_COLORS = ['#3b82f6', '#0ea5e9', '#059669', '#d97706', '#ea580c', '#8b5cf6'];

export const CharacteristicsPage: React.FC = () => {
  const { datasets, selectedYear, selectedCountry, setSelectedCountry, language } = useDashboard();

  const genderData = datasets?.gender || [];
  const ageData = datasets?.ageGroup || [];
  const occData = datasets?.occupation || [];
  const freqData = datasets?.frequency || [];

  const availableYears = useMemo(() => getAvailableYears(genderData), [genderData]);
  const availability = useMemo(
    () => getDatasetAvailability(availableYears, selectedYear),
    [availableYears, selectedYear]
  );

  // If year is not available in these datasets (coverage: 2554–2563)
  const isDataAvailable = availability.isAvailable;

  // Filtered datasets
  const filteredGender = useMemo(() => {
    let res = genderData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);
    return res;
  }, [genderData, selectedYear, selectedCountry]);

  const filteredAge = useMemo(() => {
    let res = ageData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);
    return res;
  }, [ageData, selectedYear, selectedCountry]);

  const filteredOcc = useMemo(() => {
    let res = occData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);
    return res;
  }, [occData, selectedYear, selectedCountry]);

  const filteredFreq = useMemo(() => {
    let res = freqData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);
    return res;
  }, [freqData, selectedYear, selectedCountry]);

  const freqSummary = useMemo(() => {
    const repeat = calculateTotal(filteredFreq.map((d) => d.repeat));
    const first = calculateTotal(filteredFreq.map((d) => d.first));
    const total = repeat + first;
    return {
      repeat,
      first,
      total,
      repeatPct: total > 0 ? calculatePercentage(repeat, total) : 0,
    };
  }, [filteredFreq]);

  // Gender Totals
  const genderSummary = useMemo(() => {
    const male = calculateTotal(filteredGender.map((d) => d.male));
    const female = calculateTotal(filteredGender.map((d) => d.female));
    const total = male + female;
    return {
      male,
      female,
      total,
      malePct: calculatePercentage(male, total),
      femalePct: calculatePercentage(female, total),
      data: [
        { name: language === 'th' ? 'ชาย' : 'Male', value: male, pct: calculatePercentage(male, total) },
        { name: language === 'th' ? 'หญิง' : 'Female', value: female, pct: calculatePercentage(female, total) },
      ],
    };
  }, [filteredGender, language]);

  // Age Groups Summary
  const ageSummary = useMemo(() => {
    const keys: { key: string; labelTh: string }[] = [
      { key: 'under25', labelTh: 'ต่ำกว่า_25_ปี' },
      { key: 'age25_34', labelTh: '25_-_34_ปี' },
      { key: 'age35_44', labelTh: '35_-_44_ปี' },
      { key: 'age45_54', labelTh: '45_-_54_ปี' },
      { key: 'age55_64', labelTh: '55_-_64_ปี' },
      { key: 'over65', labelTh: '65_ปีขึ้นไป' },
    ];

    const list = keys.map((k) => {
      const val = calculateTotal(filteredAge.map((d: any) => d[k.key] || 0));
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
  }, [filteredAge, language]);

  // Occupations Summary (sorted descending)
  const occSummary = useMemo(() => {
    const keys: { key: string; labelTh: string }[] = [
      { key: 'student', labelTh: 'นักเรียนและนักศึกษา' },
      { key: 'civilServant', labelTh: 'ข้าราชการและเจ้าหน้าที่รัฐวิสาหกิจ' },
      { key: 'executive', labelTh: 'นักบริหารและผู้จัดการ' },
      { key: 'professional', labelTh: 'นักวิชาชีพ' },
      { key: 'agriculture', labelTh: 'ผู้ปฏิบัติงานด้านการเกษตร' },
      { key: 'business', labelTh: 'ผู้ปฏิบัติงานธุรกิจและนักธุรกิจการค้า' },
      { key: 'laborService', labelTh: 'ผู้ใช้แรงงานและปฏิบัติงานบริการ' },
      { key: 'housewife', labelTh: 'แม่บ้าน' },
      { key: 'retiree', labelTh: 'ผู้ที่เกษียณอายุ' },
      { key: 'other', labelTh: 'อื่น_ๆ' },
      { key: 'unspecified', labelTh: 'ไม่ระบุ' },
    ];

    const list = keys.map((k) => {
      const val = calculateTotal(filteredOcc.map((d: any) => d[k.key] || 0));
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
  }, [filteredOcc, language]);

  // Cross analysis: Gender by Country
  const crossGenderByCountry = useMemo(() => {
    const base = selectedYear !== 'all' ? filterByYear(genderData, selectedYear) : genderData;
    return ASEAN_COUNTRIES.map((c) => {
      const countryRows = filterByCountry(base, c.th);
      const male = calculateTotal(countryRows.map((d) => d.male));
      const female = calculateTotal(countryRows.map((d) => d.female));
      const total = male + female;
      return {
        country: c.th,
        countryName: getCountryName(c.th, language),
        male,
        female,
        malePct: calculatePercentage(male, total),
        femalePct: calculatePercentage(female, total),
      };
    });
  }, [genderData, selectedYear, language]);

  // Dominant demographic indicators for KPIs
  const topAgeGroup = useMemo(() => {
    if (ageSummary.length === 0) return null;
    return [...ageSummary].sort((a, b) => b.value - a.value)[0];
  }, [ageSummary]);

  const topOccGroup = useMemo(() => {
    if (occSummary.length === 0) return null;
    return occSummary[0];
  }, [occSummary]);

  // Combined Demographic Table Data
  const demographicTableData = useMemo(() => {
    const countries = selectedCountry === 'all' ? ASEAN_COUNTRIES : ASEAN_COUNTRIES.filter((c) => c.th === selectedCountry);

    if (selectedYear !== 'all') {
      const gRows = filterByYear(genderData, selectedYear);
      const aRows = filterByYear(ageData, selectedYear);

      return countries.map((c) => {
        const g = gRows.find((d) => d.country === c.th);
        const a = aRows.find((d) => d.country === c.th);

        const male = g?.male || 0;
        const female = g?.female || 0;
        const totalG = male + female;

        return {
          country: c.th,
          countryName: getCountryName(c.th, language),
          year: selectedYear,
          male,
          female,
          maleRatio: totalG > 0 ? (male / female).toFixed(2) : '-',
          under25: a?.under25 || 0,
          age25_34: a?.age25_34 || 0,
          age35_44: a?.age35_44 || 0,
          age45_54: a?.age45_54 || 0,
          age55_64: a?.age55_64 || 0,
          over65: a?.over65 || 0,
        };
      });
    }

    // All Years: generate rows for each year (2554–2563) and country, sorted by year descending
    const rows: any[] = [];
    const sortedYears = [...availableYears].sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

    for (const yr of sortedYears) {
      const gRows = filterByYear(genderData, yr);
      const aRows = filterByYear(ageData, yr);

      for (const c of countries) {
        const g = gRows.find((d) => d.country === c.th);
        const a = aRows.find((d) => d.country === c.th);

        const male = g?.male || 0;
        const female = g?.female || 0;
        const totalG = male + female;

        rows.push({
          country: c.th,
          countryName: getCountryName(c.th, language),
          year: yr,
          male,
          female,
          maleRatio: totalG > 0 ? (male / female).toFixed(2) : '-',
          under25: a?.under25 || 0,
          age25_34: a?.age25_34 || 0,
          age35_44: a?.age35_44 || 0,
          age45_54: a?.age45_54 || 0,
          age55_64: a?.age55_64 || 0,
          over65: a?.over65 || 0,
        });
      }
    }

    return rows;
  }, [genderData, ageData, selectedYear, selectedCountry, availableYears, language]);

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
      headerTh: 'ชาย (คน)',
      headerEn: 'Male (Persons)',
      accessor: 'male',
      align: 'right',
      cell: (v) => formatNumber(v),
    },
    {
      headerTh: 'หญิง (คน)',
      headerEn: 'Female (Persons)',
      accessor: 'female',
      align: 'right',
      cell: (v) => formatNumber(v),
    },
    {
      headerTh: 'สัดส่วน ชาย:หญิง',
      headerEn: 'M:F Ratio',
      accessor: 'maleRatio',
      align: 'center',
    },
    {
      headerTh: '25-34 ปี',
      headerEn: '25-34 Years',
      accessor: 'age25_34',
      align: 'right',
      cell: (v) => formatNumber(v),
    },
    {
      headerTh: '35-44 ปี',
      headerEn: '35-44 Years',
      accessor: 'age35_44',
      align: 'right',
      cell: (v) => formatNumber(v),
    },
  ];

  // Factual insights
  const insights = useMemo(() => {
    const th: string[] = [];
    const en: string[] = [];

    if (genderSummary.total > 0) {
      const gLeading = genderSummary.male > genderSummary.female ? 'เพศชาย' : 'เพศหญิง';
      const gLeadingEn = genderSummary.male > genderSummary.female ? 'Male' : 'Female';
      const gPct = genderSummary.male > genderSummary.female ? genderSummary.malePct : genderSummary.femalePct;

      th.push(
        `กลุ่มนักท่องเที่ยวมีสัดส่วนของ${gLeading}สูงกว่า คิดเป็น ${gPct.toFixed(2)}% (สัดส่วนชาย:หญิง เท่ากับ ${(
          genderSummary.male / (genderSummary.female || 1)
        ).toFixed(2)})`
      );
      en.push(
        `${gLeadingEn} tourists account for the majority at ${gPct.toFixed(2)}% (Male-to-Female ratio of ${(
          genderSummary.male / (genderSummary.female || 1)
        ).toFixed(2)}).`
      );
    }

    if (topAgeGroup) {
      th.push(
        `กลุ่มอายุที่มีจำนวนนักท่องเที่ยวสูงสุดคือ ${topAgeGroup.label} มีจำนวน ${formatNumber(
          topAgeGroup.value
        )} คน (${topAgeGroup.pct.toFixed(2)}%)`
      );
      en.push(
        `The dominant age group is ${topAgeGroup.label} with ${formatNumber(
          topAgeGroup.value
        )} arrivals (${topAgeGroup.pct.toFixed(2)}%).`
      );
    }

    if (topOccGroup) {
      th.push(
        `กลุ่มอาชีพที่มีจำนวนมากที่สุดคือ ${topOccGroup.label} จำนวน ${formatNumber(
          topOccGroup.value
        )} คน คิดเป็น ${topOccGroup.pct.toFixed(2)}%`
      );
      en.push(
        `The most frequent occupation is ${topOccGroup.label} with ${formatNumber(
          topOccGroup.value
        )} arrivals (${topOccGroup.pct.toFixed(2)}%).`
      );
    }

    return { th, en };
  }, [genderSummary, topAgeGroup, topOccGroup]);

  if (!isDataAvailable) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {language === 'th' ? '02 ลักษณะทางประชากรศาสตร์' : '02 Tourist Demographics'}
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
          {language === 'th' ? '02 ลักษณะทางประชากรศาสตร์' : '02 Tourist Characteristics'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {language === 'th'
            ? 'การวิเคราะห์โครงสร้างประชากรศาสตร์ของนักท่องเที่ยวอาเซียน: เพศ กลุ่มอายุ และอาชีพ (พ.ศ. 2554–2563)'
            : 'Demographic analysis of ASEAN tourists: Gender, Age Cohorts, and Occupations (2554–2563 BE).'}
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          titleTh="สัดส่วนเพศ (ชาย : หญิง)"
          titleEn="Gender Ratio (M : F)"
          value={`${genderSummary.malePct.toFixed(1)}% : ${genderSummary.femalePct.toFixed(1)}%`}
          subtextTh={`ชาย ${formatNumber(genderSummary.male)} คน / หญิง ${formatNumber(genderSummary.female)} คน`}
          subtextEn={`M: ${formatNumber(genderSummary.male)} / F: ${formatNumber(genderSummary.female)}`}
          icon={<Users className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="กลุ่มอายุหลักที่เดินทางสูงสุด"
          titleEn="Dominant Age Group"
          value={topAgeGroup ? topAgeGroup.label : '-'}
          subtextTh={topAgeGroup ? `${formatNumber(topAgeGroup.value)} คน (${topAgeGroup.pct.toFixed(2)}%)` : ''}
          subtextEn={topAgeGroup ? `${formatNumber(topAgeGroup.value)} persons (${topAgeGroup.pct.toFixed(2)}%)` : ''}
          icon={<UserCheck className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="กลุ่มอาชีพหลักอันดับ 1"
          titleEn="Top Occupation"
          value={topOccGroup ? topOccGroup.label : '-'}
          subtextTh={topOccGroup ? `${formatNumber(topOccGroup.value)} คน (${topOccGroup.pct.toFixed(2)}%)` : ''}
          subtextEn={topOccGroup ? `${formatNumber(topOccGroup.value)} persons (${topOccGroup.pct.toFixed(2)}%)` : ''}
          icon={<Briefcase className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="ความถี่ในการเดินทาง (เดินทางซ้ำ)"
          titleEn="Visit Frequency (Repeat Rate)"
          value={formatPercentage(freqSummary.repeatPct)}
          subtextTh={`เดินทางซ้ำ ${formatNumber(freqSummary.repeat)} คน`}
          subtextEn={`Repeat visitors: ${formatNumber(freqSummary.repeat)}`}
          icon={<RefreshCw className="w-5 h-5" />}
        />
      </div>

      {/* Dynamic Factual Insight Box */}
      <InsightBox insightsTh={insights.th} insightsEn={insights.en} />

      {/* Sections A, B: Gender & Age */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION A: Gender Donut Chart */}
        <div className="lg:col-span-5">
          <ChartCard
            titleTh="การกระจายตัวตามเพศ (Gender)"
            titleEn="Tourist Distribution by Gender"
            subtitleTh="สัดส่วนเพศชายและหญิงของนักท่องเที่ยวอาเซียน"
            subtitleEn="Male and female visitor composition"
          >
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderSummary.data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    <Cell fill="#1e3a8a" />
                    <Cell fill="#ec4899" />
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${formatNumber(Number(val))} ${language === 'th' ? 'คน' : 'Persons'} (${item.payload.pct.toFixed(2)}%)`,
                      name,
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" align="center" iconSize={10} wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* SECTION B: Age Groups Horizontal Bar Chart */}
        <div className="lg:col-span-7">
          <ChartCard
            titleTh="การกระจายตัวตามกลุ่มอายุ (Age Cohorts)"
            titleEn="Tourist Distribution by Age Group"
            subtitleTh="จำแนกตามช่วงอายุ 6 หมวดวัย"
            subtitleEn="Categorized across 6 distinct age groups"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageSummary} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`}
                  />
                  <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#334155' }} width={100} />
                  <Tooltip
                    formatter={(val: any, _, item: any) => [
                      `${formatNumber(Number(val))} ${language === 'th' ? 'คน' : 'Persons'} (${item.payload.pct.toFixed(2)}%)`,
                      language === 'th' ? 'จำนวนนักท่องเที่ยว' : 'Arrivals',
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {ageSummary.map((_, idx) => (
                      <Cell key={`age-${idx}`} fill={AGE_COLORS[idx % AGE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* SECTION C: Occupation Horizontal Bar Chart */}
      <ChartCard
        titleTh="การกระจายตัวตามกลุ่มอาชีพ (Occupations)"
        titleEn="Tourist Distribution by Occupation"
        subtitleTh="เรียงลำดับจากหมวดอาชีพที่มีจำนวนนักท่องเที่ยวสูงสุดไปน้อยสุด"
        subtitleEn="Ranked in descending order from highest to lowest occupation count"
      >
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={occSummary} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#334155' }} width={150} />
              <Tooltip
                formatter={(val: any, _, item: any) => [
                  `${formatNumber(Number(val))} ${language === 'th' ? 'คน' : 'Persons'} (${item.payload.pct.toFixed(2)}%)`,
                  language === 'th' ? 'จำนวนนักท่องเที่ยว' : 'Arrivals',
                ]}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              />
              <Bar dataKey="value" fill="#1e3a8a" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* SECTION D: Cross-analysis Stacked Bar Chart */}
      <ChartCard
        titleTh="การวิเคราะห์ร่วม: สัดส่วนเพศจำแนกตามประเทศอาเซียน (Gender × Country)"
        titleEn="Cross-Analysis: Gender Breakdown by ASEAN Country"
        subtitleTh="สัดส่วนนักท่องเที่ยวเพศชายและหญิงในแต่ละประเทศ"
        subtitleEn="Proportion of male and female travelers across each member country"
      >
        <div className="h-72 sm:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={crossGenderByCountry} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="countryName"
                tick={{ fontSize: 11, fill: '#64748b' }}
                angle={-30}
                textAnchor="end"
                height={40}
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip
                formatter={(val: any, name: any) => [`${formatNumber(Number(val))} ${language === 'th' ? 'คน' : 'Persons'}`, name]}
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" align="right" iconSize={10} wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }} />
              <Bar dataKey="male" name={language === 'th' ? 'ชาย' : 'Male'} fill="#1e3a8a" stackId="a" />
              <Bar dataKey="female" name={language === 'th' ? 'หญิง' : 'Female'} fill="#ec4899" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Data Table */}
      <DataTable
        data={demographicTableData}
        columns={tableColumns}
        filename={`ASEAN_Demographics_${selectedYear}.csv`}
        titleTh={`ตารางตรวจสอบลักษณะทางประชากรศาสตร์ (${selectedYear === 'all' ? 'ทุกปี พ.ศ. 2554–2563' : `ปี พ.ศ. ${selectedYear}`})`}
        titleEn={`Demographics Statistical Table (${selectedYear === 'all' ? 'All Years 2554–2563 BE' : `Year ${selectedYear} BE`})`}
      />
    </div>
  );
};
