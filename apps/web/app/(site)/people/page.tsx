import type { Metadata } from 'next'
import Link from 'next/link'
import { people } from '../data'
import { Icon } from '../icons'
import styles from '../site.module.css'

export const metadata: Metadata = { title: 'Исполнители' }

export default function PeoplePage() {
  return (
    <>
      <h1 className={styles.pageTitle}>Люди, которым можно доверить заботу</h1>
      <p className={styles.lead}>
        Так могут выглядеть профили исполнителей. В рабочей версии здесь будут подтверждённые сведения, примеры работ и отзывы по выполненным заказам.
      </p>
      <div className={styles.people}>
        {people.map((person) => (
          <article className={styles.person} key={person.id}>
            <div className={styles.avatar}>{person.id}</div>
            <div>
              <span className={styles.badge}>Пример профиля</span>
              <h2>Исполнитель {person.id}</h2>
              <small className={styles.muted}>{person.area}</small>
            </div>
            <p>{person.work}</p>
            <div className={styles.tags}>
              {person.tags.map((tag) => (
                <span className={styles.tag} key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <Link className={`${styles.btn} ${styles.secondary}`} href={`/people/${person.id}`}>
              Посмотреть профиль
              <Icon name="arrow" />
            </Link>
          </article>
        ))}
      </div>
      <div className={styles.callout}>Это вымышленные профили, а не действующие исполнители.</div>
    </>
  )
}
