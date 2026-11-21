import { api } from '../../shared/api/client'

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

export function graveYears(grave: Pick<Grave, 'birthYear' | 'deathYear'>) {
  if (grave.birthYear && grave.deathYear) return `${grave.birthYear}–${grave.deathYear}`
  if (grave.birthYear) return String(grave.birthYear)
  if (grave.deathYear) return String(grave.deathYear)
  return ''
}

export function graveMapPoint(value: { latitude: number | null; longitude: number | null }): MapPoint | null {
  if (value.latitude == null || value.longitude == null) return null
  if (!Number.isFinite(value.latitude) || !Number.isFinite(value.longitude)) return null
  return { latitude: value.latitude, longitude: value.longitude }
}

export function yandexMapsUrl(point: MapPoint) {
  return `https://yandex.ru/maps/?pt=${point.longitude},${point.latitude}&z=17&l=map`
}

export function listGraves(token: string) {
  return api<GraveList>('/api/graves', { token })
}

export function readGrave(token: string, id: string) {
  return api<Grave>(`/api/graves/${id}`, { token })
}

export function createGrave(token: string, body: GraveInput) {
  return api<Grave>('/api/graves', { method: 'POST', token, body })
}

export function updateGrave(token: string, id: string, body: GraveInput) {
  return api<Grave>(`/api/graves/${id}`, { method: 'PATCH', token, body })
}

export function deleteGrave(token: string, id: string) {
  return api<{ ok: true }>(`/api/graves/${id}`, { method: 'DELETE', token })
}
