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
