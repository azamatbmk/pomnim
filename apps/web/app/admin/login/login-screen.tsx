'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { apiFetch, readError } from '../api'
import { BrandMark } from '../brand-mark'
import styles from './login.module.css'

export function LoginScreen() {
  const router = useRouter()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login, password }),
    })
    setPending(false)
    if (!response.ok) {
      setError(await readError(response))
      return
    }
    router.push('/admin')
    router.refresh()
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={onSubmit}>
        <div className={styles.brand}>
          <BrandMark className={styles.symbol} />
          <div>
            <strong>помним</strong>
            <span className={styles.caption}>Админка владельца</span>
          </div>
        </div>
        <h1>Вход</h1>
        <p className={styles.lead}>Сюда входите только вы.</p>
        <label htmlFor="login">Логин</label>
        <input id="login" value={login} autoComplete="username" onChange={(event) => setLogin(event.target.value)} required />
        <label htmlFor="password">Пароль</label>
        <input id="password" type="password" value={password} autoComplete="current-password" onChange={(event) => setPassword(event.target.value)} required />
        {error ? <p className={styles.error}>{error}</p> : null}
        <button className={styles.btn} type="submit" disabled={pending || !login.trim() || !password}>Войти</button>
      </form>
    </main>
  )
}
