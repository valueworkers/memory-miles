import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { FadeUp } from '../components/Motion'
import { EMAIL, PHONE_DISPLAY, PHONE_TEL, WA_URL } from '../lib/money'

export function Connect() {
  const nameRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [type, setType] = useState('Social')
  const [date, setDate] = useState('')
  const [msg, setMsg] = useState('')
  const [summary, setSummary] = useState('')
  const [waHref, setWaHref] = useState(WA_URL)
  const [copyLabel, setCopyLabel] = useState('Copy summary')

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('mm_enquiry')
      if (!raw) return
      const data = JSON.parse(raw) as { type?: string; msg?: string }
      sessionStorage.removeItem('mm_enquiry')
      if (data.type) setType(data.type)
      if (data.msg) {
        setMsg(data.msg)
        nameRef.current?.focus({ preventScroll: true })
      }
    } catch {
      /* ignore */
    }
  }, [])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      nameRef.current?.focus()
      return
    }
    if (!phone.trim()) {
      document.getElementById('q_phone')?.focus()
      return
    }
    const lines = [
      'Name: ' + name.trim(),
      'Phone: ' + phone.trim(),
      'Event type: ' + type,
    ]
    if (date) lines.push('Preferred date: ' + date)
    if (msg.trim()) lines.push('Requirement: ' + msg.trim())
    const text = lines.join('\n')
    setSummary(text)
    setWaHref(WA_URL + '?text=' + encodeURIComponent('Hello Memories & Miles,\n' + text))
  }

  function copy() {
    const done = (m: string) => {
      setCopyLabel(m)
      setTimeout(() => setCopyLabel('Copy summary'), 2000)
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
    <section id="connect" className="band-wine">
      <div className="in">
        <div className="conn">
          <FadeUp>
            <span className="eyebrow" style={{ color: '#fff' }}>
              Connect with us
            </span>
            <h2 style={{ marginTop: 14 }}>Tell us what you have in mind.</h2>
            <p className="lead" style={{ marginTop: 18 }}>
              A rough idea is enough. Share your occasion, date and guest count, and we will come
              back with options and a costed plan.
            </p>
            <div className="ways">
              <span>
                Call or WhatsApp:{' '}
                <a href={`tel:${PHONE_TEL}`}>
                  <b>{PHONE_DISPLAY}</b>
                </a>
              </span>
              <span>
                Email:{' '}
                <a href={`mailto:${EMAIL}`}>
                  <b>{EMAIL}</b>
                </a>
              </span>
            </div>
            <div className="cta-row">
              <a className="btn btn-gold" href={WA_URL} target="_blank" rel="noopener">
                Chat on WhatsApp
              </a>
              <a className="btn btn-light" href={`tel:${PHONE_TEL}`}>
                Call {PHONE_DISPLAY}
              </a>
            </div>
          </FadeUp>
          <FadeUp delay={0.12}>
            <form className="panel" noValidate onSubmit={onSubmit}>
              <div className="frm">
                <label htmlFor="q_name">
                  Your name
                  <input
                    id="q_name"
                    ref={nameRef}
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label htmlFor="q_phone">
                  Phone
                  <input
                    id="q_phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </label>
                <label htmlFor="q_type">
                  Event type
                  <select id="q_type" value={type} onChange={(e) => setType(e.target.value)}>
                    <option>Religious</option>
                    <option>Social</option>
                    <option>Corporate</option>
                    <option>Taxi / travel</option>
                  </select>
                </label>
                <label htmlFor="q_date">
                  Preferred date
                  <input
                    id="q_date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>
                <label className="full" htmlFor="q_msg">
                  Your requirement
                  <textarea
                    id="q_msg"
                    placeholder="Guest count, city, services you need, themes or rituals to include"
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                  />
                </label>
                <div className="full">
                  <button className="btn btn-wine" type="submit" style={{ width: '100%' }}>
                    Connect with us
                  </button>
                </div>
              </div>
              {summary && (
                <div className="sum">
                  <strong style={{ color: 'var(--wine)' }}>Your enquiry is ready to send</strong>
                  <pre>{summary}</pre>
                  <span className="note" style={{ color: 'var(--muted)' }}>
                    Send this straight to our WhatsApp, or copy it and share it by email.
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
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
