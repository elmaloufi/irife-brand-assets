export interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}
export interface DestinationSummary {
  id: string; slug: string; name: string; countryCode: string;
  region: string | null; summary: string | null;
}
export interface ExperienceCard {
  id: string; slug: string; title: string; summary: string | null;
  currency: string; priceFrom: string | null; durationMinutes: number | null;
  maxGroupSize: number | null; provider: { name: string };
  destination: { id: string; slug: string; name: string };
  media: Array<{ url: string; altText: string | null; position: number }>;
}
export interface ExperienceDetail extends ExperienceCard { description: string; }
