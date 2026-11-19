export const tokens = {
  bg: '#f7f7f2',
  paper: '#ffffff',
  ink: '#283a32',
  muted: '#737d75',
  green: '#344f40',
  line: '#e2e6dd',
} as const

export const otherService = { id: 'other', title: 'Другое' } as const

export const serviceIcons = ['leaf', 'paint', 'flower', 'camera', 'check', 'list'] as const

export type ServiceIcon = (typeof serviceIcons)[number]

export function isServiceIcon(id: string): id is ServiceIcon {
  return serviceIcons.some((icon) => icon === id)
}

export type CatalogService = {
  id: string
  title: string
  description: string
  price: number
  icon: ServiceIcon | null
}

export function readCatalogService(value: unknown): CatalogService | null {
  if (typeof value !== 'object' || value === null) return null
  const id = Reflect.get(value, 'id')
  const title = Reflect.get(value, 'title')
  const description = Reflect.get(value, 'description')
  const price = Reflect.get(value, 'price')
  const icon = Reflect.get(value, 'icon')
  if (typeof id !== 'string' || id.length < 1 || id.length > 64 || id === otherService.id) return null
  if (typeof title !== 'string' || title.trim().length < 1 || title.trim().length > 80) return null
  if (typeof description !== 'string' || description.trim().length < 1 || description.trim().length > 400) return null
  if (typeof price !== 'number' || !Number.isInteger(price) || price < 1 || price > 1000000) return null
  return {
    id,
    title: title.trim(),
    description: description.trim(),
    price,
    icon: typeof icon === 'string' && isServiceIcon(icon) ? icon : null,
  }
}

export function readCatalog(value: unknown): CatalogService[] | null {
  if (!Array.isArray(value)) return null
  return value.flatMap((row) => {
    const service = readCatalogService(row)
    return service ? [service] : []
  })
}

export const defaultServices = [
  {
    id: 'clean',
    title: 'Уборка участка',
    description: 'Листва, сорняки, мусор и бережная очистка.',
    price: 1500,
    icon: 'leaf',
    sort: 1,
  },
  {
    id: 'paint',
    title: 'Покраска ограды',
    description: 'Подготовка поверхности и обновление покрытия.',
    price: 3000,
    icon: 'paint',
    sort: 2,
  },
  {
    id: 'flowers',
    title: 'Возложение цветов',
    description: 'Цветы к памятной дате по вашим пожеланиям.',
    price: 1200,
    icon: 'flower',
    sort: 3,
  },
  {
    id: 'visit',
    title: 'Осмотр и фото',
    description: 'Проверка состояния участка с фотоотчётом.',
    price: 800,
    icon: 'camera',
    sort: 4,
  },
] as const

export function formatRubles(amount: number) {
  return `${new Intl.NumberFormat('ru-RU').format(amount)} ₽`
}

export type AppRole = 'customer' | 'worker'

export type AppSession = {
  token: string
  role: AppRole
  phone: string
  name: string | null
  needsName: boolean
}

export type Worker = {
  id: string
  name: string
  phone: string
  area: string
  disabledAt: string | null
  createdAt: string
}

export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))) {
    return '+7' + digits.slice(1)
  }
  if (digits.length === 10) return '+7' + digits
  return null
}

export function formatPhone(phone: string): string {
  const match = /^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(phone)
  if (!match) return phone
  return `+7 ${match[1]} ${match[2]}-${match[3]}-${match[4]}`
}
