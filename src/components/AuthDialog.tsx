import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  AUTH_LIVE,
  authApi,
  getSess,
  parseId,
  setSess,
  type IdParsed,
  type Session,
} from '../lib/auth'

type View =
  | 'signin'
  | 'signup'
  | 'forgot'
  | 'verify'
  | 'resetcode'
  | 'newpw'
  | 'account'

type AuthDialogProps = {
  open: boolean
  onClose: () => void
  onSessionChange: (s: Session | null) => void
  initialView?: View
  note?: string
  noteKind?: string
  recoveryToken?: string
}

const VIEWS: Record<
  View,
  {
    t: string
    s: string | ((ctx: { idp: IdParsed | null }) => string)
    f: string[]
    go: string
    links: [View, string][]
  }
> = {
  signin: {
    t: 'Sign in',
    s: 'Use your email or phone number and your password.',
    f: ['id', 'pw'],
    go: 'Sign in',
    links: [
      ['forgot', 'Forgot password?'],
      ['signup', 'Create an account'],
    ],
  },
  signup: {
    t: 'Create your account',
    s: 'Your email address or mobile number becomes your username.',
    f: ['name', 'id', 'pw'],
    go: 'Create account',
    links: [['signin', 'I already have an account']],
  },
  forgot: {
    t: 'Reset your password',
    s: 'Enter your email or mobile number. We send a reset link by email, or a 6-digit code by SMS.',
    f: ['id'],
    go: 'Send reset link or code',
    links: [['signin', 'Back to sign in']],
  },
  verify: {
    t: 'Enter your code',
    s: (ctx) => 'Enter the 6-digit code we sent to ' + (ctx.idp?.show || '') + '.',
    f: ['code'],
    go: 'Verify',
    links: [['signin', 'Back to sign in']],
  },
  resetcode: {
    t: 'Set a new password',
    s: (ctx) =>
      'Enter the 6-digit code for ' + (ctx.idp?.show || '') + ' and choose a new password.',
    f: ['code', 'pw'],
    go: 'Update password',
    links: [['signin', 'Back to sign in']],
  },
  newpw: {
    t: 'Choose a new password',
    s: 'Use at least 8 characters.',
    f: ['pw'],
    go: 'Save new password',
    links: [],
  },
  account: {
    t: 'Your account',
    s: () => {
      const s = getSess() || { name: '', id: '' }
      return 'Signed in as ' + (s.name || '') + (s.id ? ' (' + s.id + ')' : '') + '.'
    },
    f: [],
    go: 'Sign out',
    links: [],
  },
}

export function AuthDialog({
  open,
  onClose,
  onSessionChange,
  initialView = 'signin',
  note = '',
  noteKind = '',
  recoveryToken = '',
}: AuthDialogProps) {
  const dlg = useRef<HTMLDialogElement>(null)
  const [view, setView] = useState<View>(initialView)
  const [idp, setIdp] = useState<IdParsed | null>(null)
  const [token, setToken] = useState(recoveryToken)
  const [msg, setMsg] = useState(note)
  const [msgKind, setMsgKind] = useState(noteKind)
  const [busy, setBusy] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [name, setName] = useState('')
  const [id, setId] = useState('')
  const [code, setCode] = useState('')
  const [pw, setPw] = useState('')

  useEffect(() => {
    const el = dlg.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    setView(initialView)
    setMsg(note)
    setMsgKind(noteKind)
    setToken(recoveryToken)
    setShowPw(false)
  }, [open, initialView, note, noteKind, recoveryToken])

  const v = VIEWS[view]
  const sub = typeof v.s === 'function' ? v.s({ idp }) : v.s

  function resetForm() {
    setName('')
    setId('')
    setCode('')
    setPw('')
    setShowPw(false)
  }

  async function run(e: FormEvent) {
    e.preventDefault()
    if (view === 'account') {
      const s = getSess()
      setSess(null)
      onSessionChange(null)
      if (s) await authApi.signOut(s.token)
      onClose()
      return
    }

    let parsed: IdParsed | null = null
    if (v.f.includes('id')) {
      parsed = parseId(id)
      if (!parsed) {
        setMsg('Enter a valid email address or 10-digit mobile number.')
        setMsgKind('bad')
        return
      }
    }
    if (view === 'signup' && !name.trim()) {
      setMsg('Enter your name.')
      setMsgKind('bad')
      return
    }
    if (view === 'signin' && !pw) {
      setMsg('Enter your password.')
      setMsgKind('bad')
      return
    }
    if (v.f.includes('pw') && view !== 'signin' && pw.length < 8) {
      setMsg('Use a password of at least 8 characters.')
      setMsgKind('bad')
      return
    }
    if (v.f.includes('code') && !/^\d{6}$/.test(code.trim())) {
      setMsg('Enter the 6-digit code.')
      setMsgKind('bad')
      return
    }

    setBusy(true)
    try {
      if (view === 'signin' && parsed) {
        const s = await authApi.signIn(parsed, pw)
        setSess(s)
        onSessionChange(s)
        setView('account')
        setMsg('You are signed in.')
        setMsgKind('ok')
      } else if (view === 'signup' && parsed) {
        const r = await authApi.signUp(parsed, pw, name.trim())
        if (r.session) {
          setSess(r.session)
          onSessionChange(r.session)
          setView('account')
          setMsg('You are signed in.')
          setMsgKind('ok')
        } else if (parsed.kind === 'phone') {
          setIdp(parsed)
          setView('verify')
          setMsg('We sent a code by SMS.')
          setMsgKind('ok')
        } else {
          setView('signin')
          setMsg('Account created. Check your email to confirm your address, then sign in.')
          setMsgKind('ok')
        }
      } else if (view === 'verify' && idp) {
        const r = await authApi.verify(idp.value, code.trim())
        const s = { token: r.token, name: idp.show, id: idp.show }
        setSess(s)
        onSessionChange(s)
        setView('account')
        setMsg('You are signed in.')
        setMsgKind('ok')
      } else if (view === 'forgot' && parsed) {
        const r = await authApi.recover(parsed)
        setIdp(parsed)
        if (r.mode === 'link') {
          setView('signin')
          setMsg('If an account exists for that email, we have sent a reset link. Open it on this device.')
          setMsgKind('ok')
        } else {
          setView('resetcode')
          setMsg(r.note || '')
          setMsgKind('ok')
        }
      } else if (view === 'resetcode' && idp) {
        const r = await authApi.verify(idp.value, code.trim())
        await authApi.setPassword(r.token, pw)
        setView('signin')
        setMsg('Password updated. Sign in with your new password.')
        setMsgKind('ok')
      } else if (view === 'newpw') {
        await authApi.setPassword(token, pw)
        setToken('')
        setView('signin')
        setMsg('Password updated. Sign in with your new password.')
        setMsgKind('ok')
      }
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setMsgKind('bad')
    } finally {
      setBusy(false)
    }
  }

  return (
    <dialog
      className="dlg"
      ref={dlg}
      aria-labelledby="aTitle"
      onClick={(e) => {
        if (e.target === dlg.current) onClose()
      }}
      onClose={() => {
        resetForm()
        onClose()
      }}
    >
      <div className="dlg-in">
        <button type="button" className="dx" onClick={onClose} aria-label="Close">
          &times;
        </button>
        {!AUTH_LIVE && (
          <div className="demo">
            Demo mode: accounts and codes stay in this browser only. Connect a sign-in service to go
            live.
          </div>
        )}
        <h3 id="aTitle">{v.t}</h3>
        <p className="fh">{sub}</p>
        <form id="aForm" noValidate onSubmit={run}>
          {v.f.includes('name') && (
            <label data-f="name" htmlFor="a_name">
              Your name
              <input
                id="a_name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}
          {v.f.includes('id') && (
            <label data-f="id" htmlFor="a_id">
              Email or phone number
              <input
                id="a_id"
                type="text"
                autoComplete="username"
                placeholder="you@example.com or 98765 43210"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </label>
          )}
          {v.f.includes('code') && (
            <label data-f="code" htmlFor="a_code">
              6-digit code
              <input
                id="a_code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </label>
          )}
          {v.f.includes('pw') && (
            <label data-f="pw" htmlFor="a_pw">
              <span id="a_pw_l">
                {view === 'resetcode' || view === 'newpw' ? 'New password' : 'Password'}
              </span>
              <span className="pw">
                <input
                  id="a_pw"
                  type={showPw ? 'text' : 'password'}
                  autoComplete={view === 'signin' ? 'current-password' : 'new-password'}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                />
                <button type="button" className="tg" onClick={() => setShowPw((s) => !s)}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </span>
            </label>
          )}
          {msg && (
            <div className={`amsg ${msgKind}`} role="status" aria-live="polite">
              {msg}
            </div>
          )}
          <button className="btn btn-wine" type="submit" id="aGo" style={{ width: '100%' }} disabled={busy}>
            {v.go}
          </button>
          <div className="alinks" id="aLinks">
            {v.links.map(([next, label]) => (
              <button
                key={next}
                type="button"
                className="lk"
                onClick={() => {
                  setView(next)
                  setMsg('')
                  setMsgKind('')
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </form>
      </div>
    </dialog>
  )
}
