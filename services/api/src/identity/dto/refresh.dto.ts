import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RefreshDto {
  @IsString()
  @MinLength(32)
  @MaxLength(128)
  refreshToken!: string;

  @IsOptional()
  @IsString()
  @MinLength(16)
  @MaxLength(128)
  requestId?: string;
}
