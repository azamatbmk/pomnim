import Link from 'next/link'
import { HomeArt } from './home-art'
import { Icon } from './icons'
import { ServiceGrid } from './service-card'
import styles from './site.module.css'

export default function HomePage() {
  return (
    <>
      <div className={styles.intro}>
        <div>
          <h1>Забота, которая рядом</h1>
          <p>Поможем сохранить порядок в месте, которое вам дорого.</p>
        </div>
        <span className={styles.place}>
          <Icon name="pin" />
          Северная Осетия
        </span>
      </div>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>Бережный уход на расстоянии</span>
          <h2>
            Память близко.
            <br />
            Даже когда вы далеко.
          </h2>
          <p>Найдите исполнителя для ухода за захоронением. Согласуйте работы и получите фотоотчёт.</p>
          <div className={styles.heroBottom}>
            <Link className={`${styles.btn} ${styles.primary}`} href="/services">
              Заказать уход
              <Icon name="arrow" />
            </Link>
            <small>С уважением к вашей семье</small>
          </div>
        </div>
        <HomeArt className={styles.heroArt} />
      </section>
      <div className={styles.trust}>
        <span>
          <Icon name="list" />
          Стоимость согласуется заранее
        </span>
        <span>
          <Icon name="camera" />
          Фото до и после работ
        </span>
        <span>
          <Icon name="check" />
          Приёмка заказчиком
        </span>
      </div>
      <div className={styles.head}>
        <h2>Чем мы можем помочь</h2>
        <Link className={styles.link} href="/services">
          Все услуги
          <Icon name="arrow" />
        </Link>
      </div>
      <ServiceGrid linked />
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Спокойствие в три шага</h2>
          <Icon name="leaf" />
        </div>
        <div className={styles.steps}>
          <div>
            <b>01</b>
            <span>
              Расскажите,
              <br />
              что нужно сделать
            </span>
          </div>
          <div>
            <b>02</b>
            <span>
              Согласуйте цену
              <br />с исполнителем
            </span>
          </div>
          <div>
            <b>03</b>
            <span>
              Посмотрите фото
              <br />и примите работу
            </span>
          </div>
        </div>
      </section>
      <p className={styles.disclaimer}>Цены на сайте — примеры. Стоимость называет исполнитель, когда видит задачу.</p>
    </>
  )
}
