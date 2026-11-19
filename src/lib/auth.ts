export type IdParsed = { kind: 'email' | 'phone'; value: string; show: string }
export type Session = { token: string; name: string; id: string }

const SKEY = 'mm_session'
const UKEY = 'mm_demo_users'

export const AUTH_CFG = { supabaseUrl: '', supabaseAnonKey: '' }
export const AUTH_LIVE = !!(AUTH_CFG.supabaseUrl && AUTH_CFG.supabaseAnonKey)

export function getSess(): Session | null {
  try {
    return JSON.parse(localStorage.getItem(SKEY) || 'null')
  } catch {
    return null
  }
}

export function setSess(s: Session | null) {
  try {
    if (s) localStorage.setItem(SKEY, JSON.stringify(s))
    else localStorage.removeItem(SKEY)
  } catch {
    /* ignore */
  }
}

export function parseId(raw: string): IdParsed | null {
  const v = raw.trim()
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v))
    return { kind: 'email', value: v.toLowerCase(), show: v }
  const m = v.replace(/[\s\-()]/g, '').match(/^(?:\+91|91|0)?([6-9]\d{9})$/)
  return m ? { kind: 'phone', value: '+91' + m[1], show: '+91 ' + m[1] } : null
}

function dbGet(): Record<string, { name: string; salt: string; hash: string }> {
  try {
    return JSON.parse(localStorage.getItem(UKEY) || '{}') || {}
  } catch {
    return {}
  }
}

function dbSet(d: Record<string, { name: string; salt: string; hash: string }>) {
  try {
    localStorage.setItem(UKEY, JSON.stringify(d))
  } catch {
    /* ignore */
  }
}

function hex(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  return Array.from(arr)
    .map((b) => ('0' + b.toString(16)).slice(-2))
    .join('')
}

function newSalt() {
  return hex(crypto.getRandomValues(new Uint8Array(8)))
}

function hash(salt: string, pw: string) {
  if (!(window.crypto && crypto.subtle))
    return Promise.reject(new Error('Demo sign-in needs a secure (https) page.'))
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + pw)).then(hex)
}

const codes: Record<string, string> = {}
const BAD = new Error('Incorrect email, phone number or password.')

async function call(path: string, o: { method?: string; body?: unknown; token?: string } = {}) {
  const h: Record<string, string> = {
    apikey: AUTH_CFG.supabaseAnonKey,
    'Content-Type': 'application/json',
  }
  if (o.token) h.Authorization = 'Bearer ' + o.token
  const r = await fetch(AUTH_CFG.supabaseUrl.replace(/\/$/, '') + '/auth/v1' + path, {
    method: o.method || 'POST',
    headers: h,
    body: o.body ? JSON.stringify(o.body) : undefined,
  })
  const t = await r.text()
  let j: Record<string, unknown> = {}
  try {
    j = t ? JSON.parse(t) : {}
  } catch {
    /* ignore */
  }
  if (!r.ok)
    throw new Error(
      String(j.msg || j.error_description || j.message || 'Something went wrong. Please try again.'),
    )
  return j
}

function toSess(j: Record<string, unknown>, fallback: string): Session {
  const u = (j.user as Record<string, unknown>) || {}
  const m = (u.user_metadata as Record<string, string>) || {}
  return {
    token: String(j.access_token),
    name: m.name || fallback,
    id: String(u.email || u.phone || fallback),
  }
}

export const authApi = AUTH_LIVE
  ? {
      signUp(i: IdParsed, pw: string, name: string) {
        const b: Record<string, unknown> = { password: pw, data: { name } }
        b[i.kind] = i.value
        return call('/signup', { body: b }).then((j) => ({
          session: j.access_token ? toSess(j, name) : null,
        }))
      },
      signIn(i: IdParsed, pw: string) {
        const b: Record<string, unknown> = { password: pw }
        b[i.kind] = i.value
        return call('/token?grant_type=password', { body: b }).then((j) => toSess(j, i.show))
      },
      recover(i: IdParsed) {
        if (i.kind === 'email')
          return call('/recover?redirect_to=' + encodeURIComponent(location.origin + location.pathname), {
            body: { email: i.value },
          }).then(() => ({ mode: 'link' as const }))
        return call('/otp', { body: { phone: i.value, create_user: false } }).then(() => ({
          mode: 'code' as const,
          note: 'If an account exists, we have sent a 6-digit code by SMS.',
        }))
      },
      verify(phone: string, code: string) {
        return call('/verify', { body: { type: 'sms', phone, token: code } }).then((j) => ({
          token: String(j.access_token),
        }))
      },
      setPassword(token: string, pw: string) {
        return call('/user', { method: 'PUT', token, body: { password: pw } })
      },
      signOut(token: string) {
        return call('/logout', { token }).catch(() => {})
      },
    }
  : {
      signUp(i: IdParsed, pw: string, name: string) {
        const d = dbGet()
        if (d[i.value])
          return Promise.reject(
            new Error('An account with this email or phone number already exists. Try signing in.'),
          )
        const salt = newSalt()
        return hash(salt, pw).then((h) => {
          d[i.value] = { name, salt, hash: h }
          dbSet(d)
          return { session: { token: 'demo:' + i.value, name, id: i.show } as Session }
        })
      },
      signIn(i: IdParsed, pw: string) {
        const u = dbGet()[i.value]
        if (!u) return Promise.reject(BAD)
        return hash(u.salt, pw).then((h) => {
          if (h !== u.hash) throw BAD
          return { token: 'demo:' + i.value, name: u.name, id: i.show } as Session
        })
      },
      recover(i: IdParsed) {
        let note = 'If an account exists, we have sent a 6-digit code.'
        if (dbGet()[i.value]) {
          const c = String(Math.floor(100000 + Math.random() * 900000))
          codes[i.value] = c
          note += ' Demo mode: your code is ' + c + '.'
        }
        return Promise.resolve({ mode: 'code' as const, note })
      },
      verify(key: string, code: string) {
        if (codes[key] && codes[key] === code) {
          delete codes[key]
          return Promise.resolve({ token: 'demo:' + key })
        }
        return Promise.reject(new Error('That code is not correct or has expired.'))
      },
      setPassword(token: string, pw: string) {
        const key = token.slice(5)
        const d = dbGet()
        if (!d[key]) return Promise.reject(new Error('Account not found.'))
        const salt = newSalt()
        return hash(salt, pw).then((h) => {
          d[key].salt = salt
          d[key].hash = h
          dbSet(d)
        })
      },
      signOut() {
        return Promise.resolve()
      },
    }
