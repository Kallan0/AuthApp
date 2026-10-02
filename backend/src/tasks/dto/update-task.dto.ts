import { IsDateString, IsIn, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';

export class UpdateTaskDto {
  @ValidateIf((_, value) => value !== undefined) @IsString() @MinLength(1) @MaxLength(120) @Matches(/\S/) title?: string;
  @ValidateIf((_, value) => value !== undefined) @IsString() @MaxLength(2000) description?: string;
  @ValidateIf((_, value) => value !== undefined) @IsDateString() scheduledAt?: string;
  @ValidateIf((_, value) => value !== undefined) @IsDateString() deadline?: string;
  @ValidateIf((_, value) => value !== undefined) @IsIn(['low', 'medium', 'high']) priority?: 'low' | 'medium' | 'high';
  @IsOptional() @IsString() @MaxLength(60) category?: string | null;
  @ValidateIf((_, value) => value !== undefined) @IsIn(['pending', 'completed']) status?: 'pending' | 'completed';
}