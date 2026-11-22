import { IsDateString, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength } from 'class-validator';

export class CreateEnquiryDto {
  @IsUUID()
  experienceId!: string;

  @IsOptional()
  @IsDateString()
  requestedStartAt?: string;

  @IsInt()
  @Min(1)
  @Max(20)
  guestCount = 1;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  message!: string;
}
