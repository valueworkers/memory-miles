import { Link } from 'react-router-dom'

export function BrandMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="5" y="5" width="22" height="22" transform="rotate(45 16 16)" fill="#5E0F2B" />
      <path
        d="M9.5 21V11.5l6.5 6.5 6.5-6.5V21"
        stroke="#E3C57E"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Brand({ to = '/', showIcon = true }: { to?: string; showIcon?: boolean }) {
  return (
    <Link className="brand" to={to} aria-label="Memories and Miles, home">
      {showIcon && <BrandMark />}
      <span>
        Memories <em>&amp;</em> Miles
      </span>
    </Link>
  )
}
