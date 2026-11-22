export type EnquiryStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED';
export interface EnquirySummary {
  id: string; status: EnquiryStatus; requestedStartAt: string | null; guestCount: number;
  message: string; createdAt: string; updatedAt: string;
  experience: { id: string; title: string; currency: string; priceFrom: string | null; provider: { name: string }; destination: { name: string } };
}
export interface CreateEnquiryInput { experienceId: string; requestedStartAt?: string; guestCount: number; message: string; }
