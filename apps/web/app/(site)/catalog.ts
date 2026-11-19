import { defaultServices, readCatalog, type ServiceIcon } from '@pomnim/shared'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001'

export type PublicService = {
  id: string
  title: string
  description: string
  price: number
  icon: ServiceIcon | null
}

export function fallbackServices(): PublicService[] {
  return defaultServices.map((service) => ({
    id: service.id,
    title: service.title,
    description: service.description,
    price: service.price,
    icon: service.icon,
  }))
}

export async function liveServices() {
  try {
    const response = await fetch(`${apiUrl}/api/services`, { cache: 'no-store' })
    if (!response.ok) return null
    return readCatalog(await response.json())
  } catch {
    return null
  }
}
