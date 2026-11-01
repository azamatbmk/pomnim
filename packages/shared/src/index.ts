export const tokens = {
  bg: '#f7f7f2',
  paper: '#ffffff',
  ink: '#283a32',
  muted: '#737d75',
  green: '#344f40',
  line: '#e2e6dd',
} as const

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
