import { BrandMark } from './admin/brand-mark'
import { HomeArt } from './home-art'
import styles from './home.module.css'

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <BrandMark className={styles.symbol} />
          <div>
            <strong>помним</strong>
            <span>забота о памяти</span>
          </div>
        </div>
        <h1>
          Память близко.
          <br />
          Даже когда вы далеко.
        </h1>
        <p className={styles.lead}>
          Семья описывает, что нужно сделать. Исполнитель предлагает объём и сумму. После работы присылает фото.
        </p>
      </div>
      <HomeArt />
    </main>
  )
}
