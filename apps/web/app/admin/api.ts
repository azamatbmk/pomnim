const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${apiUrl}/api${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
}

export async function readError(response: Response) {
  try {
    const body = (await response.json()) as { message?: string | string[] }
    if (Array.isArray(body.message)) return body.message.join('. ')
    if (typeof body.message === 'string') return body.message
  } catch {
    return 'Не получилось. Попробуйте ещё раз.'
  }
  return 'Не получилось. Попробуйте ещё раз.'
}
