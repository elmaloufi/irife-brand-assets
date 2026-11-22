export interface SavedExperienceSummary {
  id: string;
  createdAt: string;
  experience: {
    id: string;
    title: string;
    summary: string | null;
    currency: string;
    priceFrom: string | null;
    destination: { name: string };
    provider: { name: string };
    media: Array<{ url: string; altText: string | null }>;
  };
}
