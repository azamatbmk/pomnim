export const services = [
  {
    id: 'clean',
    title: 'Уборка участка',
    description: 'Листва, сорняки, мусор и бережная очистка.',
    price: 1500,
    icon: 'leaf',
  },
  {
    id: 'paint',
    title: 'Покраска ограды',
    description: 'Подготовка поверхности и обновление покрытия.',
    price: 3000,
    icon: 'paint',
  },
  {
    id: 'flowers',
    title: 'Возложение цветов',
    description: 'Цветы к памятной дате по вашим пожеланиям.',
    price: 1200,
    icon: 'flower',
  },
  {
    id: 'visit',
    title: 'Осмотр и фото',
    description: 'Проверка состояния участка с фотоотчётом.',
    price: 800,
    icon: 'camera',
  },
] as const

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
