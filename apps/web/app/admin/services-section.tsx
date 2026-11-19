'use client'

import { formatRubles, readCatalog, readCatalogService, serviceIcons, type CatalogService } from '@pomnim/shared'
import { useEffect, useState } from 'react'
import { apiFetch, readError } from './api'
import { ServiceGlyph } from './service-glyph'
import styles from './admin.module.css'

const empty = { title: '', description: '', price: '', icon: '' }

export function ServicesSection() {
  const [services, setServices] = useState<CatalogService[]>([])
  const [draft, setDraft] = useState(empty)
  const [editing, setEditing] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [pending, setPending] = useState(false)
  const amount = money(draft.price)
  const ready = draft.title.trim().length > 0 && draft.description.trim().length > 0 && amount !== null

  useEffect(() => {
    let ignore = false
    async function load() {
      const response = await apiFetch('/services')
      if (!response.ok) {
        if (!ignore) setError('Не получилось загрузить услуги')
        return
      }
      const services = readCatalog(await response.json())
      if (!ignore) {
        if (!services) {
          setError('Не получилось загрузить услуги')
          return
        }
        setServices(services)
        setLoaded(true)
      }
    }
    void load()
    return () => {
      ignore = true
    }
  }, [])

  function edit(service: CatalogService) {
    setError('')
    setEditing(service.id)
    setDraft({
      title: service.title,
      description: service.description,
      price: String(service.price),
      icon: service.icon ?? '',
    })
  }

  function reset() {
    setEditing(null)
    setDraft(empty)
  }

  async function save(event: React.FormEvent) {
    event.preventDefault()
    if (!ready || amount == null || pending) return
    setPending(true)
    setError('')
    const body = {
      title: draft.title.trim(),
      description: draft.description.trim(),
      price: amount,
      icon: draft.icon || null,
    }
    const response = await apiFetch(editing ? `/services/${encodeURIComponent(editing)}` : '/services', {
      method: editing ? 'PATCH' : 'POST',
      body: JSON.stringify(body),
    })
    setPending(false)
    if (!response.ok) {
      setError(await readError(response))
      return
    }
    const saved = readCatalogService(await response.json())
    if (!saved) {
      setError('Не получилось сохранить услугу')
      return
    }
    setServices((current) => (editing ? current.map((item) => (item.id === saved.id ? saved : item)) : [...current, saved]))
    reset()
  }

  async function remove(service: CatalogService) {
    if (pending) return
    if (!window.confirm(`Удалить «${service.title}»? С сайта и из новых заявок она пропадёт.`)) return
    setPending(true)
    setError('')
    const response = await apiFetch(`/services/${encodeURIComponent(service.id)}`, { method: 'DELETE' })
    setPending(false)
    if (!response.ok) {
      setError(await readError(response))
      return
    }
    setServices((current) => current.filter((item) => item.id !== service.id))
    if (editing === service.id) reset()
  }

  return (
    <section className={styles.servicesBlock}>
      <div>
        <h1>Услуги</h1>
        <p className={styles.lead}>Название, описание, цена и иконка. Их видят сайт и семья. «Другое» остаётся в заявке отдельно: сумму там называет заказчик.</p>
        {loaded && services.length === 0 ? <p className={styles.empty}>Пока нет услуг. Добавьте первую.</p> : null}
        {services.map((service) => (
          <article className={styles.person} key={service.id}>
            <div>
              <h2>
                {service.icon ? <ServiceGlyph name={service.icon} /> : null}
                {service.title}
              </h2>
              <p>{formatRubles(service.price)}</p>
              <p>{service.description}</p>
            </div>
            <div className={styles.actions}>
              <button className={styles.quiet} type="button" onClick={() => edit(service)}>Изменить</button>
              <button className={styles.offButton} type="button" onClick={() => void remove(service)}>Удалить</button>
            </div>
          </article>
        ))}
      </div>
      <form className={styles.panel} onSubmit={(event) => void save(event)}>
        <h2>{editing ? 'Изменить услугу' : 'Новая услуга'}</h2>
        <label htmlFor="service-title">Название</label>
        <input id="service-title" maxLength={80} value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required />
        <label htmlFor="service-description">Описание</label>
        <textarea id="service-description" maxLength={400} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} required />
        <label htmlFor="service-price">Цена, ₽</label>
        <input
          id="service-price"
          inputMode="numeric"
          maxLength={7}
          value={draft.price}
          onChange={(event) => setDraft({ ...draft, price: event.target.value.replace(/\D/g, '').slice(0, 7) })}
          required
        />
        <span className={styles.iconLabel}>Иконка</span>
        <div className={styles.icons}>
          <button className={draft.icon === '' ? `${styles.iconButton} ${styles.iconButtonOn}` : styles.iconButton} type="button" onClick={() => setDraft({ ...draft, icon: '' })}>
            Нет
          </button>
          {serviceIcons.map((icon) => (
            <button
              key={icon}
              className={draft.icon === icon ? `${styles.iconButton} ${styles.iconButtonOn}` : styles.iconButton}
              type="button"
              aria-label={icon}
              aria-pressed={draft.icon === icon}
              onClick={() => setDraft({ ...draft, icon })}
            >
              <ServiceGlyph name={icon} />
            </button>
          ))}
        </div>
        {error ? <p className={styles.error}>{error}</p> : null}
        <button className={styles.btn} type="submit" disabled={!ready || pending}>{pending ? 'Сохраняем' : editing ? 'Сохранить' : 'Добавить'}</button>
        {editing ? (
          <button className={styles.quiet} type="button" onClick={reset}>Отмена</button>
        ) : null}
      </form>
    </section>
  )
}

function money(value: string) {
  if (!/^\d+$/.test(value)) return null
  const amount = Number(value)
  if (!Number.isInteger(amount) || amount < 1 || amount > 1000000) return null
  return amount
}
