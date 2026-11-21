import { IsInt, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength, ValidateIf } from 'class-validator'

export class SaveGraveDto {
  @IsString()
  @MinLength(1, { message: 'Введите имя' })
  @MaxLength(80, { message: 'Имя слишком длинное' })
  fullName!: string

  @IsOptional()
  @IsInt({ message: 'Год рождения — четыре цифры' })
  @Min(1800, { message: 'Год рождения — четыре цифры' })
  @Max(2100, { message: 'Год рождения — четыре цифры' })
  birthYear?: number | null

  @IsOptional()
  @IsInt({ message: 'Год смерти — четыре цифры' })
  @Min(1800, { message: 'Год смерти — четыре цифры' })
  @Max(2100, { message: 'Год смерти — четыре цифры' })
  deathYear?: number | null

  @IsString()
  @MinLength(1, { message: 'Укажите населённый пункт' })
  @MaxLength(80, { message: 'Населённый пункт слишком длинный' })
  city!: string

  @IsString()
  @MinLength(1, { message: 'Укажите кладбище' })
  @MaxLength(120, { message: 'Название кладбища слишком длинное' })
  cemetery!: string

  @IsOptional()
  @IsString()
  @MaxLength(800, { message: 'Ориентиры слишком длинные' })
  landmarks?: string | null

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber(
    { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 7 },
    { message: 'Укажите точку на карте' },
  )
  @Min(-90, { message: 'Некорректная широта' })
  @Max(90, { message: 'Некорректная широта' })
  latitude?: number | null

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsNumber(
    { allowNaN: false, allowInfinity: false, maxDecimalPlaces: 7 },
    { message: 'Укажите точку на карте' },
  )
  @Min(-180, { message: 'Некорректная долгота' })
  @Max(180, { message: 'Некорректная долгота' })
  longitude?: number | null

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Биография слишком длинная' })
  biography?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(800, { message: 'Поле слишком длинное' })
  keepOff?: string | null

  @IsOptional()
  @IsString()
  familyId?: string | null

  @IsOptional()
  @IsString()
  @MaxLength(60, { message: 'Название семьи слишком длинное' })
  familyName?: string | null
}
