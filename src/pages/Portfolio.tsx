import { motion } from 'framer-motion'
import { FadeUp } from '../components/Motion'
import { PortfolioStage } from '../components/PortfolioStage'

const DECOR_PORTFOLIO = 'https://decor-omega-six.vercel.app/'

export function Portfolio() {
  return (
    <section id="portfolio" className="band-blush">
      <div className="in">
        <FadeUp className="portfolio-row">
          <div className="sec-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">Our portfolio</span>
            <h2>See how we dress a celebration.</h2>
            <p className="lead">
              Décor photos from marriages, birthdays, sangeet nights and naming ceremonies — stages,
              entrances and spaces styled for the day.
            </p>
            <div className="hero-types" aria-label="Portfolio event types" style={{ marginTop: 6 }}>
              <span>Marriage</span>
              <span>Birthday</span>
              <span>Sangeet</span>
              <span>Naming ceremony</span>
            </div>
            <motion.a
              className="btn btn-wine"
              href={DECOR_PORTFOLIO}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginTop: 22, alignSelf: 'flex-start' }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            >
              View décor portfolio
            </motion.a>
          </div>
          <PortfolioStage />
        </FadeUp>
      </div>
    </section>
  )
}
