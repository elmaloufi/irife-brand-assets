import {
  Injectable,
  ServiceUnavailableException,
  GatewayTimeoutException,
  BadGatewayException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

@Injectable()
export class IntegrationsService {
  constructor(private readonly config: ConfigService) {}

  async getWeather(latitude: number, longitude: number): Promise<unknown> {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.search = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
      timezone: 'auto',
      forecast_days: '3',
    }).toString();
    return this.requestJson(url, { headers: { Accept: 'application/json' } });
  }

  async geocode(query: string, language = 'en'): Promise<unknown> {
    const base = this.config.get<string>('NOMINATIM_BASE_URL') ?? 'https://nominatim.openstreetmap.org';
    let url: URL;
    try {
      url = new URL(base);
    } catch {
      throw new ServiceUnavailableException('Geocoding provider configuration is invalid');
    }
    if (url.protocol !== 'https:' && !(this.config.get<string>('NODE_ENV') !== 'production' && url.hostname === 'localhost')) {
      throw new ServiceUnavailableException('Geocoding provider must use HTTPS');
    }
    url.pathname = '/search';
    url.search = new URLSearchParams({
      q: query,
      format: 'jsonv2',
      limit: '5',
      addressdetails: '1',
    }).toString();
    return this.requestJson(url, {
      headers: {
        Accept: 'application/json',
        'Accept-Language': language,
        'User-Agent': this.config.get<string>('NOMINATIM_USER_AGENT') ?? 'IRIFE/0.1 (Morocco travel discovery)',
      },
    });
  }

  async getEvents(city: string, countryCode = 'MA', size = 20): Promise<unknown> {
    const apiKey = this.config.get<string>('TICKETMASTER_API_KEY');
    if (!apiKey) throw new ServiceUnavailableException('Events integration is not configured');
    const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json');
    url.search = new URLSearchParams({
      city,
      countryCode,
      size: String(size),
      sort: 'date,asc',
      apikey: apiKey,
    }).toString();
    return this.requestJson(url, { headers: { Accept: 'application/json' } });
  }

  async chat(messages: ChatMessage[]): Promise<unknown> {
    const apiKey = this.config.get<string>('ITRI_AI_API_KEY');
    const model = this.config.get<string>('ITRI_AI_MODEL');
    const endpoint = this.config.get<string>('ITRI_AI_BASE_URL') ?? 'https://api.openai.com/v1/chat/completions';
    if (!apiKey || !model) {
      throw new ServiceUnavailableException('ITRI AI provider is not configured');
    }
    let url: URL;
    try {
      url = new URL(endpoint);
    } catch {
      throw new ServiceUnavailableException('ITRI AI endpoint configuration is invalid');
    }
    if (url.protocol !== 'https:' && !(this.config.get<string>('NODE_ENV') !== 'production' && url.hostname === 'localhost')) {
      throw new ServiceUnavailableException('ITRI AI endpoint must use HTTPS');
    }
    const systemMessage: ChatMessage = {
      role: 'system',
      content: 'You are ITRI, the travel assistant for IRIFE in Morocco. Be multilingual and concise. Never invent prices, opening hours, availability, ratings, routes, or provider facts. If verified IRIFE data is not supplied, clearly say that the information must be checked. Do not claim to have booked anything.',
    };
    return this.requestJson(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, messages: [systemMessage, ...messages], temperature: 0.3 }),
    });
  }

  private async requestJson(url: URL, init: RequestInit): Promise<unknown> {
    let response: Response;
    try {
      response = await fetch(url, { ...init, signal: AbortSignal.timeout(8_000) });
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        throw new GatewayTimeoutException('External provider timed out');
      }
      throw new ServiceUnavailableException('External provider is temporarily unavailable');
    }
    if (!response.ok) {
      throw new BadGatewayException('External provider returned an unsuccessful response');
    }
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.toLowerCase().includes('application/json')) {
      throw new BadGatewayException('External provider returned an unsupported response');
    }
    try {
      return await response.json();
    } catch {
      throw new BadGatewayException('External provider returned invalid JSON');
    }
  }
}
