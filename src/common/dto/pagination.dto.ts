import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

export class PaginationDto {
  @IsOptional()
  page: number = DEFAULT_PAGE;

  @IsOptional()
  @Transform(({ value }) =>
    Math.min(Number(value) || DEFAULT_LIMIT, DEFAULT_LIMIT),
  )
  limit: number = DEFAULT_LIMIT;
}
