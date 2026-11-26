import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { IntegrationsService } from './integrations.service.js';
import { ProviderCache } from './provider-cache.js';

describe('IntegrationsService', () => {
  const values: Record<string, string | undefined> = {
    NODE_ENV: 'test',
    NOMINATIM_USER_AGENT: 'IRIFE-test',
  };
  const config = { get: jest.fn((key: string) => values[key]) };
  const prisma = {
    destination: { findMany: jest.fn(async () => [{ id: 'dest-1', name: 'Marrakech' }]) },
    experience: { findMany: jest.fn(async () => [{
      id: 'exp-1', title: 'Medina walk', priceFrom: { toString: () => '250.00' },
      provider: { name: 'Verified provider' }, destination: { name: 'Marrakech', slug: 'marrakech' },
    }]) },
  };
  const service = new IntegrationsService(config as never, new ProviderCache(), prisma as never);
  const originalFetch = global.fetch;

  beforeEach(() => {
    for (const key of Object.keys(values)) delete values[key];
    values.NODE_ENV = 'test';
    values.NOMINATIM_USER_AGENT = 'IRIFE-test';
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('requests weather data from Open-Meteo and caches the successful response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, headers: { get: () => 'application/json' },
      json: async () => ({ current: { temperature_2m: 24 } }),
    });
    await expect(service.getWeather(31.6295, -7.9811)).resolves.toEqual({ current: { temperature_2m: 24 } });
    await service.getWeather(31.6295, -7.9811);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('does not call Ticketmaster or OpenAgenda when credentials are absent', async () => {
    await expect(service.getEvents('Marrakech')).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('uses OpenAgenda as the free authenticated fallback when Ticketmaster is not configured', async () => {
    values.OPENAGENDA_API_KEY = 'test-public-key';
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true, headers: { get: () => 'application/json' },
        json: async () => ({ agendas: [{ uid: 123, title: 'Marrakech culture' }] }),
      })
      .mockResolvedValueOnce({
        ok: true, headers: { get: () => 'application/json' },
        json: async () => ({ events: [{ uid: 9, title: 'Festival', location: { city: 'Marrakech' } }] }),
      });
    await expect(service.getEvents('Marrakech', 'MA', 10)).resolves.toEqual({
      provider: 'openagenda',
      events: [{ uid: 9, title: 'Festival', location: { city: 'Marrakech' }, source: 'OpenAgenda', sourceAgenda: 'Marrakech culture' }],
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('includes only published catalogue context in ITRI requests', async () => {
    values.ITRI_AI_API_KEY = 'test-key';
    values.ITRI_AI_MODEL = 'test-model';
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true, headers: { get: () => 'application/json' }, json: async () => ({ choices: [] }),
    });
    await service.chat([{ role: 'user', content: 'Tell me about Marrakech' }]);
    const init = (global.fetch as jest.Mock).mock.calls[0]?.[1] as RequestInit;
    const request = JSON.parse(String(init.body)) as { messages: Array<{ content: string }> };
    expect(request.messages[0]?.content).toContain('IRIFE PostgreSQL published catalogue');
    expect(request.messages[0]?.content).toContain('Marrakech');
    expect(request.messages[0]?.content).toContain('catalogue starting price');
    expect(prisma.destination.findMany).toHaveBeenCalled();
    expect(prisma.experience.findMany).toHaveBeenCalled();
  });

  it('rejects non-JSON provider responses', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, headers: { get: () => 'text/html' } });
    await expect(service.getWeather(31.6, -8)).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('does not expose upstream error bodies', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, headers: { get: () => 'application/json' } });
    await expect(service.getWeather(31.6, -8)).rejects.toThrow('External provider returned an unsuccessful response');
  });
});
