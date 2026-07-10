import type { Currency } from '@/lib/types'

export function fmtCurrency(v: number, currency: Currency) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v || 0)
}

export function fmtNumber(v: number, digits = 2) {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(v || 0)
}

export function fmtDate(v: string | null | undefined) {
  if (!v) return '—'
  try {
    return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(v))
  } catch {
    return v
  }
}

export function safeFilename(s: string) {
  // Turkish transliteration table
  const map: Record<string, string> = {
    'ğ': 'g', 'Ğ': 'G',
    'ı': 'i', 'İ': 'I',
    'ş': 's', 'Ş': 'S',
    'ç': 'c', 'Ç': 'C',
    'ö': 'o', 'Ö': 'O',
    'ü': 'u', 'Ü': 'U',
  }
  const transliterated = s.split('').map((ch) => map[ch] ?? ch).join('')
  return transliterated.replace(/[^a-zA-Z0-9\-_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '')
}
