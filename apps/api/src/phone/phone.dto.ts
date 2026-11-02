import { IsString, MaxLength, MinLength } from 'class-validator'

export class PhoneDto {
  @IsString()
  @MinLength(10, { message: 'Введите номер полностью' })
  @MaxLength(20, { message: 'Введите номер полностью' })
  phone!: string
}

export class VerifyCodeDto extends PhoneDto {
  @IsString()
  @MinLength(4, { message: 'Введите четыре цифры' })
  @MaxLength(4, { message: 'Введите четыре цифры' })
  code!: string
}

export class SetNameDto {
  @IsString()
  @MinLength(1, { message: 'Введите имя' })
  @MaxLength(40, { message: 'Имя слишком длинное' })
  name!: string
}
