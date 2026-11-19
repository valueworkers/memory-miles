export function inr(v: number) {
  return '₹' + Math.round(v).toLocaleString('en-IN')
}

export function short(v: number) {
  v = Math.round(v / 5000) * 5000
  if (v >= 1e7) return '₹' + (v / 1e7).toFixed(2) + ' Cr'
  if (v >= 1e5) return '₹' + (v / 1e5).toFixed(1) + ' L'
  return inr(v)
}

export const WA = '918073509388'
export const WA_URL = `https://wa.me/${WA}`
export const PHONE_DISPLAY = '+91 80735 09388'
export const PHONE_TEL = '+918073509388'
export const EMAIL = 'lalithanaganandan@gmail.com'
