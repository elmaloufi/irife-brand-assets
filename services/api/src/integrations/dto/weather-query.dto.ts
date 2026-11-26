import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude } from 'class-validator';

export class WeatherQueryDto {
  @Type(() => Number)
  @IsLatitude()
  latitude!: number;

  @Type(() => Number)
  @IsLongitude()
  longitude!: number;
}
