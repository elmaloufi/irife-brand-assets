export const API_ERROR_FIELDS = [
  'statusCode',
  'code',
  'message',
  'requestId',
] as const;

export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  requestId: string;
}
