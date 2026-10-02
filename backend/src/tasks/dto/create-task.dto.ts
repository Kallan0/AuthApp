import { IsDateString, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString() @MinLength(1) @MaxLength(120) @Matches(/\S/) title: string;
  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsDateString() scheduledAt: string;
  @IsDateString() deadline: string;
  @IsIn(['low', 'medium', 'high']) priority: 'low' | 'medium' | 'high';
  @IsOptional() @IsString() @MaxLength(60) category?: string | null;
}