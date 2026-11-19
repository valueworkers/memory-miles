import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { IcoClock, IcoPlane, IcoRoute } from '../components/Icons'
import { FadeUp, Stagger, StaggerItem } from '../components/Motion'
import { WA_URL } from '../lib/money'

const TX: Record<string, { h: number; c: string[]; n: string }> = {
  pickup: { h: 4, c: ['Bengaluru', 'Delhi'], n: 'Airport pickup' },
  drop: { h: 4, c: ['Bengaluru', 'Delhi'], n: 'Airport drop' },
  intercity: { h: 24, c: ['Bengaluru'], n: 'Intercity' },
  hourly: { h: 24, c: ['Bengaluru'], n: 'Hourly package' },
}

const AIRPORT: Record<string, string> = {
  Bengaluru: 'Kempegowda International Airport (BLR)',
  Delhi: 'Indira Gandhi International Airport (DEL)',
}

type TType = 'pickup' | 'drop' | 'intercity' | 'hourly'

function istStr(ms: number) {
  const p: Record<string, string> = {}
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(new Date(ms))
    .forEach((x) => {
      p[x.type] = x.value
    })
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`
}

function earliest(h: number) {
  return Math.ceil((Date.now() + h * 3600000) / 60000) * 60000
}

function istMs(v: string) {
  return new Date(v + ':00+05:30').getTime()
}

function pretty(ms: number) {
  return new Date(ms).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function Taxi() {
  const [type, setType] = useState<TType>('pickup')
  const [city, setCity] = useState('Bengaluru')
  const [dt, setDt] = useState('')
  const [addr, setAddr] = useState('')
  const [flight, setFlight] = useState('')
  const [dest, setDest] = useState('')
  const [trip, setTrip] = useState<'oneway' | 'round'>('oneway')
  const [ret, setRet] = useState('')
  const [hours, setHours] = useState('8 hours')
  const [veh, setVeh] = useState('Sedan')
  const [pax, setPax] = useState('2')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [alt, setAlt] = useState('')
  const [note, setNote] = useState('')
  const [errs, setErrs] = useState<string[]>([])
  const [summary, setSummary] = useState('')
  const [waHref, setWaHref] = useState(WA_URL)
  const [copyLabel, setCopyLabel] = useState('Copy request')

  const t = TX[type]
  const air = type === 'pickup' || type === 'drop'
  const ic = type === 'intercity'
  const rt = ic && trip === 'round'
  const minMs = earliest(t.h)
  const minStr = istStr(minMs)

  useEffect(() => {
    if (!t.c.includes(city)) setCity(t.c[0])
  }, [type, t.c, city])

  const hint = useMemo(() => {
    return (
      'Earliest slot: ' +
      pretty(minMs) +
      ' IST, ' +
      t.h +
      ' hours from now.' +
      (t.c.length === 1 ? ' This service is available in Bengaluru only.' : '') +
      (air ? ' Airport: ' + AIRPORT[city] + '.' : '')
    )
  }, [minMs, t.h, t.c.length, air, city])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: string[] = []
    const phoneClean = phone.replace(/[\s\-()]/g, '')
    const altClean = alt.replace(/[\s\-()]/g, '')
    const paxN = parseInt(pax, 10)

    if (!t.c.includes(city)) next.push(t.n + ' is available in Bengaluru only.')
    if (!dt || isNaN(istMs(dt))) next.push('Choose a date and time.')
    else if (istMs(dt) < minMs)
      next.push(
        'Choose a time at least ' +
          t.h +
          ' hours from now. The earliest slot is ' +
          pretty(minMs) +
          ' IST.',
      )
    if (!addr.trim())
      next.push(type === 'pickup' ? 'Enter your drop-off address.' : 'Enter your pickup address.')
    if (ic && !dest.trim()) next.push('Enter your destination city.')
    if (rt) {
      if (!ret || isNaN(istMs(ret))) next.push('Choose a return date and time.')
      else if (dt && istMs(ret) <= istMs(dt))
        next.push('The return time must be after the departure time.')
    }
    if (!(paxN >= 1 && paxN <= 12)) next.push('Enter between 1 and 12 passengers.')
    if (!name.trim()) next.push('Enter your name.')
    if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(phoneClean))
      next.push('Enter a valid 10-digit mobile number.')
    if (altClean) {
      if (!/^(\+91|91|0)?[6-9]\d{9}$/.test(altClean))
        next.push('Enter a valid 10-digit alternate contact number, or leave it blank.')
      else if (altClean.slice(-10) === phoneClean.slice(-10))
        next.push('The alternate contact number should be different from your phone number.')
    }

    if (next.length) {
      setErrs(next)
      setSummary('')
      return
    }

    setErrs([])
    const L = [
      'Service: ' + t.n,
      'City: ' + city,
      'Date and time (IST): ' + pretty(istMs(dt)),
      (type === 'pickup' ? 'Drop-off address: ' : 'Pickup address: ') + addr.trim(),
    ]
    if (air) {
      L.push('Airport: ' + AIRPORT[city])
      if (flight.trim()) L.push('Flight: ' + flight.trim())
    }
    if (ic) {
      L.push('Destination: ' + dest.trim())
      L.push('Trip: ' + (rt ? 'Round trip' : 'One-way'))
      if (rt) L.push('Return (IST): ' + pretty(istMs(ret)))
    }
    if (type === 'hourly') L.push('Package: ' + hours)
    L.push('Vehicle: ' + veh, 'Passengers: ' + paxN, 'Name: ' + name.trim(), 'Phone: ' + phoneClean)
    if (altClean) L.push('Alternate contact: ' + altClean)
    if (note.trim()) L.push('Notes: ' + note.trim())

    const text = L.join('\n')
    setSummary(text)
    setWaHref(
      WA_URL +
        '?text=' +
        encodeURIComponent('Hello Memories & Miles, I would like to book a taxi.\n' + text),
    )
  }

  function copy() {
    const done = (m: string) => {
      setCopyLabel(m)
      setTimeout(() => setCopyLabel('Copy request'), 2000)
    }
    try {
      navigator.clipboard.writeText(summary).then(
        () => done('Copied'),
        () => done('Selected. Press copy'),
      )
    } catch {
      done('Selected. Press copy')
    }
  }

  return (
    <section id="taxi">
      <div className="in">
          <FadeUp className="sec-head">
            <span className="eyebrow">Taxi services</span>
            <h2>Getting there matters too.</h2>
            <p className="lead">
              Book a car with a driver for your own travel or for your event guests. Three simple
              ways to ride with us.
            </p>
          </FadeUp>
          <Stagger className="grid-3">
            <StaggerItem as="article" className="svc">
              <div className="ico">
                <IcoPlane />
              </div>
              <h3>Airport pickup &amp; drop</h3>
              <p>
                Timely transfers to and from the airport for you, your family or your event guests,
                planned around flight timings.
              </p>
              <ul>
                <li>Pickup</li>
                <li>Drop</li>
                <li>Guest transfers</li>
              </ul>
            </StaggerItem>
            <StaggerItem as="article" className="svc">
              <div className="ico">
                <IcoRoute />
              </div>
              <h3>Intercity</h3>
              <p>
                Comfortable one-way and round-trip rides between cities, for weddings, family visits
                and business travel.
              </p>
              <ul>
                <li>One-way</li>
                <li>Round trip</li>
                <li>Outstation</li>
              </ul>
            </StaggerItem>
            <StaggerItem as="article" className="svc">
              <div className="ico">
                <IcoClock />
              </div>
              <h3>Hourly packages</h3>
              <p>
                Keep a car and driver with you by the hour for city errands, event-day running around
                or guest shuttles.
              </p>
              <ul>
                <li>City use</li>
                <li>Event shuttles</li>
                <li>Flexible hours</li>
              </ul>
            </StaggerItem>
          </Stagger>
          <div className="cta-row" style={{ marginTop: 32 }}>
            <a className="btn btn-wine" href="#book-taxi">
              Book a taxi
            </a>
            <a className="btn btn-line" href="#taxi-rates">
              View rates
            </a>
          </div>

          <div className="rates" id="taxi-rates">
            <FadeUp className="sec-head">
              <span className="eyebrow">Indicative rates</span>
              <h2>Local use and outstation.</h2>
              <p className="lead">
                Starting packages for city use and outstation travel. Tolls, permits and parking are
                extra where they apply.
              </p>
            </FadeUp>

            <FadeUp>
              <h3 className="rates-group">For local use</h3>
              <Stagger className="rates-grid">
                <StaggerItem className="rate-card">
                  <span className="size">Sedan</span>
                  <ul>
                    <li>
                      <span>8 hrs / 80 km</span>
                      <b>₹2,400</b>
                    </li>
                    <li>
                      <span>12 hrs / 120 km</span>
                      <b>₹3,500</b>
                    </li>
                    <li>
                      <span>Extra km</span>
                      <b>₹15</b>
                    </li>
                    <li>
                      <span>Extra hour</span>
                      <b>₹180</b>
                    </li>
                  </ul>
                </StaggerItem>
                <StaggerItem className="rate-card">
                  <span className="size">Ertiga or Rumion</span>
                  <ul>
                    <li>
                      <span>8 hrs / 80 km</span>
                      <b>₹3,500</b>
                    </li>
                    <li>
                      <span>12 hrs / 120 km</span>
                      <b>₹4,800</b>
                    </li>
                    <li>
                      <span>Extra km</span>
                      <b>₹18</b>
                    </li>
                    <li>
                      <span>Extra hour</span>
                      <b>₹200</b>
                    </li>
                  </ul>
                </StaggerItem>
              </Stagger>
            </FadeUp>

            <FadeUp delay={0.08}>
              <h3 className="rates-group">Outstation</h3>
              <Stagger className="rates-grid">
                <StaggerItem className="rate-card">
                  <span className="size">Sedan / Etios</span>
                  <ul>
                    <li>
                      <span>Per km</span>
                      <b>₹14</b>
                    </li>
                    <li>
                      <span>Driver bata</span>
                      <b>₹400</b>
                    </li>
                    <li>
                      <span>Per day minimum</span>
                      <b>300 km</b>
                    </li>
                  </ul>
                  <p className="fh">Toll, permit and parking extra.</p>
                </StaggerItem>
                <StaggerItem className="rate-card">
                  <span className="size">Ertiga or Rumion</span>
                  <ul>
                    <li>
                      <span>Per km</span>
                      <b>₹17</b>
                    </li>
                    <li>
                      <span>Driver bata</span>
                      <b>₹500</b>
                    </li>
                    <li>
                      <span>Per day minimum</span>
                      <b>300 km</b>
                    </li>
                  </ul>
                  <p className="fh">Toll, permit and parking extra.</p>
                </StaggerItem>
              </Stagger>
            </FadeUp>
          </div>

          <div className="tb" id="book-taxi">
            <div>
              <span className="eyebrow">Book a taxi</span>
              <h2 style={{ marginTop: 14 }}>Reserve your ride.</h2>
              <p className="lead" style={{ marginTop: 16 }}>
                Tell us where and when. We confirm your booking with you on WhatsApp.
              </p>
              <ul className="rules">
                <li>
                  <b>Airport pickup &amp; drop</b>Bengaluru and Delhi. Book at least 4 hours before
                  the trip.
                </li>
                <li>
                  <b>Intercity</b>Bengaluru only. Book at least 24 hours before the trip.
                </li>
                <li>
                  <b>Hourly packages</b>Bengaluru only. Book at least 24 hours before the trip.
                </li>
              </ul>
            </div>
            <form className="panel" noValidate onSubmit={onSubmit}>
              <div className="frm">
                <fieldset className="full tfs">
                  <legend>Service</legend>
                  <div className="chips">
                    {(
                      [
                        ['pickup', 'Airport pickup'],
                        ['drop', 'Airport drop'],
                        ['intercity', 'Intercity'],
                        ['hourly', 'Hourly package'],
                      ] as const
                    ).map(([v, label]) => (
                      <label className="chip" key={v}>
                        <input
                          type="radio"
                          name="ttype"
                          value={v}
                          checked={type === v}
                          onChange={() => setType(v)}
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label htmlFor="tb_city">
                  City
                  <select id="tb_city" value={city} onChange={(e) => setCity(e.target.value)}>
                    {t.c.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label htmlFor="tb_dt">
                  Date and time (IST)
                  <input
                    id="tb_dt"
                    type="datetime-local"
                    min={minStr}
                    value={dt}
                    onChange={(e) => setDt(e.target.value)}
                  />
                </label>
                <div className="full fh" aria-live="polite">
                  {hint}
                </div>
                <label className="full" htmlFor="tb_addr">
                  <span>{type === 'pickup' ? 'Drop-off address' : 'Pickup address'}</span>
                  <input
                    id="tb_addr"
                    type="text"
                    autoComplete="street-address"
                    value={addr}
                    onChange={(e) => setAddr(e.target.value)}
                  />
                </label>
                {air && (
                  <label className="full" htmlFor="tb_flight">
                    Flight number (optional)
                    <input
                      id="tb_flight"
                      type="text"
                      placeholder="For example 6E 204"
                      value={flight}
                      onChange={(e) => setFlight(e.target.value)}
                    />
                  </label>
                )}
                {ic && (
                  <label htmlFor="tb_dest">
                    Destination city
                    <input
                      id="tb_dest"
                      type="text"
                      value={dest}
                      onChange={(e) => setDest(e.target.value)}
                    />
                  </label>
                )}
                {ic && (
                  <fieldset className="tfs">
                    <legend>Trip</legend>
                    <div className="chips">
                      <label className="chip">
                        <input
                          type="radio"
                          name="ttrip"
                          value="oneway"
                          checked={trip === 'oneway'}
                          onChange={() => setTrip('oneway')}
                        />
                        <span>One-way</span>
                      </label>
                      <label className="chip">
                        <input
                          type="radio"
                          name="ttrip"
                          value="round"
                          checked={trip === 'round'}
                          onChange={() => setTrip('round')}
                        />
                        <span>Round trip</span>
                      </label>
                    </div>
                  </fieldset>
                )}
                {rt && (
                  <label className="full" htmlFor="tb_ret">
                    Return date and time (IST)
                    <input
                      id="tb_ret"
                      type="datetime-local"
                      min={dt || minStr}
                      value={ret}
                      onChange={(e) => setRet(e.target.value)}
                    />
                  </label>
                )}
                {type === 'hourly' && (
                  <label htmlFor="tb_hours">
                    Hours needed
                    <select
                      id="tb_hours"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                    >
                      {['4 hours', '6 hours', '8 hours', '10 hours', '12 hours'].map((h) => (
                        <option key={h}>{h}</option>
                      ))}
                    </select>
                  </label>
                )}
                <fieldset className="full tfs">
                  <legend>Vehicle</legend>
                  <div className="chips">
                    {['Sedan', 'SUV', 'Etios', 'Innova', 'Innova Crysta'].map((v) => (
                      <label className="chip" key={v}>
                        <input
                          type="radio"
                          name="tveh"
                          value={v}
                          checked={veh === v}
                          onChange={() => setVeh(v)}
                        />
                        <span>{v}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <label htmlFor="tb_pax">
                  Passengers
                  <input
                    id="tb_pax"
                    type="number"
                    min={1}
                    max={12}
                    value={pax}
                    inputMode="numeric"
                    onChange={(e) => setPax(e.target.value)}
                  />
                </label>
                <label htmlFor="tb_name">
                  Your name
                  <input
                    id="tb_name"
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label htmlFor="tb_phone">
                  Phone
                  <input
                    id="tb_phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
                <label htmlFor="tb_alt">
                  Alternate contact number (optional)
                  <input
                    id="tb_alt"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+91"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                  />
                </label>
                <label className="full" htmlFor="tb_note">
                  Notes (optional)
                  <textarea
                    id="tb_note"
                    placeholder="Luggage, child seat, special requests"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </label>
                {errs.length > 0 && (
                  <div className="err full" role="alert">
                    <strong>Please fix the following</strong>
                    <ul>
                      {errs.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="full">
                  <button className="btn btn-wine" type="submit" style={{ width: '100%' }}>
                    Request booking
                  </button>
                </div>
              </div>
              {summary && (
                <div className="sum">
                  <strong style={{ color: 'var(--wine)' }}>Your booking request is ready</strong>
                  <pre>{summary}</pre>
                  <span className="note" style={{ color: 'var(--muted)' }}>
                    Send this to us on WhatsApp. Your taxi is confirmed once we reply.
                  </span>
                  <a className="btn btn-wine" href={waHref} target="_blank" rel="noopener">
                    Send on WhatsApp
                  </a>
                  <button className="btn btn-gold" type="button" onClick={copy}>
                    {copyLabel}
                  </button>
                </div>
              )}
            </form>
          </div>
          <p className="fh" style={{ marginTop: 24 }}>
            Planning an event too?{' '}
            <Link to="/#connect">Connect with us</Link> or try the{' '}
            <Link to="/#estimator">spend estimator</Link>.
          </p>
      </div>
    </section>
  )
}
