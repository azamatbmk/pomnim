import { roundMapCoord } from '@pomnim/shared'
import { api } from '../../shared/api/client'
import type { Grave, GraveInput, GraveList, MapPoint } from './types'

export type { FamilyOption, Grave, GraveInput, GraveList, MapPoint } from './types'
export {
  clearGraveDraft,
  draftHasContent,
  draftToGraveInput,
  emptyGraveDraft,
  readGraveDraft,
  writeGraveDraft,
  type GraveFormDraft,
} from './draft'

export function graveYears(grave: Pick<Grave, 'birthYear' | 'deathYear'>) {
  if (grave.birthYear && grave.deathYear) return `${grave.birthYear}–${grave.deathYear}`
  if (grave.birthYear) return String(grave.birthYear)
  if (grave.deathYear) return String(grave.deathYear)
  return ''
}

export function graveMapPoint(value: { latitude: number | null; longitude: number | null }): MapPoint | null {
  if (value.latitude == null || value.longitude == null) return null
  if (!Number.isFinite(value.latitude) || !Number.isFinite(value.longitude)) return null
  if (value.latitude < -90 || value.latitude > 90 || value.longitude < -180 || value.longitude > 180) return null
  return { latitude: roundMapCoord(value.latitude), longitude: roundMapCoord(value.longitude) }
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
