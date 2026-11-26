import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AccessTokenGuard } from '../identity/access-token.guard.js';
import { EventsQueryDto } from './dto/events-query.dto.js';
import { GeocodingQueryDto } from './dto/geocoding-query.dto.js';
import { ItRiChatDto } from './dto/itri-chat.dto.js';
import { WeatherQueryDto } from './dto/weather-query.dto.js';
import { IntegrationsService } from './integrations.service.js';
import { ProviderRateLimitGuard } from './provider-rate-limit.guard.js';

@ApiTags('integrations')
@Controller('integrations')
@UseGuards(ProviderRateLimitGuard)
export class IntegrationsController {
  constructor(private readonly integrations: IntegrationsService) {}

  @Get('weather')
  weather(@Query() query: WeatherQueryDto) {
    return this.integrations.getWeather(query.latitude, query.longitude);
  }

  @Get('geocoding')
  geocode(@Query() query: GeocodingQueryDto) {
    return this.integrations.geocode(query.q, query.language);
  }

  @Get('events')
  events(@Query() query: EventsQueryDto) {
    return this.integrations.getEvents(query.city, query.countryCode, query.size);
  }

  @Post('itri/chat')
  @UseGuards(ProviderRateLimitGuard, AccessTokenGuard)
  @ApiBearerAuth()
  chat(@Body() body: ItRiChatDto) {
    return this.integrations.chat(body.messages);
  }
}
