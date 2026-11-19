import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AUTH_LIVE, getSess, type Session } from '../lib/auth'
import { PHONE_DISPLAY, PHONE_TEL } from '../lib/money'
import { AuthDialog } from './AuthDialog'
import { Brand } from './Brand'
import { ScrollToHash } from './ScrollToHash'

const NAV = [
  { to: '/#services', hash: '#services', label: 'Services' },
  { to: '/#taxi', hash: '#taxi', label: 'Taxi' },
  { to: '/#events', hash: '#events', label: 'Events' },
  { to: '/#packages', hash: '#packages', label: 'Packages' },
  { to: '/#portfolio', hash: '#portfolio', label: 'Portfolio' },
  { to: '/#estimator', hash: '#estimator', label: 'Spend estimator' },
] as const

export function Layout() {
  const { hash } = useLocation()
  const [session, setSession] = useState<Session | null>(() => getSess())
  const [authOpen, setAuthOpen] = useState(false)
  const [authView, setAuthView] = useState<'signin' | 'account' | 'newpw' | 'forgot'>('signin')
  const [authNote, setAuthNote] = useState('')
  const [authKind, setAuthKind] = useState('')
  const [recoveryToken, setRecoveryToken] = useState('')

  useEffect(() => {
    if (!AUTH_LIVE) return
    if (location.hash.includes('access_token') && location.hash.includes('type=recovery')) {
      const hp = new URLSearchParams(location.hash.slice(1))
      const token = hp.get('access_token') || ''
      history.replaceState(null, '', location.pathname + location.search)
      if (token) {
        setRecoveryToken(token)
        setAuthView('newpw')
        setAuthOpen(true)
      }
    } else if (location.hash.includes('error_description')) {
      const ep = new URLSearchParams(location.hash.slice(1))
      history.replaceState(null, '', location.pathname + location.search)
      setAuthView('forgot')
      setAuthNote(
        (ep.get('error_description') || 'That link has expired.').replace(/\+/g, ' ') +
          ' Request a new one.',
      )
      setAuthKind('bad')
      setAuthOpen(true)
    }
  }, [])

  return (
    <>
      <ScrollToHash />
      <header className="nav">
        <div className="in">
          <Brand />
          <nav className="links" aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.hash}
                to={item.to}
                className={() => (hash === item.hash ? 'active' : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
            <button
              type="button"
              className="btn btn-line"
              onClick={() => {
                setAuthView(session ? 'account' : 'signin')
                setAuthNote('')
                setAuthKind('')
                setAuthOpen(true)
              }}
            >
              {session ? 'Account' : 'Sign in'}
            </button>
            <Link className="btn btn-wine" to="/#connect">
              Connect with us
            </Link>
          </nav>
        </div>
      </header>

      <Outlet />

      <footer>
        <div className="in foot">
          <div className="foot-brand">
            <Brand showIcon={false} />
            <span>Religious, social and corporate events, planned end to end. Taxi services too.</span>
            <a href={`tel:${PHONE_TEL}`}>{PHONE_DISPLAY}</a>
          </div>
          <div className="foot-legal">
            <span className="foot-title">Legal &amp; policies</span>
            <Link to="/legal/terms">Terms &amp; conditions</Link>
            <Link to="/legal/privacy">Privacy policy</Link>
            <Link to="/legal/refunds">Cancellations &amp; refunds</Link>
          </div>
        </div>
      </footer>

      <AuthDialog
        open={authOpen}
        initialView={authView}
        note={authNote}
        noteKind={authKind}
        recoveryToken={recoveryToken}
        onClose={() => setAuthOpen(false)}
        onSessionChange={setSession}
      />
    </>
  )
}
