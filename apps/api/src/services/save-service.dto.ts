import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator'
import { serviceIcons } from '@pomnim/shared'

export class SaveServiceDto {
  @IsString({ message: 'Введите название' })
  @MinLength(1, { message: 'Введите название' })
  @MaxLength(80, { message: 'Название слишком длинное' })
  title!: string

  @IsString({ message: 'Введите описание' })
  @MinLength(1, { message: 'Введите описание' })
  @MaxLength(400, { message: 'Описание слишком длинное' })
  description!: string

  @IsInt({ message: 'Укажите цену' })
  @Min(1, { message: 'Укажите цену' })
  @Max(1000000, { message: 'Сумма слишком большая' })
  price!: number

  @IsOptional()
  @IsString({ message: 'Такой иконки нет' })
  @IsIn([...serviceIcons], { message: 'Такой иконки нет' })
  icon?: string | null
}
