export const HEALTH_RESPONSE_STATUSES = ['ok', 'degraded'] as const;
export const DATABASE_STATUSES = ['up', 'down'] as const;
export const HEALTH_SERVICE = 'irife-api' as const;

export interface HealthResponse {
  status: (typeof HEALTH_RESPONSE_STATUSES)[number];
  service: typeof HEALTH_SERVICE;
  timestamp: string;
  database: (typeof DATABASE_STATUSES)[number];
}
