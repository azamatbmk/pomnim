import { authCodeLength } from '@pomnim/shared'
import { IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class PhoneDto {
  @IsString()
  @MinLength(10, { message: 'Введите номер полностью' })
  @MaxLength(20, { message: 'Введите номер полностью' })
  phone!: string
}

export class VerifyCodeDto extends PhoneDto {
  @IsString()
  @Matches(new RegExp(`^\\d{${authCodeLength}}$`), { message: `Введите ${authCodeLength} цифр` })
  code!: string
}

export class SetNameDto {
  @IsString()
  @MinLength(1, { message: 'Введите имя' })
  @MaxLength(40, { message: 'Имя слишком длинное' })
  name!: string
}
