export interface BaseRecord {
  country: string; // Original Thai name
  year: string;    // Buddhist Era year string e.g. "2562"
  [key: string]: string | number;
}

export interface TouristAmountRecord extends BaseRecord {
  tourists: number; // นักท่องเที่ยว_คน
}

export interface GenderRecord extends BaseRecord {
  male: number;   // ชาย
  female: number; // หญิง
}

export interface AgeGroupRecord extends BaseRecord {
  under25: number;   // ต่ำกว่า_25_ปี
  age25_34: number;  // 25_-_34_ปี
  age35_44: number;  // 35_-_44_ปี
  age45_54: number;  // 45_-_54_ปี
  age55_64: number;  // 55_-_64_ปี
  over65: number;    // 65_ปีขึ้นไป
}

export interface OccupationRecord extends BaseRecord {
  student: number;       // นักเรียนและนักศึกษา
  civilServant: number;  // ข้าราชการและเจ้าหน้าที่รัฐวิสาหกิจ
  executive: number;     // นักบริหารและผู้จัดการ
  professional: number;  // นักวิชาชีพ
  agriculture: number;   // ผู้ปฏิบัติงานด้านการเกษตร
  business: number;      // ผู้ปฏิบัติงานธุรกิจและนักธุรกิจการค้า
  laborService: number;  // ผู้ใช้แรงงานและปฏิบัติงานบริการ
  housewife: number;     // แม่บ้าน
  retiree: number;       // ผู้ที่เกษียณอายุ
  other: number;         // อื่น_ๆ
  unspecified: number;   // ไม่ระบุ
}

export interface FrequencyRecord extends BaseRecord {
  repeat: number; // เดินทางซ้ำ
  first: number;  // เดินทางมาครั้งแรก
}

export interface JourneyRecord extends BaseRecord {
  independent: number; // เดินทางด้วยตัวเอง
  group: number;       // เดินทางเป็นกลุ่ม
}

export interface TransportRecord extends BaseRecord {
  water: number; // ทางน้ำ
  land: number;  // ทางบก
  air: number;   // ทางอากาศ
}

export interface AccommodationRecord extends BaseRecord {
  hostel: number;     // บ้านพักเยาวชน
  friends: number;    // บ้านเพื่อน
  apartment: number;  // อพาร์ทเมนท์
  hotel: number;      // โรงแรม
  other: number;      // อื่นๆ
}

export interface FlightRecord extends BaseRecord {
  scheduled: number; // เที่ยวบินแบบประจำ
  charter: number;   // เที่ยวบินแบบเช่าเหมาลำ
}

export interface GoalRecord extends BaseRecord {
  sports: number;       // การกีฬา
  transport: number;    // การขนส่ง
  employment: number;   // การจ้างแรงงาน
  education: number;    // การศึกษา
  exhibition: number;   // งานแสดงสินค้า/นิทรรศการ
  medical: number;      // ทางการแพทย์
  tourism: number;      // ท่องเที่ยว
  business: number;     // ธุรกิจ
  assocMeeting: number; // ประชุมของสมาคม
  orgMeeting: number;   // ประชุมของหน่วยงาน
  bizMeeting: number;   // ประชุมเชิงธุรกิจ
  other: number;        // อื่น_ๆ
}

export interface StayRecord extends BaseRecord {
  avgDays: number; // พำนักเฉลี่ย_วัน
}

export interface DailyExpensesRecord extends BaseRecord {
  expenseThb: number; // ค่าใช้จ่าย_บาทต่อวัน
  expenseUsd: number; // ค่าใช้จ่าย_ดอลลาร์สหรัฐต่อวัน
}

export interface ExpensesItemsRecord extends BaseRecord {
  medical: number;       // การรักษาพยาบาล
  souvenirs: number;     // ค่าซื้อสินค้าที่ระลึก
  tourServices: number;  // ค่าบริการท่องเที่ยว
  transport: number;     // ค่าพาหนะในการเดินทาง
  foodDrink: number;     // ค่าอาหารและเครื่องดื่ม
  entertainment: number; // ค่าใช้จ่ายเพื่อการบันเทิง
  miscellaneous: number; // เบ็ดเตล็ด
}

export interface TouristYearIncomeRecord extends BaseRecord {
  income20k_60k: number;  // 20,001_-_60,000_ดอลลาร์สหรัฐ
  incomeUnder20k: number; // น้อยกว่า_20,000_ดอลลาร์สหรัฐ
  incomeOver60k: number;  // มากกว่า_60,000_ดอลลาร์สหรัฐ
  noIncome: number;       // ไม่มีรายได้
}

export interface RevenueRecord extends BaseRecord {
  revenueMillionThb: number; // รายได้_ล้านบาท
}

export type DatasetKey =
  | 'touristAmount'
  | 'gender'
  | 'ageGroup'
  | 'occupation'
  | 'frequency'
  | 'journey'
  | 'transport'
  | 'accommodation'
  | 'flight'
  | 'goal'
  | 'stay'
  | 'dailyExpenses'
  | 'expensesItems'
  | 'touristYearIncome'
  | 'revenue';

export interface DatasetMetadata {
  key: DatasetKey;
  filename: string;
  titleTh: string;
  titleEn: string;
  unitTh: string;
  unitEn: string;
  years: string[];
  countries: string[];
  rowCount: number;
  columns: string[];
  descriptionTh: string;
  descriptionEn: string;
}
