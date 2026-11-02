export class ApiError extends Error {}

const base = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001'

type RequestOptions = {
  method?: string
  body?: unknown
  token?: string | null
}

export async function api<T>(path: string, options?: RequestOptions): Promise<T> {
  const headers: Record<string, string> = {}
  if (options?.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options?.token) headers.Authorization = `Bearer ${options.token}`

  let response: Response
  try {
    response = await fetch(`${base}${path}`, {
      method: options?.method ?? 'GET',
      headers,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError('Нет связи с сервером')
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => null)) as { message?: string | string[] } | null
    const message = Array.isArray(data?.message) ? data.message[0] : data?.message
    throw new ApiError(message || 'Не получилось')
  }

  return (await response.json()) as T
}
