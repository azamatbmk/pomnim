import { IsString, MaxLength, MinLength } from 'class-validator'

export class CreateWorkerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string

  @IsString()
  phone!: string

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  area!: string
}
