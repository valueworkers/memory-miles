import { Link } from 'react-router-dom'
import { FadeUp } from '../components/Motion'
import { PortfolioStage } from '../components/PortfolioStage'
import { PORTFOLIO_CATEGORIES } from '../lib/portfolio'

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
            <nav className="portfolio-categories" aria-label="Browse portfolio by event">
              {PORTFOLIO_CATEGORIES.map((category) => (
                <Link
                  className="portfolio-category"
                  key={category.slug}
                  to={`/portfolio/${category.slug}`}
                >
                  {category.label}
                </Link>
              ))}
            </nav>
          </div>
          <PortfolioStage />
        </FadeUp>
      </div>
    </section>
  )
}
