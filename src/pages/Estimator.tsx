import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FadeUp, ScaleIn } from '../components/Motion'
import { inr, short } from '../lib/money'

type Dur = 'half' | 'full' | 'two'
type EType = 'religious' | 'social' | 'corporate'
type Key = 'venue' | 'food' | 'decor' | 'photo' | 'comp' | 'team' | 'hotel' | 'travel' | 'gift'

const ORDER: Key[] = ['venue', 'food', 'decor', 'photo', 'comp', 'team', 'hotel', 'travel', 'gift']
const LBL: Record<Key, string> = {
  venue: 'Venue',
  food: 'Food catering',
  decor: 'Flowers & decoration',
  photo: 'Photo & video',
  comp: 'Compering',
  team: 'Team activities',
  hotel: 'Hotel booking',
  travel: 'Travel arrangements',
  gift: 'Return gifts',
}
const MIN: Record<string, number> = {
  venue: 15000,
  decor: 10000,
  photo: 10000,
  hotel: 0,
  travel: 0,
  gift: 0,
}
const ADJ: Key[] = ['venue', 'decor', 'photo', 'hotel', 'travel', 'gift']

export type EstimatePayload = {
  range: string
  g: number
  dur: string
  type: string
  list: string
}

export function Estimator() {
  const navigate = useNavigate()
  const [etype, setEtype] = useState<EType>('social')
  const [guests, setGuests] = useState(150)
  const [dur, setDur] = useState<Dur>('full')
  const [city, setCity] = useState(1)
  const [svc, setSvc] = useState({
    venue: true,
    food: true,
    photo: true,
    decor: true,
    comp: false,
    team: false,
    hotel: false,
    travel: false,
    gift: false,
  })
  const [opts, setOpts] = useState({
    food: 1100,
    photo: 45000,
    decor: 1,
    hotel: 6000,
    travel: 1200,
    gift: 350,
  })
  const [ov, setOv] = useState<Record<string, number | null>>({
    venue: null,
    decor: null,
    photo: null,
    hotel: null,
    travel: null,
    gift: null,
  })

  const result = useMemo(() => {
    const g = guests
    const dayF = { half: 0.6, full: 1, two: 1.8 }[dur]
    const meals = { half: 1, full: 2, two: 4 }[dur]
    const tm = { religious: 0.95, social: 1, corporate: 1.1 }[etype]
    const cm = city
    const m = tm * cm
    const amt: Partial<Record<Key, number>> = {}
    const rangeMeta: Record<string, { min: number; max: number; value: number; reset: boolean }> =
      {}

    function adjust(k: string, auto: number, top: number) {
      const mx = Math.max(top, Math.ceil(auto / 10000) * 10000, ov[k] || 0)
      const st = k === 'gift' ? 1000 : 5000
      const value = ov[k] !== null && ov[k] !== undefined ? ov[k]! : Math.max(MIN[k], Math.round(auto / st) * st)
      rangeMeta[k] = { min: MIN[k], max: mx, value, reset: ov[k] !== null }
      return ov[k] !== null && ov[k] !== undefined ? ov[k]! : auto
    }

    if (svc.venue) {
      const va = (40000 + g * 300) * dayF * m
      amt.venue = adjust('venue', va, Math.ceil((40000 + g * 300) * 1.8 * 1.5 * m / 10000) * 10000)
    }
    if (svc.food) {
      const plate = opts.food
      const perGuest =
        dur === 'half'
          ? ({ 700: 400, 1100: 600, 1700: 900 } as Record<number, number>)[plate]
          : plate * 0.6 * meals
      amt.food = g * perGuest * m
    }
    if (svc.decor) {
      const lv = opts.decor
      const base = [30000 + g * 150, 80000 + g * 350, 180000 + g * 700][lv]
      const da = base * ({ half: 0.8, full: 1, two: 1.5 }[dur]) * m
      amt.decor = adjust('decor', da, Math.ceil((180000 + g * 700) * 1.5 * m / 10000) * 10000)
    }
    if (svc.photo) {
      const pa = opts.photo * dayF * m
      amt.photo = adjust('photo', pa, Math.ceil(80000 * 1.8 * 1.5 * m / 10000) * 10000)
    }
    if (svc.comp) amt.comp = { half: 12000, full: 25000, two: 45000 }[dur] * m
    if (svc.team) amt.team = (20000 + g * 150) * dayF * m
    if (svc.hotel) {
      const rooms = Math.ceil((g * 0.3) / 2)
      const nights = { half: 1, full: 1, two: 2 }[dur]
      amt.hotel = adjust(
        'hotel',
        rooms * opts.hotel * nights * cm,
        Math.ceil(rooms * 10000 * 2 * 1.5 * cm / 10000) * 10000,
      )
    }
    if (svc.travel) {
      const trav = Math.ceil(g * 0.3)
      amt.travel = adjust(
        'travel',
        trav * opts.travel,
        Math.ceil(trav * 6500 * 1.5 / 10000) * 10000,
      )
    }
    if (svc.gift) {
      amt.gift = adjust('gift', g * opts.gift, Math.ceil(g * 750 * 1.5 / 10000) * 10000)
    }

    const keys = ORDER.filter((k) => amt[k] !== undefined)
    const sum = keys.reduce((a, k) => a + (amt[k] || 0), 0)
    const big = Math.max(...keys.map((k) => amt[k] || 0), 1)
    const lo = short(sum * 0.88)
    const hi = short(sum * 1.15)
    const payload: EstimatePayload | null = keys.length
      ? {
          range: lo + ' to ' + hi,
          g,
          dur: { half: 'half day', full: 'full day', two: 'two days' }[dur],
          type: etype,
          list: keys
            .map((k) => LBL[k] + (ov[k] != null ? ' (budget ' + inr(ov[k]!) + ')' : ''))
            .join(', '),
        }
      : null

    return { amt, keys, sum, big, lo, hi, rangeMeta, payload }
  }, [etype, guests, dur, city, svc, opts, ov])

  function toggle(k: keyof typeof svc) {
    setSvc((s) => ({ ...s, [k]: !s[k] }))
    if (ADJ.includes(k as Key)) setOv((o) => ({ ...o, [k]: null }))
  }

  function sendEnquiry() {
    if (!result.payload) return
    const T = result.payload.type.charAt(0).toUpperCase() + result.payload.type.slice(1)
    const msg =
      'Estimate from the spend estimator: ' +
      result.payload.range +
      ' for ' +
      result.payload.g +
      ' guests over a ' +
      result.payload.dur +
      '. Services: ' +
      result.payload.list +
      '.'
    sessionStorage.setItem('mm_enquiry', JSON.stringify({ type: T, msg }))
    navigate('/#connect')
  }

  return (
    <section id="estimator" className="band-blush">
        <div className="in">
          <FadeUp className="sec-head">
            <span className="eyebrow">Event spend estimator</span>
            <h2>See a realistic range before you call.</h2>
            <p className="lead">
              Choose what your event needs. The estimate updates as you go and can be sent to us with
              your enquiry.
            </p>
          </FadeUp>
          <div className="est">
            <FadeUp>
            <form className="panel" onSubmit={(e) => e.preventDefault()}>
              <fieldset className="fld">
                <legend>Event type</legend>
                <div className="chips">
                  {(
                    [
                      ['religious', 'Religious'],
                      ['social', 'Social'],
                      ['corporate', 'Corporate'],
                    ] as const
                  ).map(([v, label]) => (
                    <label className="chip" key={v}>
                      <input
                        type="radio"
                        name="etype"
                        checked={etype === v}
                        onChange={() => setEtype(v)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="fld">
                <label htmlFor="guests">Number of guests</label>
                <div className="rng">
                  <input
                    id="guests"
                    type="range"
                    min={20}
                    max={1000}
                    step={10}
                    value={guests}
                    onChange={(e) => setGuests(+e.target.value)}
                  />
                  <output htmlFor="guests">{guests}</output>
                </div>
              </div>
              <fieldset className="fld">
                <legend>Duration</legend>
                <div className="chips">
                  {(
                    [
                      ['half', 'Half day'],
                      ['full', 'Full day'],
                      ['two', 'Two days'],
                    ] as const
                  ).map(([v, label]) => (
                    <label className="chip" key={v}>
                      <input
                        type="radio"
                        name="dur"
                        checked={dur === v}
                        onChange={() => setDur(v)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="fld">
                <label htmlFor="city">City</label>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(+e.target.value)}
                >
                  <option value={1.15}>Metro city</option>
                  <option value={1}>Large city</option>
                  <option value={0.85}>Smaller town</option>
                </select>
              </div>
              <fieldset className="fld">
                <legend>Services</legend>
                <div className="svc-row">
                  <label className="tog">
                    <input type="checkbox" checked={svc.venue} onChange={() => toggle('venue')} />
                    Venue identification
                  </label>
                  <span className="note" style={{ color: 'var(--muted)' }}>
                    Hall or lawn
                  </span>
                </div>
                <div className="svc-row">
                  <label className="tog">
                    <input type="checkbox" checked={svc.food} onChange={() => toggle('food')} />
                    Food catering
                  </label>
                  <select
                    aria-label="Catering level"
                    disabled={!svc.food}
                    value={opts.food}
                    onChange={(e) => setOpts((o) => ({ ...o, food: +e.target.value }))}
                  >
                    <option value={700}>Standard</option>
                    <option value={1100}>Premium</option>
                    <option value={1700}>Luxury</option>
                  </select>
                </div>
                <div className="svc-row">
                  <label className="tog">
                    <input type="checkbox" checked={svc.photo} onChange={() => toggle('photo')} />
                    Photography &amp; videography
                  </label>
                  <select
                    aria-label="Photography and videography style"
                    disabled={!svc.photo}
                    value={opts.photo}
                    onChange={(e) => {
                      setOpts((o) => ({ ...o, photo: +e.target.value }))
                      setOv((o) => ({ ...o, photo: null }))
                    }}
                  >
                    <option value={22500}>Traditional</option>
                    <option value={45000}>Candid</option>
                    <option value={80000}>HD Movie</option>
                  </select>
                </div>
                <div className="svc-row">
                  <label className="tog">
                    <input type="checkbox" checked={svc.decor} onChange={() => toggle('decor')} />
                    Flowers &amp; decoration
                  </label>
                  <select
                    aria-label="Decor level"
                    disabled={!svc.decor}
                    value={opts.decor}
                    onChange={(e) => {
                      setOpts((o) => ({ ...o, decor: +e.target.value }))
                      setOv((o) => ({ ...o, decor: null }))
                    }}
                  >
                    <option value={0}>Simple</option>
                    <option value={1}>Elegant</option>
                    <option value={2}>Grand</option>
                  </select>
                </div>
                <div className="svc-row">
                  <label className="tog">
                    <input type="checkbox" checked={svc.comp} onChange={() => toggle('comp')} />
                    Compering
                  </label>
                  <span className="note" style={{ color: 'var(--muted)' }}>
                    One host
                  </span>
                </div>
                <div className="svc-row">
                  <label className="tog">
                    <input type="checkbox" checked={svc.team} onChange={() => toggle('team')} />
                    Team activities
                  </label>
                  <span className="note" style={{ color: 'var(--muted)' }}>
                    Facilitated
                  </span>
                </div>
                <div className="svc-row">
                  <label className="tog">
                    <input type="checkbox" checked={svc.hotel} onChange={() => toggle('hotel')} />
                    Hotel booking
                  </label>
                  <select
                    aria-label="Hotel category"
                    disabled={!svc.hotel}
                    value={opts.hotel}
                    onChange={(e) => {
                      setOpts((o) => ({ ...o, hotel: +e.target.value }))
                      setOv((o) => ({ ...o, hotel: null }))
                    }}
                  >
                    <option value={3500}>3-star</option>
                    <option value={6000}>4-star</option>
                    <option value={10000}>5-star</option>
                  </select>
                </div>
                <div className="svc-row">
                  <label className="tog">
                    <input type="checkbox" checked={svc.travel} onChange={() => toggle('travel')} />
                    Travel arrangements
                  </label>
                  <select
                    aria-label="Travel mode"
                    disabled={!svc.travel}
                    value={opts.travel}
                    onChange={(e) => {
                      setOpts((o) => ({ ...o, travel: +e.target.value }))
                      setOv((o) => ({ ...o, travel: null }))
                    }}
                  >
                    <option value={6500}>Flight</option>
                    <option value={1200}>Bus</option>
                    <option value={2000}>Group travel</option>
                  </select>
                </div>
                <div className="svc-row">
                  <label className="tog">
                    <input type="checkbox" checked={svc.gift} onChange={() => toggle('gift')} />
                    Return gifts
                  </label>
                  <select
                    aria-label="Gift level"
                    disabled={!svc.gift}
                    value={opts.gift}
                    onChange={(e) => {
                      setOpts((o) => ({ ...o, gift: +e.target.value }))
                      setOv((o) => ({ ...o, gift: null }))
                    }}
                  >
                    <option value={150}>Simple</option>
                    <option value={350}>Premium</option>
                    <option value={750}>Luxury</option>
                  </select>
                </div>
                <p className="fh">
                  Hotel assumes 30% of guests need rooms, two to a room, for each night. Travel
                  assumes 30% of guests travel. Gifts are priced per guest.
                </p>
              </fieldset>
            </form>
            </FadeUp>
            <ScaleIn delay={0.1}>
            <aside className="result" aria-live="polite">
              <span className="eyebrow">Estimated spend</span>
              <div className="total">
                {result.keys.length === 0 ? (
                  <>
                    Select a service
                    <small></small>
                  </>
                ) : (
                  <>
                    {result.lo} – {result.hi}
                    <small>
                      About {inr(Math.round(result.sum / guests / 100) * 100)} per guest, midpoint of
                      range
                    </small>
                  </>
                )}
              </div>
              <ul className="brk">
                {ORDER.map((k) => {
                  const val = result.amt[k]
                  if (val === undefined) return null
                  const meta = result.rangeMeta[k]
                  return (
                    <li key={k}>
                      <span>{LBL[k]}</span>
                      <b>{val < 100000 ? inr(Math.round(val / 1000) * 1000) : short(val)}</b>
                      <div className="meter">
                        <i style={{ width: Math.round((val / result.big) * 100) + '%' }}></i>
                      </div>
                      {meta && (
                        <div className="adj">
                          <label htmlFor={k + 'Range'}>
                            Adjust{' '}
                            {k === 'photo'
                              ? 'photography & videography'
                              : k === 'gift'
                                ? 'return gifts'
                                : k === 'decor'
                                  ? 'decoration'
                                  : k}{' '}
                            budget
                          </label>
                          <input
                            id={k + 'Range'}
                            type="range"
                            min={meta.min}
                            max={meta.max}
                            step={k === 'gift' ? 1000 : 5000}
                            value={meta.value}
                            onChange={(e) =>
                              setOv((o) => ({
                                ...o,
                                [k]: Math.max(MIN[k], +e.target.value),
                              }))
                            }
                          />
                          <div className="adj-row">
                            <span>Min {inr(meta.min)}</span>
                            {meta.reset && (
                              <button
                                type="button"
                                className="lk2"
                                onClick={() => setOv((o) => ({ ...o, [k]: null }))}
                              >
                                Reset to suggested
                              </button>
                            )}
                            <span>Max {inr(meta.max)}</span>
                          </div>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
              <p className="note">
                Planning figures to help you budget. Your final quote depends on the venue, menu,
                date and design you choose.
              </p>
              <button className="btn btn-gold" type="button" onClick={sendEnquiry}>
                Send this estimate with my enquiry
              </button>
            </aside>
            </ScaleIn>
          </div>
      </div>
    </section>
  )
}
