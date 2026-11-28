export type NodeEnvironment = 'development' | 'test' | 'production';

export interface ValidatedEnvironment {
  NODE_ENV: NodeEnvironment;
  PORT: number;
  DATABASE_URL: string;
  CORS_ORIGINS: string[];
  REFRESH_TOKEN_ENCRYPTION_KEY?: string;
}

const NODE_ENVIRONMENTS: readonly NodeEnvironment[] = [
  'development',
  'test',
  'production',
];

function readRequiredString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${name} is required`);
  }

  return value.trim();
}

function parsePort(value: unknown): number {
  if (value === undefined || value === '') {
    return 3000;
  }

  const text = typeof value === 'number' ? String(value) : value;
  if (typeof text !== 'string' || !/^\d+$/.test(text)) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  const port = Number(text);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535');
  }

  return port;
}

function parseCorsOrigins(value: unknown): string[] {
  if (value === undefined || value === '') {
    return [];
  }

  if (typeof value !== 'string') {
    throw new Error('CORS_ORIGINS must contain explicit HTTP or HTTPS origins');
  }

  const origins = value.split(',').map((origin) => origin.trim()).filter(Boolean);
  for (const origin of origins) {
    try {
      const parsed = new URL(origin);
      if (
        !['http:', 'https:'].includes(parsed.protocol) ||
        parsed.origin !== origin ||
        parsed.username.length > 0 ||
        parsed.password.length > 0
      ) {
        throw new Error();
      }
    } catch {
      throw new Error('CORS_ORIGINS must contain explicit HTTP or HTTPS origins');
    }
  }

  return [...new Set(origins)];
}

export function validateEnvironment(
  raw: Record<string, unknown>,
): ValidatedEnvironment {
  const nodeEnv = raw.NODE_ENV === undefined ? 'development' : raw.NODE_ENV;
  if (
    typeof nodeEnv !== 'string' ||
    !NODE_ENVIRONMENTS.includes(nodeEnv as NodeEnvironment)
  ) {
    throw new Error('NODE_ENV must be development, test, or production');
  }

  const databaseUrl = readRequiredString(raw.DATABASE_URL, 'DATABASE_URL');
  try {
    const parsed = new URL(databaseUrl);
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
      throw new Error();
    }
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL');
  }

  const rotationKey = raw.REFRESH_TOKEN_ENCRYPTION_KEY;
  if (rotationKey !== undefined && rotationKey !== '') {
    if (typeof rotationKey !== 'string') {
      throw new Error('REFRESH_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key');
    }
    const decoded = Buffer.from(rotationKey, 'base64');
    if (decoded.length !== 32 || decoded.toString('base64') !== rotationKey) {
      throw new Error('REFRESH_TOKEN_ENCRYPTION_KEY must be a base64-encoded 32-byte key');
    }
  } else if (nodeEnv === 'production') {
    throw new Error('REFRESH_TOKEN_ENCRYPTION_KEY is required in production');
  }

  return {
    NODE_ENV: nodeEnv as NodeEnvironment,
    PORT: parsePort(raw.PORT),
    DATABASE_URL: databaseUrl,
    CORS_ORIGINS: parseCorsOrigins(raw.CORS_ORIGINS),
    ...(typeof rotationKey === 'string' && rotationKey.length > 0
      ? { REFRESH_TOKEN_ENCRYPTION_KEY: rotationKey }
      : {}),
  };
}
