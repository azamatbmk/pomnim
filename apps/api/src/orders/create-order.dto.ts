import { IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator'

export class CreateOrderDto {
  @IsString({ message: 'Выберите карточку' })
  @MinLength(1, { message: 'Выберите карточку' })
  @MaxLength(64, { message: 'Выберите карточку' })
  graveId!: string

  @IsString({ message: 'Выберите услугу' })
  @MinLength(1, { message: 'Выберите услугу' })
  @MaxLength(64, { message: 'Выберите услугу' })
  service!: string

  @IsOptional()
  @IsString({ message: 'Опишите, что нужно сделать' })
  @MaxLength(800, { message: 'Описание слишком длинное' })
  details?: string | null

  @IsOptional()
  @IsString({ message: 'Пожелания слишком длинные' })
  @MaxLength(800, { message: 'Пожелания слишком длинные' })
  wishes?: string | null

  @IsOptional()
  @IsInt({ message: 'Назовите сумму' })
  @Min(1, { message: 'Назовите сумму' })
  @Max(1000000, { message: 'Сумма слишком большая' })
  price?: number | null

  @IsString({ message: 'Укажите дату' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Укажите дату' })
  desiredOn!: string
}
