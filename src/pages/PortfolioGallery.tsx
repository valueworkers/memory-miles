import { Link, Navigate, useParams } from 'react-router-dom'
import { PORTFOLIO_CATEGORIES } from '../lib/portfolio'

export function PortfolioGallery() {
  const { category: categorySlug } = useParams()
  const category = PORTFOLIO_CATEGORIES.find((item) => item.slug === categorySlug)

  if (!category) return <Navigate to="/#portfolio" replace />

  return (
    <main className="portfolio-gallery band-blush">
      <div className="in">
        <div className="portfolio-gallery-head">
          <Link className="portfolio-back" to="/#portfolio">
            ← All portfolio categories
          </Link>
          <span className="eyebrow">Our portfolio</span>
          <h1>{category.label}</h1>
          <p className="lead">
            A selection of {category.label.toLowerCase()} celebrations styled by our team.
          </p>
        </div>
        <div className="portfolio-gallery-grid" aria-label={`${category.label} photo gallery`}>
          {category.images.map((image, index) => (
            <figure className="portfolio-gallery-item" key={image}>
              <img
                src={image}
                alt={`${category.label} celebration ${index + 1}`}
                loading="lazy"
                decoding="async"
              />
            </figure>
          ))}
        </div>
      </div>
    </main>
  )
}
