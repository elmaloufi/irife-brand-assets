import { Transform, Type } from 'class-transformer';
import { IsInt, IsISO8601, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator';

export class CreateEnquiryDto {
  @IsUUID()
  experienceId!: string;

  @IsOptional()
  @IsISO8601()
  requestedStartAt?: string;

  @ValidateIf((_object, value) => value !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  guestCount = 1;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;
}
