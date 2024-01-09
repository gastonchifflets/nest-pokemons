import { Transform } from "class-transformer"
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator"

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsPositive()
  @Min(1)
  limit?: number
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @IsPositive()
  @Min(1)
  page?: number
}