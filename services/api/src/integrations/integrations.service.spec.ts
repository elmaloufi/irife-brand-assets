import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { IntegrationsService } from './integrations.service.js';

describe('IntegrationsService', () => {
  const config = {
    get: jest.fn((key: string): string | undefined => ({
      NODE_ENV: 'test',
      NOMINATIM_USER_AGENT: 'IRIFE-test',
    }[key])),
  };
  const service = new IntegrationsService(config as never);
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('requests weather data from Open-Meteo', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => 'application/json' },
      json: async () => ({ current: { temperature_2m: 24 } }),
    });
    await expect(service.getWeather(31.6295, -7.9811)).resolves.toEqual({
      current: { temperature_2m: 24 },
    });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(URL),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('does not call Ticketmaster when its credential is absent', async () => {
    await expect(service.getEvents('Marrakech')).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('rejects non-JSON provider responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      headers: { get: () => 'text/html' },
    });
    await expect(service.getWeather(31.6, -8)).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('does not expose upstream error bodies', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      headers: { get: () => 'application/json' },
    });
    await expect(service.getWeather(31.6, -8)).rejects.toThrow(
      'External provider returned an unsuccessful response',
    );
  });
});
