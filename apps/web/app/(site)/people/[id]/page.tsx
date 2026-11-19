import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { people, personById } from '../../data'
import { Icon } from '../../icons'
import styles from '../../site.module.css'

type ProfilePageProps = {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return people.map((person) => ({ id: person.id }))
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { id } = await params
  const person = personById(id)
  if (!person) return { title: 'Исполнитель' }
  return { title: `Исполнитель ${person.id}` }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { id } = await params
  const person = personById(id)
  if (!person) notFound()
  return (
    <article className={styles.profile}>
      <Link className={`${styles.link} ${styles.back}`} href="/people">
        <Icon name="arrow" />
        Все исполнители
      </Link>
      <div className={styles.avatar}>{person.id}</div>
      <span className={styles.badge}>Вымышленный профиль</span>
      <h2>Исполнитель {person.id}</h2>
      <p className={styles.muted}>{person.area}</p>
      <p>{person.work}</p>
      <p>В рабочей версии здесь планируются портфолио, подтверждение личности, перечень услуг и отзывы по реальным заказам.</p>
      <div className={styles.callout}>У этого профиля нет отзывов, рейтинга и контактов. Это пример, а не человек, которому можно написать.</div>
    </article>
  )
}
