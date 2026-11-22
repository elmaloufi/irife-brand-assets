export type EnquiryStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'COMPLETED';

export interface CreateEnquiryInput {
  experienceId: string;
  requestedStartAt?: string;
  guestCount: number;
  message: string;
}

export interface EnquirySummary {
  id: string;
  status: EnquiryStatus;
  requestedStartAt: string | null;
  guestCount: number;
  message: string;
  createdAt: string;
  experience: {
    id: string;
    title: string;
    destination: { name: string };
  };
  provider: { name: string };
}
