import {
  clearGraveDraft,
  createGrave,
  draftToGraveInput,
  readGraveDraft,
  writeGraveDraft,
  type Grave,
  type GraveFormDraft,
} from '../../entities/grave'

let inFlight: Promise<Grave | null> | null = null

export function flushGraveDraft(token: string) {
  if (inFlight) return inFlight

  inFlight = (async () => {
    const draft = await readGraveDraft()
    if (!draft) return null

    if (!draft.readyForAuth) {
      await clearGraveDraft()
      return null
    }

    const input = draftToGraveInput(draft)
    if (!input) {
      await clearGraveDraft()
      return null
    }

    // Снимаем флаг до запроса, чтобы повторный вход не создал дубликат
    const locked: GraveFormDraft = { ...draft, readyForAuth: false, savedAt: Date.now() }
    await writeGraveDraft(locked)

    try {
      const grave = await createGrave(token, input)
      await clearGraveDraft()
      return grave
    } catch (error) {
      await writeGraveDraft({ ...draft, readyForAuth: true, savedAt: Date.now() }).catch(() => undefined)
      throw error
    }
  })().finally(() => {
    inFlight = null
  })

  return inFlight
}
