export const people = [
  {
    id: '01',
    area: 'Владикавказ и окрестности',
    work: 'Уборка, осмотр и уход за участком',
    tags: ['Уборка', 'Осмотр'],
  },
  {
    id: '02',
    area: 'Беслан и Правобережный район',
    work: 'Покраска оград и сезонный уход',
    tags: ['Покраска', 'Уборка'],
  },
  {
    id: '03',
    area: 'Алагир и Алагирский район',
    work: 'Осмотр участка и возложение цветов',
    tags: ['Цветы', 'Осмотр'],
  },
] as const

export function rub(value: number) {
  return `${new Intl.NumberFormat('ru-RU').format(value)} ₽`
}

export function personById(id: string) {
  return people.find((person) => person.id === id)
}
