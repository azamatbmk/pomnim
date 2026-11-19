import Link from 'next/link'
import { rub } from './data'
import { Icon } from './icons'
import { fallbackServices, liveServices, type PublicService } from './catalog'
import styles from './site.module.css'

export function ServiceCard({ service, linked }: { service: PublicService; linked?: boolean }) {
  const body = (
    <>
      {service.icon ? (
        <span className={styles.serviceIcon}>
          <Icon name={service.icon} className={styles.serviceGlyph} />
        </span>
      ) : null}
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <span className={styles.price}>
        <span>{rub(service.price)}</span>
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

export async function ServiceGrid({ linked }: { linked?: boolean }) {
  const list = (await liveServices()) ?? fallbackServices()
  return (
    <div className={styles.services}>
      {list.map((service) => (
        <ServiceCard key={service.id} service={service} linked={linked} />
      ))}
    </div>
  )
}
