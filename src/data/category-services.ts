export type CategoryService = {
  id: string;
  categoryId: string;
  nameFa: string;
  nameEn: string;
  descriptionFa?: string;
};

export const categoryServices: CategoryService[] = [
  // Electrician
  {
    id: "electrical-wiring-repair",
    categoryId: "electrician",
    nameFa: "ترمیم سیم‌کشی برق",
    nameEn: "Electrical wiring repair",
  },
  {
    id: "socket-switch-installation",
    categoryId: "electrician",
    nameFa: "نصب پریز و کلید",
    nameEn: "Socket and switch installation",
  },
  {
    id: "lighting-installation",
    categoryId: "electrician",
    nameFa: "نصب چراغ و روشنایی",
    nameEn: "Lighting installation",
  },
  {
    id: "breaker-panel-repair",
    categoryId: "electrician",
    nameFa: "ترمیم فیوز و تابلو برق",
    nameEn: "Breaker and electrical panel repair",
  },
  {
    id: "generator-installation",
    categoryId: "electrician",
    nameFa: "نصب و اتصال جنراتور",
    nameEn: "Generator installation",
  },

  // Plumber
  {
    id: "leaking-pipe-repair",
    categoryId: "plumber",
    nameFa: "ترمیم نشت لوله",
    nameEn: "Leaking pipe repair",
  },
  {
    id: "drain-unblocking",
    categoryId: "plumber",
    nameFa: "باز کردن بندش فاضلاب",
    nameEn: "Drain unblocking",
  },
  {
    id: "toilet-installation",
    categoryId: "plumber",
    nameFa: "نصب و ترمیم تشناب",
    nameEn: "Toilet installation and repair",
  },
  {
    id: "water-tank-installation",
    categoryId: "plumber",
    nameFa: "نصب تانکر آب",
    nameEn: "Water tank installation",
  },
  {
    id: "water-heater-installation",
    categoryId: "plumber",
    nameFa: "نصب آب‌گرم‌کن",
    nameEn: "Water heater installation",
  },

  // Carpenter
  {
    id: "door-repair",
    categoryId: "carpenter",
    nameFa: "ساخت و ترمیم دروازه",
    nameEn: "Door construction and repair",
  },
  {
    id: "window-repair",
    categoryId: "carpenter",
    nameFa: "ساخت و ترمیم پنجره",
    nameEn: "Window construction and repair",
  },
  {
    id: "furniture-repair",
    categoryId: "carpenter",
    nameFa: "ترمیم وسایل چوبی",
    nameEn: "Furniture repair",
  },
  {
    id: "cabinet-installation",
    categoryId: "carpenter",
    nameFa: "ساخت و نصب کابینت",
    nameEn: "Cabinet construction and installation",
  },

  // Construction
  {
    id: "wall-construction",
    categoryId: "construction",
    nameFa: "دیوارچینی",
    nameEn: "Wall construction",
  },
  {
    id: "plastering",
    categoryId: "construction",
    nameFa: "گچ‌کاری و پلستر",
    nameEn: "Plastering",
  },
  {
    id: "tile-installation",
    categoryId: "construction",
    nameFa: "نصب کاشی و سرامیک",
    nameEn: "Tile installation",
  },
  {
    id: "concrete-work",
    categoryId: "construction",
    nameFa: "کارهای کانکریتی",
    nameEn: "Concrete work",
  },
  {
    id: "building-renovation",
    categoryId: "construction",
    nameFa: "بازسازی ساختمان",
    nameEn: "Building renovation",
  },

  // Painter
  {
    id: "interior-painting",
    categoryId: "painter",
    nameFa: "رنگ‌آمیزی داخل ساختمان",
    nameEn: "Interior painting",
  },
  {
    id: "exterior-painting",
    categoryId: "painter",
    nameFa: "رنگ‌آمیزی نمای ساختمان",
    nameEn: "Exterior painting",
  },
  {
    id: "wall-preparation",
    categoryId: "painter",
    nameFa: "آماده‌سازی و ترمیم دیوار",
    nameEn: "Wall preparation and repair",
  },
  {
    id: "door-window-painting",
    categoryId: "painter",
    nameFa: "رنگ‌آمیزی دروازه و پنجره",
    nameEn: "Door and window painting",
  },

  // Cleaner
  {
    id: "home-cleaning",
    categoryId: "cleaner",
    nameFa: "نظافت خانه",
    nameEn: "Home cleaning",
  },
  {
    id: "office-cleaning",
    categoryId: "cleaner",
    nameFa: "نظافت دفتر",
    nameEn: "Office cleaning",
  },
  {
    id: "deep-cleaning",
    categoryId: "cleaner",
    nameFa: "نظافت عمومی و عمیق",
    nameEn: "Deep cleaning",
  },
  {
    id: "carpet-cleaning",
    categoryId: "cleaner",
    nameFa: "شست‌وشوی قالین",
    nameEn: "Carpet cleaning",
  },
  {
    id: "post-construction-cleaning",
    categoryId: "cleaner",
    nameFa: "نظافت پس از ساختمان‌کاری",
    nameEn: "Post-construction cleaning",
  },

  // AC technician
  {
    id: "ac-installation",
    categoryId: "ac-technician",
    nameFa: "نصب کولر",
    nameEn: "Air conditioner installation",
  },
  {
    id: "ac-repair",
    categoryId: "ac-technician",
    nameFa: "ترمیم کولر",
    nameEn: "Air conditioner repair",
  },
  {
    id: "ac-maintenance",
    categoryId: "ac-technician",
    nameFa: "سرویس و پاک‌کاری کولر",
    nameEn: "Air conditioner maintenance",
  },
  {
    id: "heating-system-repair",
    categoryId: "ac-technician",
    nameFa: "ترمیم سیستم گرمایشی",
    nameEn: "Heating system repair",
  },

  // Driver
  {
    id: "city-transport",
    categoryId: "driver",
    nameFa: "ترانسپورت داخل شهر",
    nameEn: "City transportation",
  },
  {
    id: "intercity-transport",
    categoryId: "driver",
    nameFa: "سفر بین‌شهری",
    nameEn: "Intercity transportation",
  },
  {
    id: "goods-transport",
    categoryId: "driver",
    nameFa: "انتقال کالا و وسایل",
    nameEn: "Goods transportation",
  },
  {
    id: "airport-transfer",
    categoryId: "driver",
    nameFa: "انتقال به میدان هوایی",
    nameEn: "Airport transfer",
  },

  // Phone repair
  {
    id: "phone-screen-repair",
    categoryId: "phone-repair",
    nameFa: "تعویض و ترمیم صفحه موبایل",
    nameEn: "Phone screen repair",
  },
  {
    id: "phone-battery-replacement",
    categoryId: "phone-repair",
    nameFa: "تعویض باتری موبایل",
    nameEn: "Phone battery replacement",
  },
  {
    id: "phone-software-repair",
    categoryId: "phone-repair",
    nameFa: "ترمیم نرم‌افزاری موبایل",
    nameEn: "Phone software repair",
  },
  {
    id: "phone-charging-port-repair",
    categoryId: "phone-repair",
    nameFa: "ترمیم جای شارژ",
    nameEn: "Charging port repair",
  },

  // Computer repair
  {
    id: "computer-hardware-repair",
    categoryId: "computer-repair",
    nameFa: "ترمیم سخت‌افزار کمپیوتر",
    nameEn: "Computer hardware repair",
  },
  {
    id: "windows-installation",
    categoryId: "computer-repair",
    nameFa: "نصب ویندوز و نرم‌افزار",
    nameEn: "Windows and software installation",
  },
  {
    id: "virus-removal",
    categoryId: "computer-repair",
    nameFa: "پاک‌سازی ویروس",
    nameEn: "Virus removal",
  },
  {
    id: "data-recovery",
    categoryId: "computer-repair",
    nameFa: "بازیابی اطلاعات",
    nameEn: "Data recovery",
  },

  // Tailor
  {
    id: "mens-clothing-tailoring",
    categoryId: "tailor",
    nameFa: "دوخت لباس مردانه",
    nameEn: "Men's clothing tailoring",
  },
  {
    id: "womens-clothing-tailoring",
    categoryId: "tailor",
    nameFa: "دوخت لباس زنانه",
    nameEn: "Women's clothing tailoring",
  },
  {
    id: "clothing-alteration",
    categoryId: "tailor",
    nameFa: "اصلاح اندازه لباس",
    nameEn: "Clothing alteration",
  },
  {
    id: "clothing-repair",
    categoryId: "tailor",
    nameFa: "ترمیم لباس",
    nameEn: "Clothing repair",
  },

  // Barber
  {
    id: "mens-haircut",
    categoryId: "barber",
    nameFa: "اصلاح موی مردانه",
    nameEn: "Men's haircut",
  },
  {
    id: "beard-trimming",
    categoryId: "barber",
    nameFa: "اصلاح ریش",
    nameEn: "Beard trimming",
  },
  {
    id: "childrens-haircut",
    categoryId: "barber",
    nameFa: "اصلاح موی کودکان",
    nameEn: "Children's haircut",
  },

  // Tutor
  {
    id: "school-subject-tutoring",
    categoryId: "tutor",
    nameFa: "آموزش مضامین مکتب",
    nameEn: "School subject tutoring",
  },
  {
    id: "english-language-tutoring",
    categoryId: "tutor",
    nameFa: "آموزش زبان انگلیسی",
    nameEn: "English language tutoring",
  },
  {
    id: "computer-training",
    categoryId: "tutor",
    nameFa: "آموزش کمپیوتر",
    nameEn: "Computer training",
  },
  {
    id: "exam-preparation",
    categoryId: "tutor",
    nameFa: "آمادگی برای امتحان",
    nameEn: "Exam preparation",
  },

  // Photographer
  {
    id: "event-photography",
    categoryId: "photographer",
    nameFa: "عکاسی مراسم",
    nameEn: "Event photography",
  },
  {
    id: "portrait-photography",
    categoryId: "photographer",
    nameFa: "عکاسی پرتره",
    nameEn: "Portrait photography",
  },
  {
    id: "product-photography",
    categoryId: "photographer",
    nameFa: "عکاسی محصولات",
    nameEn: "Product photography",
  },
  {
    id: "video-recording",
    categoryId: "photographer",
    nameFa: "فیلم‌برداری",
    nameEn: "Video recording",
  },

  // Other
  {
    id: "custom-service",
    categoryId: "other",
    nameFa: "خدمت دیگر",
    nameEn: "Other service",
    descriptionFa: "خدمت خود را در مرحلهٔ بعد توضیح دهید.",
  },
];

export function getServicesByCategory(
  categoryId: string,
): CategoryService[] {
  return categoryServices.filter(
    (service) => service.categoryId === categoryId,
  );
}