'use client'

import { formatPhone, normalizePhone, type Worker } from '@pomnim/shared'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { apiFetch, readError } from './api'
import { BrandMark } from './brand-mark'
import styles from './admin.module.css'

export function AdminScreen() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [area, setArea] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    let ignore = false
    async function load() {
      const me = await apiFetch('/auth/me')
      if (me.status === 401) {
        router.replace('/admin/login')
        return
      }
      const list = await apiFetch('/workers')
      if (!list.ok) {
        router.replace('/admin/login')
        return
      }
      const data = (await list.json()) as Worker[]
      if (!ignore) {
        setWorkers(data)
        setReady(true)
      }
    }
    void load()
    return () => {
      ignore = true
    }
  }, [router])

  async function logout() {
    await apiFetch('/auth/logout', { method: 'POST' })
    router.replace('/admin/login')
  }

  async function addWorker(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    const response = await apiFetch('/workers', {
      method: 'POST',
      body: JSON.stringify({ name, phone, area }),
    })
    setPending(false)
    if (!response.ok) {
      setError(await readError(response))
      return
    }
    const created = (await response.json()) as Worker
    setWorkers((current) => [created, ...current])
    setName('')
    setPhone('')
    setArea('')
  }

  async function toggle(worker: Worker) {
    const action = worker.disabledAt ? 'enable' : 'disable'
    const response = await apiFetch(`/workers/${worker.id}/${action}`, { method: 'POST' })
    if (!response.ok) {
      setError(await readError(response))
      return
    }
    const updated = (await response.json()) as Worker
    setWorkers((current) => current.map((item) => (item.id === updated.id ? updated : item)))
  }

  const canAdd = name.trim().length > 0 && area.trim().length > 0 && normalizePhone(phone) !== null

  if (!ready) return <main className={styles.shell} />

  return (
    <main className={styles.shell}>
      <div className={styles.window}>
        <header className={styles.top}>
          <div className={styles.brand}>
            <BrandMark className={styles.symbol} />
            <div>
              <strong>помним</strong>
              <span className={styles.caption}>Админка владельца</span>
            </div>
          </div>
          <button className={styles.quiet} type="button" onClick={() => void logout()}>Выйти</button>
        </header>
        <div className={styles.body}>
          <section>
            <h1>Исполнители</h1>
            <p className={styles.lead}>Людей сюда добавляете вы. Сами они зарегистрироваться не могут.</p>
            {workers.length === 0 ? (
              <p className={styles.empty}>Пока никого. Добавьте человека, с которым договорились.</p>
            ) : workers.map((worker) => (
              <article className={worker.disabledAt ? `${styles.person} ${styles.off}` : styles.person} key={worker.id}>
                <div>
                  <h2>{worker.name}</h2>
                  <p>{formatPhone(worker.phone)}</p>
                  <p>{worker.area}</p>
                </div>
                <button className={styles.offButton} type="button" onClick={() => void toggle(worker)}>
                  {worker.disabledAt ? 'Включить' : 'Отключить'}
                </button>
              </article>
            ))}
          </section>
          <form className={styles.panel} onSubmit={(event) => void addWorker(event)}>
            <h2>Новый исполнитель</h2>
            <p className={styles.help}>Имени и телефона достаточно, чтобы пустить человека в приложение.</p>
            <label htmlFor="name">Имя</label>
            <input id="name" maxLength={80} value={name} placeholder="Как его увидит заказчик" onChange={(event) => setName(event.target.value)} required />
            <label htmlFor="phone">Телефон</label>
            <input id="phone" type="tel" inputMode="tel" value={phone} placeholder="+7 900 000-00-00" onChange={(event) => setPhone(event.target.value)} required />
            <label htmlFor="area">Где берёт работу</label>
            <textarea id="area" maxLength={200} value={area} placeholder="Владикавказ, Городское кладбище" onChange={(event) => setArea(event.target.value)} required />
            <p className={styles.fieldHelp}>Город и кладбище, куда человек ездит на заказы.</p>
            {error ? <p className={styles.error}>{error}</p> : null}
            <button className={styles.btn} type="submit" disabled={!canAdd || pending}>Добавить</button>
          </form>
        </div>
      </div>
    </main>
  )
}
