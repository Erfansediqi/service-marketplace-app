export type ServiceProfession = {
  id: string;
  nameFa: string;
  nameEn: string;
  descriptionFa: string;
  icon:
    | "flash-outline"
    | "water-outline"
    | "hammer-outline"
    | "construct-outline"
    | "brush-outline"
    | "sparkles-outline"
    | "snow-outline"
    | "car-outline"
    | "phone-portrait-outline"
    | "laptop-outline"
    | "shirt-outline"
    | "cut-outline"
    | "school-outline"
    | "camera-outline"
    | "ellipsis-horizontal";
};

export const serviceProfessions: ServiceProfession[] = [
  {
    id: "electrician",
    nameFa: "برق‌کار",
    nameEn: "Electrician",
    descriptionFa: "نصب، ترمیم و عیب‌یابی سیستم‌های برقی",
    icon: "flash-outline",
  },
  {
    id: "plumber",
    nameFa: "لوله‌کش",
    nameEn: "Plumber",
    descriptionFa: "نصب و ترمیم لوله، آب‌رسانی و فاضلاب",
    icon: "water-outline",
  },
  {
    id: "carpenter",
    nameFa: "نجار",
    nameEn: "Carpenter",
    descriptionFa: "ساخت و ترمیم دروازه، پنجره و وسایل چوبی",
    icon: "hammer-outline",
  },
  {
    id: "construction",
    nameFa: "کارگر ساختمانی",
    nameEn: "Construction worker",
    descriptionFa: "کارهای ساختمانی، ترمیم و بازسازی",
    icon: "construct-outline",
  },
  {
    id: "painter",
    nameFa: "رنگ‌مال",
    nameEn: "Painter",
    descriptionFa: "رنگ‌آمیزی خانه، دفتر و ساختمان",
    icon: "brush-outline",
  },
  {
    id: "cleaner",
    nameFa: "نظافت‌چی",
    nameEn: "Cleaner",
    descriptionFa: "نظافت خانه، دفتر و محیط کاری",
    icon: "sparkles-outline",
  },
  {
    id: "ac-technician",
    nameFa: "تخنیکر کولر و تهویه",
    nameEn: "AC technician",
    descriptionFa: "نصب و ترمیم کولر و سیستم‌های تهویه",
    icon: "snow-outline",
  },
  {
    id: "driver",
    nameFa: "راننده",
    nameEn: "Driver",
    descriptionFa: "خدمات ترانسپورت و جابه‌جایی",
    icon: "car-outline",
  },
  {
    id: "phone-repair",
    nameFa: "ترمیم‌کار موبایل",
    nameEn: "Phone repair technician",
    descriptionFa: "ترمیم موبایل، صفحه‌نمایش و قطعات",
    icon: "phone-portrait-outline",
  },
  {
    id: "computer-repair",
    nameFa: "ترمیم‌کار کمپیوتر",
    nameEn: "Computer repair technician",
    descriptionFa: "ترمیم کمپیوتر، لپ‌تاپ و نرم‌افزار",
    icon: "laptop-outline",
  },
  {
    id: "tailor",
    nameFa: "خیاط",
    nameEn: "Tailor",
    descriptionFa: "دوخت، اصلاح و ترمیم لباس",
    icon: "shirt-outline",
  },
  {
    id: "barber",
    nameFa: "آرایشگر",
    nameEn: "Barber",
    descriptionFa: "اصلاح مو و خدمات آرایشگری",
    icon: "cut-outline",
  },
  {
    id: "tutor",
    nameFa: "آموزگار خصوصی",
    nameEn: "Private tutor",
    descriptionFa: "آموزش خصوصی مضامین و مهارت‌ها",
    icon: "school-outline",
  },
  {
    id: "photographer",
    nameFa: "عکاس",
    nameEn: "Photographer",
    descriptionFa: "عکاسی مراسم، محصولات و پرتره",
    icon: "camera-outline",
  },
  {
    id: "other",
    nameFa: "سایر خدمات",
    nameEn: "Other services",
    descriptionFa: "حرفه یا مهارتی که در فهرست موجود نیست",
    icon: "ellipsis-horizontal",
  },
];