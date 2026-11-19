import { Link } from 'react-router-dom'
import { FadeUp, Stagger, StaggerItem, Tilt3D } from '../components/Motion'

const PKGS = [
  {
    size: 'Essential · up to 100 guests',
    title: 'Intimate gatherings',
    items: [
      'Three venue options shortlisted',
      'Standard menu with service staff',
      'Floral entrance and stage decor',
      'One photographer',
    ],
    cta: 'Connect with us',
    cls: '',
    btn: 'btn btn-wine',
  },
  {
    size: 'Signature · up to 250 guests',
    title: 'The complete event',
    badge: 'Most chosen',
    items: [
      'Venue sourcing and booking support',
      'Curated menu with tasting',
      'Themed flowers and stage decor',
      'Photo and video team',
      'Compere and one team activity',
    ],
    cta: 'Connect with us',
    cls: 'feat',
    btn: 'btn btn-deep',
  },
  {
    size: 'Grand · 250+ guests',
    title: 'Multi-day celebrations',
    items: [
      'Full planning and on-site team',
      'Premium catering across meals',
      'Cinematic film and drone coverage',
      'Custom installations and lighting',
      'Compere, performers and activities',
    ],
    cta: 'Connect with us',
    cls: '',
    btn: 'btn btn-wine',
  },
  {
    size: 'Customised',
    title: 'Built around you',
    items: [
      'Pick only the services you need',
      'Mix packages across event days',
      'Special rituals, themes and menus',
      'Corporate briefs and branding',
    ],
    cta: 'Share your requirement',
    cls: 'custom',
    btn: 'btn btn-wine',
  },
]

export function Packages() {
  return (
    <section id="packages">
      <div className="in">
        <FadeUp className="sec-head">
          <span className="eyebrow">Standard packages and custom plans</span>
          <h2>Start with a package. Change anything.</h2>
          <p className="lead">
            Our packages are starting points, sized by guest count. Add, remove or swap services
            until the plan fits your event.
          </p>
        </FadeUp>
        <Stagger className="pk" stagger={0.1}>
          {PKGS.map((p) => (
            <StaggerItem key={p.title} hover={false}>
              <Tilt3D className={`pkg ${p.cls}`.trim()} max={7}>
                {p.badge && <span className="badge">{p.badge}</span>}
                <span className="size">{p.size}</span>
                <h3>{p.title}</h3>
                <ul>
                  {p.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
                <Link className={p.btn} to="/#connect">
                  {p.cta}
                </Link>
              </Tilt3D>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
