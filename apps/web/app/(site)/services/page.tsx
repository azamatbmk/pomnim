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
        Можно выбрать одну услугу или несколько. Цена каждой услуги фиксированная.
      </p>
      <ServiceGrid />
      <div className={styles.callout}>
        <b>Это стоимость услуг.</b> Если задача не из списка, сумму называет семья. Материалы, вывоз мусора и дорога оговариваются отдельно, когда не входят в услугу.
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
