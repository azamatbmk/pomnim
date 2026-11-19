import type { Metadata } from 'next'
import { ServiceGrid } from '../service-card'
import styles from '../site.module.css'

export const metadata: Metadata = { title: 'Услуги' }

const steps = [
  ['01', 'Разовая помощь', 'Уборка или осмотр, когда вам нужна помощь на месте.'],
  ['02', 'К памятной дате', 'Укажите желаемую дату. Исполнитель должен подтвердить, что успеет выполнить работу.'],
  ['03', 'Индивидуальный уход', 'Уточните материал памятника, цвет ограды и пожелания семьи. Дополнительные работы — после согласования.'],
]

export default function ServicesPage() {
  return (
    <>
      <h1 className={styles.pageTitle}>Уход с вниманием к деталям</h1>
      <p className={styles.lead}>
        Можно выбрать одну услугу или несколько. Итоговая стоимость зависит от состояния участка, объёма работ, материалов и расстояния.
      </p>
      <ServiceGrid />
      <div className={styles.callout}>
        <b>Цены приведены как пример.</b> Перед работами исполнитель предлагает сумму и объём. Поиск захоронения, материалы, вывоз мусора и дорога согласуются отдельно, если не входят в предложение.
      </div>
      <div className={styles.wideSteps}>
        {steps.map(([index, title, text]) => (
          <div className={styles.panel} key={index}>
            <span>{index}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </>
  )
}
