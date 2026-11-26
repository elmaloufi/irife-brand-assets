import { IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class GeocodingQueryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  q!: string;

  @IsOptional()
  @IsIn(['ar', 'en', 'fr', 'es'])
  language?: string;
}
