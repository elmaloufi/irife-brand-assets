export type EnquiryStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED';

export interface EnquirySummary {
  id: string;
  createdAt: string;
  requestedStartAt: string | null;
  guestCount: number;
  message: string;
  status: EnquiryStatus;
  experience: {
    id: string;
    title: string;
    destination: { name: string };
    provider: { name: string };
  };
}
