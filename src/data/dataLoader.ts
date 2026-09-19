import Papa from 'papaparse';
import {
  TouristAmountRecord,
  GenderRecord,
  AgeGroupRecord,
  OccupationRecord,
  FrequencyRecord,
  JourneyRecord,
  TransportRecord,
  AccommodationRecord,
  FlightRecord,
  GoalRecord,
  StayRecord,
  DailyExpensesRecord,
  ExpensesItemsRecord,
  TouristYearIncomeRecord,
  RevenueRecord,
} from '../types/dataset';

// Base URL helper for robust static hosting (root or subpath)
const BASE_URL = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

const getDataUrl = (filename: string) => `${BASE_URL}data/${filename}`;

// Cache parsed datasets in memory
const cache = new Map<string, any[]>();

// Helper to fetch and parse a single CSV
async function fetchAndParseCsv<T>(url: string, rowMapper: (raw: Record<string, string>) => T | null): Promise<T[]> {
  if (cache.has(url)) {
    return cache.get(url) as T[];
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }
    const text = await response.text();

    return new Promise((resolve) => {
      Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          const records: T[] = [];
          for (const raw of results.data) {
            const mapped = rowMapper(raw);
            if (mapped) {
              records.push(mapped);
            }
          }
          cache.set(url, records);
          resolve(records);
        },
        error: (error: Error) => {
          console.error(`PapaParse error in ${url}:`, error);
          resolve([]);
        }
      });
    });
  } catch (err) {
    console.error(`Error loading dataset from ${url}:`, err);
    return [];
  }
}

// 1. Tourist Amount
export async function loadTouristAmount(): Promise<TouristAmountRecord[]> {
  return fetchAndParseCsv<TouristAmountRecord>(getDataUrl('ASEAN_Tourist-Amount_CLEANED.csv'), (r) => {
    const country = r['ประเทศ']?.trim();
    const year = r['ปี']?.trim();
    const tourists = parseFloat(r['นักท่องเที่ยว_คน'] || '0');
    if (!country || !year) return null;
    return { country, year, tourists: isNaN(tourists) ? 0 : tourists };
  });
}

// 2. Gender
export async function loadGender(): Promise<GenderRecord[]> {
  return fetchAndParseCsv<GenderRecord>(getDataUrl('ASEAN_Gender_CLEANED.csv'), (r) => {
    const country = r['ประเทศ']?.trim();
    const year = r['ปี']?.trim();
    if (!country || !year) return null;
    return {
      country,
      year,
      male: parseFloat(r['ชาย'] || '0') || 0,
      female: parseFloat(r['หญิง'] || '0') || 0,
    };
  });
}

// 3. Age Group
export async function loadAgeGroup(): Promise<AgeGroupRecord[]> {
  return fetchAndParseCsv<AgeGroupRecord>(getDataUrl('ASEAN_AgeGroup_CLEANED.csv'), (r) => {
    const country = r['ประเทศ']?.trim();
    const year = r['ปี']?.trim();
    if (!country || !year) return null;
    return {
      country,
      year,
      under25: parseFloat(r['ต่ำกว่า_25_ปี'] || '0') || 0,
      age25_34: parseFloat(r['25_-_34_ปี'] || '0') || 0,
      age35_44: parseFloat(r['35_-_44_ปี'] || '0') || 0,
      age45_54: parseFloat(r['45_-_54_ปี'] || '0') || 0,
      age55_64: parseFloat(r['55_-_64_ปี'] || '0') || 0,
      over65: parseFloat(r['65_ปีขึ้นไป'] || '0') || 0,
    };
  });
}

// 4. Occupation
export async function loadOccupation(): Promise<OccupationRecord[]> {
  return fetchAndParseCsv<OccupationRecord>(getDataUrl('ASEAN_Occupation_CLEANED.csv'), (r) => {
    const country = r['ประเทศ']?.trim();
    const year = r['ปี']?.trim();
    if (!country || !year) return null;
    return {
      country,
      year,
      student: parseFloat(r['นักเรียนและนักศึกษา'] || '0') || 0,
      civilServant: parseFloat(r['ข้าราชการและเจ้าหน้าที่รัฐวิสาหกิจ'] || '0') || 0,
      executive: parseFloat(r['นักบริหารและผู้จัดการ'] || '0') || 0,
      professional: parseFloat(r['นักวิชาชีพ'] || '0') || 0,
      agriculture: parseFloat(r['ผู้ปฏิบัติงานด้านการเกษตร'] || '0') || 0,
      business: parseFloat(r['ผู้ปฏิบัติงานธุรกิจและนักธุรกิจการค้า'] || '0') || 0,
      laborService: parseFloat(r['ผู้ใช้แรงงานและปฏิบัติงานบริการ'] || '0') || 0,
      housewife: parseFloat(r['แม่บ้าน'] || '0') || 0,
      retiree: parseFloat(r['ผู้ที่เกษียณอายุ'] || '0') || 0,
      other: parseFloat(r['อื่น_ๆ'] || '0') || 0,
      unspecified: parseFloat(r['ไม่ระบุ'] || '0') || 0,
    };
  });
}

// 5. Frequency
export async function loadFrequency(): Promise<FrequencyRecord[]> {
  return fetchAndParseCsv<FrequencyRecord>(getDataUrl('ASEAN_Frequency_CLEANED.csv'), (r) => {
    const country = r['ประเทศ']?.trim();
    const year = r['ปี']?.trim();
    if (!country || !year) return null;
    return {
      country,
      year,
      repeat: parseFloat(r['เดินทางซ้ำ'] || '0') || 0,
      first: parseFloat(r['เดินทางมาครั้งแรก'] || '0') || 0,
    };
  });
}

// 6. Journey
export async function loadJourney(): Promise<JourneyRecord[]> {
  return fetchAndParseCsv<JourneyRecord>(getDataUrl('ASEAN_Journey_CLEANED.csv'), (r) => {
    const country = r['ประเทศ']?.trim();
    const year = r['ปี']?.trim();
    if (!country || !year) return null;
    return {
      country,
      year,
      independent: parseFloat(r['เดินทางด้วยตัวเอง'] || '0') || 0,
      group: parseFloat(r['เดินทางเป็นกลุ่ม'] || '0') || 0,
    };
  });
}

// 7. Transport
export async function loadTransport(): Promise<TransportRecord[]> {
  return fetchAndParseCsv<TransportRecord>(getDataUrl('ASEAN_Transport_CLEANED.csv'), (r) => {
    const country = r['ประเทศ']?.trim();
    const year = r['ปี']?.trim();
    if (!country || !year) return null;
    return {
      country,
      year,
      water: parseFloat(r['ทางน้ำ'] || '0') || 0,
      land: parseFloat(r['ทางบก'] || '0') || 0,
      air: parseFloat(r['ทางอากาศ'] || '0') || 0,
    };
  });
}

// 8. Accommodation
export async function loadAccommodation(): Promise<AccommodationRecord[]> {
  return fetchAndParseCsv<AccommodationRecord>(getDataUrl('ASEAN_Accommodation_CLEANED.csv'), (r) => {
    const country = r['ประเทศ']?.trim();
    const year = r['ปี']?.trim();
    if (!country || !year) return null;
    return {
      country,
      year,
      hostel: parseFloat(r['บ้านพักเยาวชน'] || '0') || 0,
      friends: parseFloat(r['บ้านเพื่อน'] || '0') || 0,
      apartment: parseFloat(r['อพาร์ทเมนท์'] || '0') || 0,
      hotel: parseFloat(r['โรงแรม'] || '0') || 0,
      other: parseFloat(r['อื่นๆ'] || '0') || 0,
    };
  });
}

// 9. Flight
export async function loadFlight(): Promise<FlightRecord[]> {
  return fetchAndParseCsv<FlightRecord>(getDataUrl('ASEAN_Flight_CLEANED.csv'), (r) => {
    const country = r['ประเทศ']?.trim();
    const year = r['ปี']?.trim();
    if (!country || !year) return null;
    return {
      country,
      year,
      scheduled: parseFloat(r['เที่ยวบินแบบประจำ'] || '0') || 0,
      charter: parseFloat(r['เที่ยวบินแบบเช่าเหมาลำ'] || '0') || 0,
    };
  });
}

// 10. Goal
export async function loadGoal(): Promise<GoalRecord[]> {
  return fetchAndParseCsv<GoalRecord>(getDataUrl('ASEAN_Goal_CLEANED.csv'), (r) => {
    const country = r['ประเทศ']?.trim();
    const year = r['ปี']?.trim();
    if (!country || !year) return null;
    return {
      country,
      year,
      sports: parseFloat(r['การกีฬา'] || '0') || 0,
      transport: parseFloat(r['การขนส่ง'] || '0') || 0,
      employment: parseFloat(r['การจ้างแรงงาน'] || '0') || 0,
      education: parseFloat(r['การศึกษา'] || '0') || 0,
      exhibition: parseFloat(r['งานแสดงสินค้า/นิทรรศการ'] || '0') || 0,
      medical: parseFloat(r['ทางการแพทย์'] || '0') || 0,
      tourism: parseFloat(r['ท่องเที่ยว'] || '0') || 0,
      business: parseFloat(r['ธุรกิจ'] || '0') || 0,
      assocMeeting: parseFloat(r['ประชุมของสมาคม'] || '0') || 0,
      orgMeeting: parseFloat(r['ประชุมของหน่วยงาน'] || '0') || 0,
      bizMeeting: parseFloat(r['ประชุมเชิงธุรกิจ'] || '0') || 0,
      other: parseFloat(r['อื่น_ๆ'] || '0') || 0,
    };
  });
}

// 11. Stay
export async function loadStay(): Promise<StayRecord[]> {
  return fetchAndParseCsv<StayRecord>(getDataUrl('ASEAN_Stay_CLEANED.csv'), (r) => {
    const country = r['ประเทศ']?.trim();
    const year = r['ปี']?.trim();
    if (!country || !year) return null;
    return {
      country,
      year,
      avgDays: parseFloat(r['พำนักเฉลี่ย_วัน'] || '0') || 0,
    };
  });
}

// 12. Daily Expenses
export async function loadDailyExpenses(): Promise<DailyExpensesRecord[]> {
  return fetchAndParseCsv<DailyExpensesRecord>(getDataUrl('ASEAN_Daily-Expenses_CLEANED.csv'), (r) => {
    const country = r['ประเทศ']?.trim();
    const year = r['ปี']?.trim();
    if (!country || !year) return null;
    return {
      country,
      year,
      expenseThb: parseFloat(r['ค่าใช้จ่าย_บาทต่อวัน'] || '0') || 0,
      expenseUsd: parseFloat(r['ค่าใช้จ่าย_ดอลลาร์สหรัฐต่อวัน'] || '0') || 0,
    };
  });
}

// 13. Expenses Items
export async function loadExpensesItems(): Promise<ExpensesItemsRecord[]> {
  return fetchAndParseCsv<ExpensesItemsRecord>(getDataUrl('ASEAN_Expenses-Items_CLEANED.csv'), (r) => {
    const country = r['ประเทศ']?.trim();
    const year = r['ปี']?.trim();
    if (!country || !year) return null;
    return {
      country,
      year,
      medical: parseFloat(r['การรักษาพยาบาล'] || '0') || 0,
      souvenirs: parseFloat(r['ค่าซื้อสินค้าที่ระลึก'] || '0') || 0,
      tourServices: parseFloat(r['ค่าบริการท่องเที่ยว'] || '0') || 0,
      transport: parseFloat(r['ค่าพาหนะในการเดินทาง'] || '0') || 0,
      foodDrink: parseFloat(r['ค่าอาหารและเครื่องดื่ม'] || '0') || 0,
      entertainment: parseFloat(r['ค่าใช้จ่ายเพื่อการบันเทิง'] || '0') || 0,
      miscellaneous: parseFloat(r['เบ็ดเตล็ด'] || '0') || 0,
    };
  });
}

// 14. Tourist Year Income
export async function loadTouristYearIncome(): Promise<TouristYearIncomeRecord[]> {
  return fetchAndParseCsv<TouristYearIncomeRecord>(getDataUrl('ASEAN_Tourist-Year-Income_CLEANED.csv'), (r) => {
    const country = r['ประเทศ']?.trim();
    const year = r['ปี']?.trim();
    if (!country || !year) return null;
    return {
      country,
      year,
      income20k_60k: parseFloat(r['20,001_-_60,000_ดอลลาร์สหรัฐ'] || '0') || 0,
      incomeUnder20k: parseFloat(r['น้อยกว่า_20,000_ดอลลาร์สหรัฐ'] || '0') || 0,
      incomeOver60k: parseFloat(r['มากกว่า_60,000_ดอลลาร์สหรัฐ'] || '0') || 0,
      noIncome: parseFloat(r['ไม่มีรายได้'] || '0') || 0,
    };
  });
}

// 15. Revenue
export async function loadRevenue(): Promise<RevenueRecord[]> {
  return fetchAndParseCsv<RevenueRecord>(getDataUrl('ASEAN_Revenue_CLEANED.csv'), (r) => {
    const country = r['ประเทศ']?.trim();
    const year = r['ปี']?.trim();
    if (!country || !year) return null;
    return {
      country,
      year,
      revenueMillionThb: parseFloat(r['รายได้_ล้านบาท'] || '0') || 0,
    };
  });
}

export interface AllDatasets {
  touristAmount: TouristAmountRecord[];
  gender: GenderRecord[];
  ageGroup: AgeGroupRecord[];
  occupation: OccupationRecord[];
  frequency: FrequencyRecord[];
  journey: JourneyRecord[];
  transport: TransportRecord[];
  accommodation: AccommodationRecord[];
  flight: FlightRecord[];
  goal: GoalRecord[];
  stay: StayRecord[];
  dailyExpenses: DailyExpensesRecord[];
  expensesItems: ExpensesItemsRecord[];
  touristYearIncome: TouristYearIncomeRecord[];
  revenue: RevenueRecord[];
}

export async function loadAllDatasets(): Promise<AllDatasets> {
  const [
    touristAmount,
    gender,
    ageGroup,
    occupation,
    frequency,
    journey,
    transport,
    accommodation,
    flight,
    goal,
    stay,
    dailyExpenses,
    expensesItems,
    touristYearIncome,
    revenue,
  ] = await Promise.all([
    loadTouristAmount(),
    loadGender(),
    loadAgeGroup(),
    loadOccupation(),
    loadFrequency(),
    loadJourney(),
    loadTransport(),
    loadAccommodation(),
    loadFlight(),
    loadGoal(),
    loadStay(),
    loadDailyExpenses(),
    loadExpensesItems(),
    loadTouristYearIncome(),
    loadRevenue(),
  ]);

  return {
    touristAmount,
    gender,
    ageGroup,
    occupation,
    frequency,
    journey,
    transport,
    accommodation,
    flight,
    goal,
    stay,
    dailyExpenses,
    expensesItems,
    touristYearIncome,
    revenue,
  };
}
