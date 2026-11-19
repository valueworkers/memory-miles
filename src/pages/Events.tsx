import { FadeUp, Stagger, StaggerItem } from '../components/Motion'

const TYPES = [
  {
    title: 'Religious',
    body: 'Ceremonies that need the right timings, the right setting and a calm hand behind the scenes.',
    items: ['Pujas and homams', 'Satsangs and kirtans', 'Naming and thread ceremonies', 'Festival gatherings'],
  },
  {
    title: 'Social',
    body: 'Family celebrations where every relative is looked after and every moment is photographed.',
    items: ['Weddings and receptions', 'Engagements and sangeet', 'Birthdays and baby showers', 'Anniversaries and reunions'],
  },
  {
    title: 'Corporate',
    body: 'Events that run on schedule, reflect your brand and give people a reason to talk about them.',
    items: ['Offsites and retreats', 'Conferences and launches', 'Annual days and award nights', 'Team-building days'],
  },
]

export function Events() {
  return (
    <section id="events" className="band-wine">
      <div className="in">
        <FadeUp className="sec-head">
          <span className="eyebrow">Events we plan</span>
          <h2>Different occasions, the same care.</h2>
          <p className="lead">
            Each kind of event has its own rhythm, rituals and guest list. We plan around yours.
          </p>
        </FadeUp>
        <Stagger className="types" stagger={0.12}>
          {TYPES.map((t) => (
            <StaggerItem className="type" key={t.title}>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
              <ul>
                {t.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
