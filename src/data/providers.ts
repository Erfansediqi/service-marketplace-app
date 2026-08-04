export type ProviderCategoryId =
  | "electrician"
  | "plumber"
  | "carpenter"
  | "construction"
  | "painter"
  | "cleaner"
  | "ac-technician"
  | "driver"
  | "phone-repair"
  | "computer-repair"
  | "tailor"
  | "barber"
  | "tutor"
  | "photographer"
  | "other";

export type ProviderService = {
  id: string;
  title: string;
  description: string;
  estimatedPrice: number;
};

export type ProviderReview = {
  id: string;
  customerName: string;
  customerInitials: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type ProviderPortfolioItem = {
  id: string;
  title: string;
  imageUrl?: string;
};

export type ProviderProfile = {
  id: string;

  name: string;
  initials: string;
  profession: string;
  categoryId: ProviderCategoryId;

  description: string;

  provinceId: string;
  provinceName: string;

  districtId: string;
  districtName: string;

  locationLabel: string;

  latitude: number;
  longitude: number;
  distanceKm: number;

  verified: boolean;
  availableToday: boolean;
  acceptsUrgentRequests: boolean;
  instantBooking: boolean;

  rating: number;
  reviewCount: number;
  completedJobs: number;

  yearsExperience: string;
  responseRate: number;
  averageResponseMinutes: number;

  minimumPrice: number;
  currency: "AFN";

  serviceRadiusKm: number;

  workingDays: string[];
  startTime: string;
  endTime: string;

  services: ProviderService[];
  reviews: ProviderReview[];
  portfolio: ProviderPortfolioItem[];
};

export const providers: ProviderProfile[] = [
  {
    id: "provider-1",

    name: "احمد ولی",
    initials: "او",
    profession: "برق‌کار حرفه‌ای",
    categoryId: "electrician",

    description:
      "در نصب، ترمیم و عیب‌یابی سیستم‌های برقی خانه و دفتر تجربه دارم. کارها را با ابزار مناسب، دقت بالا و رعایت اصول ایمنی انجام می‌دهم.",

    provinceId: "kabul",
    provinceName: "کابل",

    districtId: "kabul",
    districtName: "ناحیه دهم",

    locationLabel: "ناحیه دهم، کابل",

    latitude: 34.5553,
    longitude: 69.2075,
    distanceKm: 1.2,

    verified: true,
    availableToday: true,
    acceptsUrgentRequests: true,
    instantBooking: true,

    rating: 4.9,
    reviewCount: 86,
    completedJobs: 142,

    yearsExperience: "۶ تا ۱۰ سال",
    responseRate: 96,
    averageResponseMinutes: 8,

    minimumPrice: 600,
    currency: "AFN",

    serviceRadiusKm: 20,

    workingDays: [
      "saturday",
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
    ],
    startTime: "08:00",
    endTime: "17:00",

    services: [
      {
        id: "wiring-repair",
        title: "ترمیم سیم‌کشی برق",
        description:
          "بررسی و ترمیم سیم‌کشی، اتصالات و مشکلات برق خانه یا دفتر",
        estimatedPrice: 1200,
      },
      {
        id: "socket-installation",
        title: "نصب کلید و پریز",
        description:
          "نصب یا تعویض کلید، پریز و اتصالات برقی",
        estimatedPrice: 600,
      },
      {
        id: "lighting-installation",
        title: "نصب چراغ و روشنایی",
        description:
          "نصب چراغ سقفی، دیواری، لوستر و سیستم روشنایی",
        estimatedPrice: 800,
      },
      {
        id: "breaker-repair",
        title: "ترمیم فیوز و تابلو برق",
        description:
          "بررسی و ترمیم فیوز، بریکر و تابلو برق",
        estimatedPrice: 1500,
      },
      {
        id: "generator-installation",
        title: "نصب و اتصال جنراتور",
        description:
          "نصب، تنظیم و اتصال جنراتور به سیستم برق",
        estimatedPrice: 2500,
      },
    ],

    reviews: [
      {
        id: "review-1",
        customerName: "محمد نعیم",
        customerInitials: "من",
        rating: 5,
        comment:
          "بسیار به‌موقع رسید و مشکل سیم‌کشی را سریع و دقیق حل کرد.",
        createdAt: "2026-07-29T09:30:00.000Z",
      },
      {
        id: "review-2",
        customerName: "فاطمه احمدی",
        customerInitials: "فا",
        rating: 5,
        comment:
          "چراغ‌ها و پریزهای خانه را با کیفیت خوب نصب کرد.",
        createdAt: "2026-07-23T11:00:00.000Z",
      },
    ],

    portfolio: [
      {
        id: "portfolio-1",
        title: "نصب تابلو برق خانه",
      },
      {
        id: "portfolio-2",
        title: "سیستم روشنایی دفتر",
      },
      {
        id: "portfolio-3",
        title: "اتصال جنراتور",
      },
    ],
  },

  {
    id: "provider-2",

    name: "محمد سلیم",
    initials: "مس",
    profession: "لوله‌کش و تخنیکر آب",
    categoryId: "plumber",

    description:
      "در ترمیم نشت لوله، باز کردن بندش فاضلاب، نصب وسایل تشناب و آب‌گرم‌کن تجربه دارم.",

    provinceId: "kabul",
    provinceName: "کابل",

    districtId: "kabul",
    districtName: "ناحیه چهارم",

    locationLabel: "ناحیه چهارم، کابل",

    latitude: 34.5319,
    longitude: 69.1872,
    distanceKm: 2.4,

    verified: true,
    availableToday: true,
    acceptsUrgentRequests: true,
    instantBooking: false,

    rating: 4.8,
    reviewCount: 64,
    completedJobs: 97,

    yearsExperience: "۳ تا ۵ سال",
    responseRate: 92,
    averageResponseMinutes: 14,

    minimumPrice: 750,
    currency: "AFN",

    serviceRadiusKm: 10,

    workingDays: [
      "saturday",
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
    ],
    startTime: "07:00",
    endTime: "18:00",

    services: [
      {
        id: "pipe-leak-repair",
        title: "ترمیم نشت لوله",
        description:
          "تشخیص و ترمیم نشت آب در آشپزخانه، حمام و سیستم لوله‌کشی",
        estimatedPrice: 750,
      },
      {
        id: "drain-unblocking",
        title: "باز کردن بندش فاضلاب",
        description:
          "باز کردن بندش لوله و فاضلاب خانه یا دفتر",
        estimatedPrice: 900,
      },
      {
        id: "water-heater-installation",
        title: "نصب آب‌گرم‌کن",
        description:
          "نصب و اتصال آب‌گرم‌کن و بررسی ایمنی سیستم",
        estimatedPrice: 1800,
      },
    ],

    reviews: [
      {
        id: "review-3",
        customerName: "صدیق",
        customerInitials: "ص",
        rating: 5,
        comment:
          "نشت لوله آشپزخانه را به‌خوبی و بدون تأخیر ترمیم کرد.",
        createdAt: "2026-07-26T13:20:00.000Z",
      },
    ],

    portfolio: [
      {
        id: "portfolio-4",
        title: "ترمیم لوله آشپزخانه",
      },
      {
        id: "portfolio-5",
        title: "نصب آب‌گرم‌کن",
      },
    ],
  },

  {
    id: "provider-3",

    name: "فرید احمد",
    initials: "فا",
    profession: "نجار و کابینت‌ساز",
    categoryId: "carpenter",

    description:
      "در ساخت کابینت، ترمیم دروازه، ساخت میز، چوکی و وسایل چوبی سفارشی فعالیت دارم.",

    provinceId: "kabul",
    provinceName: "کابل",

    districtId: "kabul",
    districtName: "کارته سه",

    locationLabel: "کارته سه، کابل",

    latitude: 34.5008,
    longitude: 69.1465,
    distanceKm: 3.1,

    verified: true,
    availableToday: false,
    acceptsUrgentRequests: false,
    instantBooking: false,

    rating: 4.7,
    reviewCount: 49,
    completedJobs: 73,

    yearsExperience: "بیشتر از ۱۰ سال",
    responseRate: 88,
    averageResponseMinutes: 28,

    minimumPrice: 1200,
    currency: "AFN",

    serviceRadiusKm: 20,

    workingDays: [
      "saturday",
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
    ],
    startTime: "08:00",
    endTime: "17:00",

    services: [
      {
        id: "cabinet-building",
        title: "ساخت کابینت",
        description:
          "طراحی، ساخت و نصب کابینت آشپزخانه و دفتر",
        estimatedPrice: 6000,
      },
      {
        id: "door-repair",
        title: "ترمیم دروازه",
        description:
          "ترمیم دروازه‌های چوبی، قفل، چارچوب و لولا",
        estimatedPrice: 1200,
      },
      {
        id: "custom-furniture",
        title: "ساخت وسایل چوبی",
        description:
          "ساخت میز، چوکی، الماری و وسایل چوبی سفارشی",
        estimatedPrice: 3500,
      },
    ],

    reviews: [],
    portfolio: [],
  },

  {
    id: "provider-4",

    name: "مریم احمدی",
    initials: "ما",
    profession: "ارائه‌دهندهٔ خدمات نظافت",
    categoryId: "cleaner",

    description:
      "خدمات نظافت خانه، دفتر و پاک‌کاری عمیق را با وسایل مناسب و برنامه منظم انجام می‌دهم.",

    provinceId: "kabul",
    provinceName: "کابل",

    districtId: "kabul",
    districtName: "ناحیه یازدهم",

    locationLabel: "ناحیه یازدهم، کابل",

    latitude: 34.5831,
    longitude: 69.1283,
    distanceKm: 2.8,

    verified: true,
    availableToday: true,
    acceptsUrgentRequests: false,
    instantBooking: true,

    rating: 4.9,
    reviewCount: 74,
    completedJobs: 118,

    yearsExperience: "۳ تا ۵ سال",
    responseRate: 98,
    averageResponseMinutes: 6,

    minimumPrice: 900,
    currency: "AFN",

    serviceRadiusKm: 15,

    workingDays: [
      "saturday",
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
    ],
    startTime: "08:00",
    endTime: "18:00",

    services: [
      {
        id: "home-cleaning",
        title: "نظافت خانه",
        description:
          "نظافت عمومی اتاق‌ها، آشپزخانه و تشناب",
        estimatedPrice: 900,
      },
      {
        id: "office-cleaning",
        title: "نظافت دفتر",
        description:
          "نظافت منظم دفتر، فروشگاه و محل کار",
        estimatedPrice: 1200,
      },
      {
        id: "deep-cleaning",
        title: "پاک‌کاری عمیق",
        description:
          "پاک‌کاری کامل و عمیق خانه یا محل کار",
        estimatedPrice: 1800,
      },
    ],

    reviews: [],
    portfolio: [],
  },

  {
    id: "provider-5",

    name: "عبدالرحمان",
    initials: "عر",
    profession: "استادکار ساختمانی",
    categoryId: "construction",

    description:
      "در دیوارچینی، گچ‌کاری، ترمیم و بازسازی بخش‌های مختلف ساختمان فعالیت دارم.",

    provinceId: "kabul",
    provinceName: "کابل",

    districtId: "kabul",
    districtName: "دشت برچی",

    locationLabel: "دشت برچی، کابل",

    latitude: 34.4825,
    longitude: 69.0757,
    distanceKm: 5.6,

    verified: false,
    availableToday: true,
    acceptsUrgentRequests: true,
    instantBooking: false,

    rating: 4.6,
    reviewCount: 38,
    completedJobs: 66,

    yearsExperience: "۶ تا ۱۰ سال",
    responseRate: 81,
    averageResponseMinutes: 41,

    minimumPrice: 1500,
    currency: "AFN",

    serviceRadiusKm: 30,

    workingDays: [
      "saturday",
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
    ],
    startTime: "07:00",
    endTime: "17:00",

    services: [
      {
        id: "wall-building",
        title: "دیوارچینی",
        description:
          "ساخت و ترمیم دیوارهای داخلی و خارجی",
        estimatedPrice: 2500,
      },
      {
        id: "plastering",
        title: "گچ‌کاری",
        description:
          "گچ‌کاری، صاف‌کاری و ترمیم دیوار و سقف",
        estimatedPrice: 1500,
      },
      {
        id: "renovation",
        title: "بازسازی ساختمان",
        description:
          "بازسازی اتاق، آشپزخانه، تشناب و بخش‌های دیگر",
        estimatedPrice: 5000,
      },
    ],

    reviews: [],
    portfolio: [],
  },

  {
    id: "provider-6",

    name: "نعمت‌الله",
    initials: "ن",
    profession: "ترمیم‌کار کمپیوتر",
    categoryId: "computer-repair",

    description:
      "در عیب‌یابی سخت‌افزار، نصب سیستم‌عامل، پاک‌سازی ویروس و بهبود سرعت کمپیوتر تجربه دارم.",

    provinceId: "kabul",
    provinceName: "کابل",

    districtId: "kabul",
    districtName: "شهر نو",

    locationLabel: "شهر نو، کابل",

    latitude: 34.5324,
    longitude: 69.1662,
    distanceKm: 4.2,

    verified: true,
    availableToday: false,
    acceptsUrgentRequests: false,
    instantBooking: false,

    rating: 4.8,
    reviewCount: 53,
    completedJobs: 91,

    yearsExperience: "۶ تا ۱۰ سال",
    responseRate: 90,
    averageResponseMinutes: 19,

    minimumPrice: 700,
    currency: "AFN",

    serviceRadiusKm: 10,

    workingDays: [
      "saturday",
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
    ],
    startTime: "09:00",
    endTime: "18:00",

    services: [
      {
        id: "hardware-repair",
        title: "ترمیم سخت‌افزار",
        description:
          "عیب‌یابی و ترمیم قطعات کمپیوتر و لپ‌تاپ",
        estimatedPrice: 1000,
      },
      {
        id: "operating-system-installation",
        title: "نصب سیستم‌عامل",
        description:
          "نصب ویندوز، درایورها و برنامه‌های ضروری",
        estimatedPrice: 700,
      },
      {
        id: "virus-removal",
        title: "پاک‌سازی ویروس",
        description:
          "حذف ویروس، برنامه‌های مخرب و بهبود امنیت دستگاه",
        estimatedPrice: 800,
      },
    ],

    reviews: [],
    portfolio: [],
  },
];

export function getProviderById(
  providerId: string,
): ProviderProfile | undefined {
  return providers.find(
    (provider) => provider.id === providerId,
  );
}

export function getProvidersByCategory(
  categoryId: ProviderCategoryId,
): ProviderProfile[] {
  return providers.filter(
    (provider) =>
      provider.categoryId === categoryId,
  );
}

export function getMinimumServicePrice(
  provider: ProviderProfile,
): number {
  if (provider.services.length === 0) {
    return provider.minimumPrice;
  }

  return Math.min(
    ...provider.services.map(
      (service) => service.estimatedPrice,
    ),
  );
}