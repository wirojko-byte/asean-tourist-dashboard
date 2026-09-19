import React, { useMemo } from 'react';
import { RefreshCw, UserCheck, Plane, Ticket } from 'lucide-react';
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
import { getCountryName } from '../utils/translations';
import { ASEAN_COUNTRIES } from '../data/datasetMetadata';

const PIE_COLORS = ['#1e3a8a', '#d97706', '#059669', '#7c3aed', '#ec4899'];

export const TravelBehaviorPage: React.FC = () => {
  const { datasets, selectedYear, selectedCountry, setSelectedCountry, language } = useDashboard();

  const freqData = datasets?.frequency || [];
  const journeyData = datasets?.journey || [];
  const transData = datasets?.transport || [];
  const accommData = datasets?.accommodation || [];
  const flightData = datasets?.flight || [];

  const availableYears = useMemo(() => getAvailableYears(freqData), [freqData]);
  const flightYears = useMemo(() => getAvailableYears(flightData), [flightData]);

  const generalAvailability = useMemo(
    () => getDatasetAvailability(availableYears, selectedYear),
    [availableYears, selectedYear]
  );
  const flightAvailability = useMemo(
    () => getDatasetAvailability(flightYears, selectedYear),
    [flightYears, selectedYear]
  );

  // Filtered data
  const filteredFreq = useMemo(() => {
    let res = freqData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);
    return res;
  }, [freqData, selectedYear, selectedCountry]);

  const filteredJourney = useMemo(() => {
    let res = journeyData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);
    return res;
  }, [journeyData, selectedYear, selectedCountry]);

  const filteredTrans = useMemo(() => {
    let res = transData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);
    return res;
  }, [transData, selectedYear, selectedCountry]);

  const filteredAccomm = useMemo(() => {
    let res = accommData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);
    return res;
  }, [accommData, selectedYear, selectedCountry]);

  const filteredFlight = useMemo(() => {
    let res = flightData;
    if (selectedYear !== 'all') res = filterByYear(res, selectedYear);
    if (selectedCountry !== 'all') res = filterByCountry(res, selectedCountry);
    return res;
  }, [flightData, selectedYear, selectedCountry]);

  // Section A: Frequency (Repeat vs First)
  const freqSummary = useMemo(() => {
    const repeat = calculateTotal(filteredFreq.map((d) => d.repeat));
    const first = calculateTotal(filteredFreq.map((d) => d.first));
    const total = repeat + first;
    return {
      repeat,
      first,
      total,
      repeatPct: calculatePercentage(repeat, total),
      firstPct: calculatePercentage(first, total),
      data: [
        { name: language === 'th' ? 'เดินทางซ้ำ' : 'Repeat Visitor', value: repeat, pct: calculatePercentage(repeat, total) },
        { name: language === 'th' ? 'เดินทางมาครั้งแรก' : 'First-time Visitor', value: first, pct: calculatePercentage(first, total) },
      ],
    };
  }, [filteredFreq, language]);

  // Section B: Journey (FIT vs Group)
  const journeySummary = useMemo(() => {
    const fit = calculateTotal(filteredJourney.map((d) => d.independent));
    const group = calculateTotal(filteredJourney.map((d) => d.group));
    const total = fit + group;
    return {
      fit,
      group,
      total,
      fitPct: calculatePercentage(fit, total),
      groupPct: calculatePercentage(group, total),
      data: [
        { name: language === 'th' ? 'เดินทางด้วยตนเอง (FIT)' : 'Independent (FIT)', value: fit, pct: calculatePercentage(fit, total) },
        { name: language === 'th' ? 'เดินทางเป็นกลุ่ม' : 'Group Tour', value: group, pct: calculatePercentage(group, total) },
      ],
    };
  }, [filteredJourney, language]);

  // Section C: Transport (Air, Land, Water)
  const transSummary = useMemo(() => {
    const air = calculateTotal(filteredTrans.map((d) => d.air));
    const land = calculateTotal(filteredTrans.map((d) => d.land));
    const water = calculateTotal(filteredTrans.map((d) => d.water));
    const total = air + land + water;
    return {
      air,
      land,
      water,
      airPct: calculatePercentage(air, total),
      landPct: calculatePercentage(land, total),
      waterPct: calculatePercentage(water, total),
      data: [
        { name: language === 'th' ? 'ทางอากาศ' : 'Air', value: air, pct: calculatePercentage(air, total) },
        { name: language === 'th' ? 'ทางบก' : 'Land', value: land, pct: calculatePercentage(land, total) },
        { name: language === 'th' ? 'ทางน้ำ' : 'Water', value: water, pct: calculatePercentage(water, total) },
      ],
    };
  }, [filteredTrans, language]);

  // Section D: Accommodation
  const accommSummary = useMemo(() => {
    const hotel = calculateTotal(filteredAccomm.map((d) => d.hotel));
    const apt = calculateTotal(filteredAccomm.map((d) => d.apartment));
    const friends = calculateTotal(filteredAccomm.map((d) => d.friends));
    const hostel = calculateTotal(filteredAccomm.map((d) => d.hostel));
    const other = calculateTotal(filteredAccomm.map((d) => d.other));
    const total = hotel + apt + friends + hostel + other;

    const list = [
      { name: language === 'th' ? 'โรงแรม' : 'Hotels', value: hotel },
      { name: language === 'th' ? 'อพาร์ทเมนท์' : 'Apartments', value: apt },
      { name: language === 'th' ? 'บ้านเพื่อน' : 'Friends / Relatives', value: friends },
      { name: language === 'th' ? 'บ้านพักเยาวชน' : 'Hostels', value: hostel },
      { name: language === 'th' ? 'อื่นๆ' : 'Others', value: other },
    ].map((item) => ({
      ...item,
      pct: calculatePercentage(item.value, total),
    }));

    return list.sort((a, b) => b.value - a.value);
  }, [filteredAccomm, language]);

  // Section E: Flight (Scheduled vs Charter)
  const flightSummary = useMemo(() => {
    const scheduled = calculateTotal(filteredFlight.map((d) => d.scheduled));
    const charter = calculateTotal(filteredFlight.map((d) => d.charter));
    const total = scheduled + charter;
    return {
      scheduled,
      charter,
      total,
      scheduledPct: calculatePercentage(scheduled, total),
      charterPct: calculatePercentage(charter, total),
      data: [
        { name: language === 'th' ? 'เที่ยวบินแบบประจำ' : 'Scheduled Flight', value: scheduled, pct: calculatePercentage(scheduled, total) },
        { name: language === 'th' ? 'เที่ยวบินเช่าเหมาลำ' : 'Charter Flight', value: charter, pct: calculatePercentage(charter, total) },
      ],
    };
  }, [filteredFlight, language]);

  // Factual insights
  const insights = useMemo(() => {
    const th: string[] = [];
    const en: string[] = [];

    if (freqSummary.total > 0) {
      th.push(
        `นักท่องเที่ยวส่วนใหญ่เป็นกลุ่มเดินทางซ้ำ (Repeat Visitors) คิดเป็น ${freqSummary.repeatPct.toFixed(2)}% (${formatNumber(
          freqSummary.repeat
        )} คน)`
      );
      en.push(
        `The majority of tourists are repeat visitors, comprising ${freqSummary.repeatPct.toFixed(2)}% (${formatNumber(
          freqSummary.repeat
        )} arrivals).`
      );
    }

    if (journeySummary.total > 0) {
      th.push(
        `การจัดการเดินทางด้วยตนเอง (FIT) คิดเป็นสัดส่วนสูงถึง ${journeySummary.fitPct.toFixed(2)}% เมื่อเทียบกับการเดินทางเป็นกลุ่มทัวร์ (${journeySummary.groupPct.toFixed(2)}%)`
      );
      en.push(
        `Free Independent Travelers (FIT) constitute ${journeySummary.fitPct.toFixed(2)}% compared to ${journeySummary.groupPct.toFixed(2)}% for group tours.`
      );
    }

    if (transSummary.air > 0) {
      th.push(
        `ช่องทางการเดินทางเข้าประเทศหลักคือทางอากาศ คิดเป็น ${transSummary.airPct.toFixed(2)}% รองลงมาคือทางบก (${transSummary.landPct.toFixed(2)}%)`
      );
      en.push(
        `Air travel is the dominant entry mode at ${transSummary.airPct.toFixed(2)}%, followed by land border crossings at ${transSummary.landPct.toFixed(2)}%.`
      );
    }

    return { th, en };
  }, [freqSummary, journeySummary, transSummary]);

  // Inspection Table Data
  const behaviorTableData = useMemo(() => {
    const countries = selectedCountry === 'all' ? ASEAN_COUNTRIES : ASEAN_COUNTRIES.filter((c) => c.th === selectedCountry);

    if (selectedYear !== 'all') {
      const fRows = filterByYear(freqData, selectedYear);
      const jRows = filterByYear(journeyData, selectedYear);
      const tRows = filterByYear(transData, selectedYear);

      return countries.map((c) => {
        const f = fRows.find((d) => d.country === c.th);
        const j = jRows.find((d) => d.country === c.th);
        const t = tRows.find((d) => d.country === c.th);

        const repeat = f?.repeat || 0;
        const first = f?.first || 0;
        const totalF = repeat + first;

        return {
          country: c.th,
          countryName: getCountryName(c.th, language),
          year: selectedYear,
          repeat,
          first,
          repeatPct: totalF > 0 ? calculatePercentage(repeat, totalF) : 0,
          fit: j?.independent || 0,
          group: j?.group || 0,
          air: t?.air || 0,
          land: t?.land || 0,
          water: t?.water || 0,
        };
      });
    }

    // All Years: generate rows for each year (2554–2563) and country, sorted by year descending
    const rows: any[] = [];
    const sortedYears = [...availableYears].sort((a, b) => parseInt(b, 10) - parseInt(a, 10));

    for (const yr of sortedYears) {
      const fRows = filterByYear(freqData, yr);
      const jRows = filterByYear(journeyData, yr);
      const tRows = filterByYear(transData, yr);

      for (const c of countries) {
        const f = fRows.find((d) => d.country === c.th);
        const j = jRows.find((d) => d.country === c.th);
        const t = tRows.find((d) => d.country === c.th);

        const repeat = f?.repeat || 0;
        const first = f?.first || 0;
        const totalF = repeat + first;

        rows.push({
          country: c.th,
          countryName: getCountryName(c.th, language),
          year: yr,
          repeat,
          first,
          repeatPct: totalF > 0 ? calculatePercentage(repeat, totalF) : 0,
          fit: j?.independent || 0,
          group: j?.group || 0,
          air: t?.air || 0,
          land: t?.land || 0,
          water: t?.water || 0,
        });
      }
    }

    return rows;
  }, [freqData, journeyData, transData, selectedYear, selectedCountry, availableYears, language]);

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
      headerTh: 'เดินทางซ้ำ (คน)',
      headerEn: 'Repeat (Persons)',
      accessor: 'repeat',
      align: 'right',
      cell: (v) => formatNumber(v),
    },
    {
      headerTh: 'เดินทางมาครั้งแรก',
      headerEn: 'First-time',
      accessor: 'first',
      align: 'right',
      cell: (v) => formatNumber(v),
    },
    {
      headerTh: 'สัดส่วนเดินทางซ้ำ (%)',
      headerEn: 'Repeat Share (%)',
      accessor: 'repeatPct',
      align: 'right',
      cell: (v) => formatPercentage(v),
    },
    {
      headerTh: 'เดินทางด้วยตนเอง (FIT)',
      headerEn: 'Independent (FIT)',
      accessor: 'fit',
      align: 'right',
      cell: (v) => formatNumber(v),
    },
    {
      headerTh: 'ทางอากาศ (คน)',
      headerEn: 'Air Transport',
      accessor: 'air',
      align: 'right',
      cell: (v) => formatNumber(v),
    },
  ];

  if (!generalAvailability.isAvailable) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {language === 'th' ? '03 พฤติกรรมการเดินทาง' : '03 Travel Behavior'}
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
          {language === 'th' ? '03 พฤติกรรมการเดินทาง' : '03 Travel Behavior'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {language === 'th'
            ? 'วิเคราะห์พฤติกรรมการท่องเที่ยว: ความถี่ในการเดินทาง การจัดการเดินทาง การเดินทางข้ามแดน และประเภทที่พักแรม'
            : 'Analysis of travel patterns: Visit frequency, travel party arrangement, transport mode, and accommodation choices.'}
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          titleTh="สัดส่วนนักท่องเที่ยวเดินทางซ้ำ"
          titleEn="Repeat Visitor Rate"
          value={formatPercentage(freqSummary.repeatPct)}
          subtextTh={`${formatNumber(freqSummary.repeat)} จาก ${formatNumber(freqSummary.total)} คน`}
          subtextEn={`${formatNumber(freqSummary.repeat)} of ${formatNumber(freqSummary.total)} persons`}
          icon={<RefreshCw className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="สัดส่วนเดินทางด้วยตนเอง (FIT)"
          titleEn="Independent Traveler Rate (FIT)"
          value={formatPercentage(journeySummary.fitPct)}
          subtextTh={`${formatNumber(journeySummary.fit)} จาก ${formatNumber(journeySummary.total)} คน`}
          subtextEn={`${formatNumber(journeySummary.fit)} of ${formatNumber(journeySummary.total)} persons`}
          icon={<UserCheck className="w-5 h-5" />}
        />

        <KpiCard
          titleTh="สัดส่วนการเดินทางทางอากาศ"
          titleEn="Air Travel Share"
          value={formatPercentage(transSummary.airPct)}
          subtextTh={`${formatNumber(transSummary.air)} คน`}
          subtextEn={`${formatNumber(transSummary.air)} persons`}
          icon={<Plane className="w-5 h-5" />}
        />
      </div>

      {/* Dynamic Factual Insight Box */}
      <InsightBox insightsTh={insights.th} insightsEn={insights.en} />

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SECTION A: Frequency Donut */}
        <div className="lg:col-span-6">
          <ChartCard
            titleTh="ความถี่ในการเดินทางเยือนประเทศไทย"
            titleEn="Visit Frequency to Thailand"
            subtitleTh="เปรียบเทียบระหว่างเดินทางซ้ำกับเดินทางมาครั้งแรก"
            subtitleEn="Comparison between Repeat vs First-Time visitors"
          >
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={freqSummary.data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    <Cell fill="#1e3a8a" />
                    <Cell fill="#0ea5e9" />
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${formatNumber(Number(val))} ${language === 'th' ? 'คน' : 'Persons'} (${item.payload.pct.toFixed(2)}%)`,
                      name,
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" align="center" iconSize={10} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* SECTION B: Journey Type Donut */}
        <div className="lg:col-span-6">
          <ChartCard
            titleTh="ลักษณะการจัดการเดินทาง (Travel Arrangement)"
            titleEn="Travel Party Arrangement"
            subtitleTh="เดินทางด้วยตนเอง (FIT) เทียบกับเดินทางเป็นกลุ่มทัวร์"
            subtitleEn="Free Independent Travelers (FIT) vs Group Tour"
          >
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={journeySummary.data}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    <Cell fill="#059669" />
                    <Cell fill="#d97706" />
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${formatNumber(Number(val))} ${language === 'th' ? 'คน' : 'Persons'} (${item.payload.pct.toFixed(2)}%)`,
                      name,
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend verticalAlign="bottom" align="center" iconSize={10} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* SECTION C: Transportation Bar Chart */}
        <div className="lg:col-span-6">
          <ChartCard
            titleTh="ช่องทางการเดินทางเข้าประเทศ (Transport Mode)"
            titleEn="Mode of Transportation Used"
            subtitleTh="สถิติการเดินทางผ่านทางอากาศ ทางบก และทางน้ำ"
            subtitleEn="Border entry volumes via Air, Land, and Water"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transSummary.data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip
                    formatter={(val: any, _, item: any) => [
                      `${formatNumber(Number(val))} ${language === 'th' ? 'คน' : 'Persons'} (${item.payload.pct.toFixed(2)}%)`,
                      language === 'th' ? 'นักท่องเที่ยว' : 'Arrivals',
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    <Cell fill="#1e3a8a" />
                    <Cell fill="#059669" />
                    <Cell fill="#0284c7" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* SECTION D: Accommodation Bar Chart */}
        <div className="lg:col-span-6">
          <ChartCard
            titleTh="ประเภทสถานที่พักแรม (Accommodation Type)"
            titleEn="Accommodation Types Selected"
            subtitleTh="การเลือกสถานที่พักของนักท่องเที่ยวชาวอาเซียน"
            subtitleEn="Lodging category distribution"
          >
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={accommSummary} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#334155' }} width={90} />
                  <Tooltip
                    formatter={(val: any, _, item: any) => [
                      `${formatNumber(Number(val))} ${language === 'th' ? 'คน' : 'Persons'} (${item.payload.pct.toFixed(2)}%)`,
                      language === 'th' ? 'นักท่องเที่ยว' : 'Arrivals',
                    ]}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="value" fill="#1e3a8a" radius={[0, 4, 4, 0]}>
                    {accommSummary.map((_, i) => (
                      <Cell key={`accomm-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* SECTION E: Flight / Entry (Scheduled vs Charter) */}
        <div className="lg:col-span-12">
          <ChartCard
            titleTh="ประเภทเที่ยวบินการเดินทาง (Flight Arrival Type)"
            titleEn="Flight Types: Scheduled vs Charter Flights"
            subtitleTh="สัดส่วนเที่ยวบินประจำและเที่ยวบินเช่าเหมาลำ (ครอบคลุมเฉพาะปี พ.ศ. 2562–2563)"
            subtitleEn="Scheduled vs. Charter flights (Available only for 2562–2563 BE)"
          >
            {!flightAvailability.isAvailable ? (
              <DataAvailabilityNotice availableYears={flightYears} selectedYear={selectedYear} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={flightSummary.data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={3}
                      >
                        <Cell fill="#1e3a8a" />
                        <Cell fill="#d97706" />
                      </Pie>
                      <Tooltip
                        formatter={(val: any, name: any, item: any) => [
                          `${formatNumber(Number(val))} ${language === 'th' ? 'คน' : 'Persons'} (${item.payload.pct.toFixed(2)}%)`,
                          name,
                        ]}
                        contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                      />
                      <Legend verticalAlign="bottom" align="center" iconSize={10} wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-brand-blue" />
                    {language === 'th' ? 'ข้อมูลสถิติประเภทเที่ยวบิน' : 'Flight Statistics Summary'}
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span>{language === 'th' ? 'เที่ยวบินแบบประจำ' : 'Scheduled Flights'}:</span>
                    <span className="font-semibold text-brand-blue">
                      {formatNumber(flightSummary.scheduled)} คน ({flightSummary.scheduledPct.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span>{language === 'th' ? 'เที่ยวบินแบบเช่าเหมาลำ' : 'Charter Flights'}:</span>
                    <span className="font-semibold text-amber-600">
                      {formatNumber(flightSummary.charter)} คน ({flightSummary.charterPct.toFixed(2)}%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic mt-2">
                    {language === 'th'
                      ? '*ข้อมูลเที่ยวบินมีการจัดเก็บเฉพาะช่วงปี 2562 และ 2563 ซึ่งสะท้อนการเชื่อมต่อทางการบินก่อนและช่วงเริ่มต้นของการแพร่ระบาดโควิด-19'
                      : '*Flight data was collected specifically for 2562–2563 BE, capturing airline connectivity right before and during the initial COVID-19 impact.'}
                  </p>
                </div>
              </div>
            )}
          </ChartCard>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        data={behaviorTableData}
        columns={tableColumns}
        filename={`ASEAN_Travel_Behavior_${selectedYear}.csv`}
        titleTh={`ตารางตรวจสอบสถิติพฤติกรรมการเดินทาง (${selectedYear === 'all' ? 'ทุกปี พ.ศ. 2554–2563' : `ปี พ.ศ. ${selectedYear}`})`}
        titleEn={`Travel Behavior Statistical Table (${selectedYear === 'all' ? 'All Years 2554–2563 BE' : `Year ${selectedYear} BE`})`}
      />
    </div>
  );
};
