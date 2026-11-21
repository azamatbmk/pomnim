import { parseGraveYear, roundMapCoord } from '@pomnim/shared'
import { clearStorage, readStorage, writeStorage } from '../../shared/lib/storage'
import type { GraveInput } from './types'

const draftKey = 'pomnim_grave_draft'
const draftTtlMs = 7 * 24 * 60 * 60 * 1000

export type GraveFormDraft = {
  fullName: string
  birthYear: string
  deathYear: string
  city: string
  cemetery: string
  landmarks: string
  latitude: number | null
  longitude: number | null
  biography: string
  keepOff: string
  familyChoice: 'none' | 'have' | 'new'
  familyId: string
  familyName: string
  readyForAuth: boolean
  savedAt: number
}

export function emptyGraveDraft(): GraveFormDraft {
  return {
    fullName: '',
    birthYear: '',
    deathYear: '',
    city: '',
    cemetery: '',
    landmarks: '',
    latitude: null,
    longitude: null,
    biography: '',
    keepOff: '',
    familyChoice: 'none',
    familyId: '',
    familyName: '',
    readyForAuth: false,
    savedAt: Date.now(),
  }
}

export function draftHasContent(draft: GraveFormDraft) {
  return Boolean(
    draft.fullName.trim() ||
      draft.birthYear.trim() ||
      draft.deathYear.trim() ||
      draft.city.trim() ||
      draft.cemetery.trim() ||
      draft.landmarks.trim() ||
      draft.biography.trim() ||
      draft.keepOff.trim() ||
      draft.familyName.trim() ||
      draft.latitude != null ||
      draft.longitude != null ||
      draft.familyChoice !== 'none',
  )
}

export function draftToGraveInput(draft: GraveFormDraft): GraveInput | null {
  const fullName = draft.fullName.trim()
  const city = draft.city.trim()
  const cemetery = draft.cemetery.trim()
  if (!fullName || !city || !cemetery) return null

  const birthYear = parseGraveYear(draft.birthYear)
  const deathYear = parseGraveYear(draft.deathYear)
  if (birthYear === undefined || deathYear === undefined) return null
  if (birthYear != null && deathYear != null && deathYear < birthYear) return null

  if (draft.familyChoice === 'new' && !draft.familyName.trim()) return null
  if (draft.familyChoice === 'have' && !draft.familyId) return null

  const hasLat = draft.latitude != null
  const hasLng = draft.longitude != null
  if (hasLat !== hasLng) return null

  return {
    fullName,
    birthYear,
    deathYear,
    city,
    cemetery,
    landmarks: draft.landmarks.trim() || null,
    latitude: draft.latitude == null ? null : roundMapCoord(draft.latitude),
    longitude: draft.longitude == null ? null : roundMapCoord(draft.longitude),
    biography: draft.biography.trim() || null,
    keepOff: draft.keepOff.trim() || null,
    familyId: draft.familyChoice === 'have' ? draft.familyId : null,
    familyName: draft.familyChoice === 'new' ? draft.familyName.trim() : null,
  }
}

function readDraft(value: unknown): GraveFormDraft | null {
  if (typeof value !== 'object' || value === null) return null
  const empty = emptyGraveDraft()
  const fullName = Reflect.get(value, 'fullName')
  const birthYear = Reflect.get(value, 'birthYear')
  const deathYear = Reflect.get(value, 'deathYear')
  const city = Reflect.get(value, 'city')
  const cemetery = Reflect.get(value, 'cemetery')
  const landmarks = Reflect.get(value, 'landmarks')
  const latitude = Reflect.get(value, 'latitude')
  const longitude = Reflect.get(value, 'longitude')
  const biography = Reflect.get(value, 'biography')
  const keepOff = Reflect.get(value, 'keepOff')
  const familyChoice = Reflect.get(value, 'familyChoice')
  const familyId = Reflect.get(value, 'familyId')
  const familyName = Reflect.get(value, 'familyName')
  const readyForAuth = Reflect.get(value, 'readyForAuth')
  const savedAt = Reflect.get(value, 'savedAt')

  if (typeof fullName !== 'string') return null
  if (typeof birthYear !== 'string') return null
  if (typeof deathYear !== 'string') return null
  if (typeof city !== 'string') return null
  if (typeof cemetery !== 'string') return null
  if (typeof landmarks !== 'string') return null
  if (latitude !== null && typeof latitude !== 'number') return null
  if (longitude !== null && typeof longitude !== 'number') return null
  if (typeof biography !== 'string') return null
  if (typeof keepOff !== 'string') return null
  if (familyChoice !== 'none' && familyChoice !== 'have' && familyChoice !== 'new') return null
  if (typeof familyId !== 'string') return null
  if (typeof familyName !== 'string') return null

  const when = typeof savedAt === 'number' && Number.isFinite(savedAt) ? savedAt : Date.now()
  if (Date.now() - when > draftTtlMs) return null

  return {
    ...empty,
    fullName,
    birthYear,
    deathYear,
    city,
    cemetery,
    landmarks,
    latitude: typeof latitude === 'number' && Number.isFinite(latitude) ? roundMapCoord(latitude) : null,
    longitude: typeof longitude === 'number' && Number.isFinite(longitude) ? roundMapCoord(longitude) : null,
    biography,
    keepOff,
    familyChoice,
    familyId,
    familyName,
    readyForAuth: readyForAuth === true,
    savedAt: when,
  }
}

export async function readGraveDraft() {
  try {
    const raw = await readStorage(draftKey)
    if (!raw) return null
    const draft = readDraft(JSON.parse(raw) as unknown)
    if (!draft) await clearStorage(draftKey).catch(() => undefined)
    return draft
  } catch {
    return null
  }
}

export async function writeGraveDraft(draft: GraveFormDraft) {
  await writeStorage(draftKey, JSON.stringify({ ...draft, savedAt: Date.now() }))
}

export async function clearGraveDraft() {
  try {
    await clearStorage(draftKey)
  } catch {
    // ignore
  }
}
