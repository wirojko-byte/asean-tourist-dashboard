export interface TranslationStrings {
  appTitle: string;
  appSubtitle: string;
  researchBadge: string;
  navOverview: string;
  navCharacteristics: string;
  navBehavior: string;
  navObjectives: string;
  navStay: string;
  navExpenses: string;
  navRevenue: string;
  filterYear: string;
  filterCountry: string;
  allYears: string;
  allCountries: string;
  resetFilters: string;
  dataQuality: string;
  methodology: string;
  exportCsv: string;
  search: string;
  rowsPerPage: string;
  showing: string;
  of: string;
  to: string;
  entries: string;
  sourceNote: string;
  dataUnavailableTitle: string;
  dataUnavailableDesc: string;
  dataAggregatedNote: string;
  unitPersons: string;
  unitDays: string;
  unitMillionThb: string;
  unitThbPerDay: string;
  unitUsdPerDay: string;
  shareOfAsean: string;
  yoyChange: string;
  positiveChange: string;
  negativeChange: string;
  neutralChange: string;
}

export const TRANSLATIONS: Record<'th' | 'en', TranslationStrings> = {
  th: {
    appTitle: 'แดชบอร์ดพฤติกรรมนักท่องเที่ยวอาเซียน',
    appSubtitle: 'รูปแบบการท่องเที่ยวของนักท่องเที่ยวประชาคมเศรษฐกิจอาเซียนที่เดินทางเข้าประเทศไทย',
    researchBadge: 'ระบบสารสนเทศเพื่อการวิจัยเชิงสถิติ',
    navOverview: 'ภาพรวมการท่องเที่ยว',
    navCharacteristics: 'ลักษณะทางประชากรศาสตร์',
    navBehavior: 'พฤติกรรมการเดินทาง',
    navObjectives: 'วัตถุประสงค์การเดินทาง',
    navStay: 'ระยะเวลาพำนักเฉลี่ย',
    navExpenses: 'ค่าใช้จ่ายของนักท่องเที่ยว',
    navRevenue: 'รายได้และรายรับจากการท่องเที่ยว',
    filterYear: 'ปี พ.ศ.',
    filterCountry: 'ประเทศสมาชิกอาเซียน',
    allYears: 'ทุกปี (พ.ศ. 2554–2567)',
    allCountries: 'ทุกประเทศในอาเซียน (9 ประเทศ)',
    resetFilters: 'ล้างตัวกรองทั้งหมด',
    dataQuality: 'สถานะความสมบูรณ์ของข้อมูล',
    methodology: 'ระเบียบวิธีวิจัยและคำนิยาม',
    exportCsv: 'ส่งออกข้อมูล CSV',
    search: 'ค้นหาในตาราง...',
    rowsPerPage: 'แถวต่อหน้า',
    showing: 'แสดง',
    of: 'จากทั้งหมด',
    to: 'ถึง',
    entries: 'รายการ',
    sourceNote: 'แหล่งข้อมูล: ฐานข้อมูลสถิติการท่องเที่ยวแห่งประเทศไทย กระทรวงการท่องเที่ยวและกีฬา',
    dataUnavailableTitle: 'ข้อมูลไม่เพียงพอสำหรับปีที่เลือก',
    dataUnavailableDesc: 'ชุดข้อมูลนี้ครอบคลุมปี',
    dataAggregatedNote: 'แสดงข้อมูลรวมตลอดช่วงปีที่บันทึก',
    unitPersons: 'คน',
    unitDays: 'วัน',
    unitMillionThb: 'ล้านบาท',
    unitThbPerDay: 'บาท/วัน',
    unitUsdPerDay: 'ดอลลาร์สหรัฐ/วัน',
    shareOfAsean: 'สัดส่วนในอาเซียน',
    yoyChange: 'เปลี่ยนแปลงจากปีก่อน',
    positiveChange: 'เพิ่มขึ้น',
    negativeChange: 'ลดลง',
    neutralChange: 'ไม่เปลี่ยนแปลง'
  },
  en: {
    appTitle: 'ASEAN Tourist Behavior Dashboard',
    appSubtitle: 'Tourist Behavior Patterns of ASEAN Tourists Traveling to Thailand',
    researchBadge: 'Academic Research Dashboard',
    navOverview: 'Overview',
    navCharacteristics: 'Tourist Demographics',
    navBehavior: 'Travel Behavior',
    navObjectives: 'Travel Objectives',
    navStay: 'Length of Stay',
    navExpenses: 'Tourist Expenses',
    navRevenue: 'Income & Revenue',
    filterYear: 'Year (BE)',
    filterCountry: 'ASEAN Country',
    allYears: 'All Years (2554–2567 BE)',
    allCountries: 'All ASEAN Countries (9 Countries)',
    resetFilters: 'Reset Filters',
    dataQuality: 'Data Quality Status',
    methodology: 'Methodology & Definitions',
    exportCsv: 'Export CSV',
    search: 'Search table...',
    rowsPerPage: 'Rows per page',
    showing: 'Showing',
    of: 'of',
    to: 'to',
    entries: 'entries',
    sourceNote: 'Source: Tourism Statistics Database, Ministry of Tourism and Sports, Thailand',
    dataUnavailableTitle: 'Data unavailable for the selected year',
    dataUnavailableDesc: 'This dataset covers the period',
    dataAggregatedNote: 'Displaying aggregated data over the recorded period',
    unitPersons: 'Persons',
    unitDays: 'Days',
    unitMillionThb: 'Million THB',
    unitThbPerDay: 'THB/Day',
    unitUsdPerDay: 'USD/Day',
    shareOfAsean: 'Share of ASEAN',
    yoyChange: 'YoY Change',
    positiveChange: 'Increase',
    negativeChange: 'Decrease',
    neutralChange: 'No Change'
  }
};

export const COUNTRY_NAMES_EN: Record<string, string> = {
  'กัมพูชา': 'Cambodia',
  'บรูไนดารุสซาลาม': 'Brunei Darussalam',
  'พม่า': 'Myanmar',
  'ฟิลิปปินส์': 'Philippines',
  'มาเลเซีย': 'Malaysia',
  'ลาว': 'Laos',
  'สิงคโปร์': 'Singapore',
  'อินโดนีเซีย': 'Indonesia',
  'เวียดนาม': 'Vietnam'
};

export const CATEGORY_NAMES_EN: Record<string, string> = {
  // Gender
  'ชาย': 'Male',
  'หญิง': 'Female',

  // Age Groups
  'ต่ำกว่า_25_ปี': 'Under 25 years',
  '25_-_34_ปี': '25 - 34 years',
  '35_-_44_ปี': '35 - 44 years',
  '45_-_54_ปี': '45 - 54 years',
  '55_-_64_ปี': '55 - 64 years',
  '65_ปีขึ้นไป': '65 years & over',

  // Occupations
  'นักเรียนและนักศึกษา': 'Students',
  'ข้าราชการและเจ้าหน้าที่รัฐวิสาหกิจ': 'Civil Servants & SOE',
  'นักบริหารและผู้จัดการ': 'Executives & Managers',
  'นักวิชาชีพ': 'Professionals',
  'ผู้ปฏิบัติงานด้านการเกษตร': 'Agricultural Workers',
  'ผู้ปฏิบัติงานธุรกิจและนักธุรกิจการค้า': 'Business & Commerce',
  'ผู้ใช้แรงงานและปฏิบัติงานบริการ': 'Labor & Service Workers',
  'แม่บ้าน': 'Homemakers',
  'ผู้ที่เกษียณอายุ': 'Retirees',
  'อื่น_ๆ': 'Others',
  'ไม่ระบุ': 'Unspecified',

  // Frequency
  'เดินทางซ้ำ': 'Repeat Visitors',
  'เดินทางมาครั้งแรก': 'First-Time Visitors',

  // Journey
  'เดินทางด้วยตัวเอง': 'Independent (FIT)',
  'เดินทางเป็นกลุ่ม': 'Group Tour',

  // Transport
  'ทางอากาศ': 'Air',
  'ทางบก': 'Land',
  'ทางน้ำ': 'Water',

  // Accommodation
  'โรงแรม': 'Hotels',
  'อพาร์ทเมนท์': 'Apartments',
  'บ้านเพื่อน': 'Friends / Relatives',
  'บ้านพักเยาวชน': 'Youth Hostels',
  'อื่นๆ': 'Others',

  // Flight
  'เที่ยวบินแบบประจำ': 'Scheduled Flights',
  'เที่ยวบินแบบเช่าเหมาลำ': 'Charter Flights',

  // Goal
  'ท่องเที่ยว': 'Holiday / Leisure',
  'ธุรกิจ': 'Business',
  'ประชุมของหน่วยงาน': 'Corporate Meetings',
  'ประชุมของสมาคม': 'Association Conventions',
  'ประชุมเชิงธุรกิจ': 'Business Conferences',
  'งานแสดงสินค้า/นิทรรศการ': 'Exhibitions / Trade Fairs',
  'ทางการแพทย์': 'Medical & Health',
  'การศึกษา': 'Education',
  'การกีฬา': 'Sports',
  'การขนส่ง': 'Transit / Transport',
  'การจ้างแรงงาน': 'Employment',

  // Expenses Items
  'ค่าซื้อสินค้าที่ระลึก': 'Souvenirs & Shopping',
  'ค่าอาหารและเครื่องดื่ม': 'Food & Beverage',
  'ค่าพาหนะในการเดินทาง': 'Local Transport',
  'ค่าใช้จ่ายเพื่อการบันเทิง': 'Entertainment',
  'ค่าบริการท่องเที่ยว': 'Tour Services',
  'การรักษาพยาบาล': 'Medical Treatment',
  'เบ็ดเตล็ด': 'Miscellaneous',

  // Income
  'น้อยกว่า_20,000_ดอลลาร์สหรัฐ': 'Under $20,000',
  '20,001_-_60,000_ดอลลาร์สหรัฐ': '$20,001 - $60,000',
  'มากกว่า_60,000_ดอลลาร์สหรัฐ': 'Over $60,000',
  'ไม่มีรายได้': 'No Income'
};

export function getCountryName(thaiName: string, lang: 'th' | 'en'): string {
  if (lang === 'en' && COUNTRY_NAMES_EN[thaiName]) {
    return COUNTRY_NAMES_EN[thaiName];
  }
  return thaiName;
}

export function getCategoryName(categoryKey: string, lang: 'th' | 'en'): string {
  if (lang === 'en' && CATEGORY_NAMES_EN[categoryKey]) {
    return CATEGORY_NAMES_EN[categoryKey];
  }
  return categoryKey.replace(/_/g, ' ');
}
