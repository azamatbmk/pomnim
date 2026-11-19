import Link from 'next/link'
import { rub, services } from './data'
import { Icon } from './icons'
import styles from './site.module.css'

type Service = (typeof services)[number]

export function ServiceCard({ service, linked }: { service: Service; linked?: boolean }) {
  const body = (
    <>
      <span className={styles.serviceIcon}>
        <Icon name={service.icon} className={styles.serviceGlyph} />
      </span>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <span className={styles.price}>
        <span>
          от {rub(service.price)}
          <small>пример стоимости</small>
        </span>
        {linked ? <Icon name="arrow" className={styles.priceArrow} /> : null}
      </span>
    </>
  )
  if (!linked) {
    return (
      <article id={service.id} className={styles.serviceCard}>
        {body}
      </article>
    )
  }
  return (
    <Link className={styles.serviceCard} href={`/services#${service.id}`}>
      {body}
    </Link>
  )
}

export function ServiceGrid({ linked }: { linked?: boolean }) {
  return (
    <div className={styles.services}>
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} linked={linked} />
      ))}
    </div>
  )
}
