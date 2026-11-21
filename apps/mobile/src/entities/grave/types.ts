export type Grave = {
  id: string
  fullName: string
  birthYear: number | null
  deathYear: number | null
  city: string
  cemetery: string
  landmarks: string | null
  latitude: number | null
  longitude: number | null
  biography: string | null
  keepOff: string | null
  familyId: string | null
  familyName: string | null
}

export type FamilyOption = {
  id: string
  name: string
}

export type GraveList = {
  families: FamilyOption[]
  graves: Grave[]
}

export type GraveInput = {
  fullName: string
  birthYear: number | null
  deathYear: number | null
  city: string
  cemetery: string
  landmarks: string | null
  latitude: number | null
  longitude: number | null
  biography: string | null
  keepOff: string | null
  familyId: string | null
  familyName: string | null
}

export type MapPoint = {
  latitude: number
  longitude: number
}
