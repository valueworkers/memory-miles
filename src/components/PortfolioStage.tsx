import { motion, useReducedMotion } from 'framer-motion'

/** Soft portfolio preview stack — wine/gold gallery cards, not a broken 3D scene. */
export function PortfolioStage() {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className="folio-preview"
      aria-hidden
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className="folio-stack"
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="folio-card back" />
        <div className="folio-card mid" />
        <div className="folio-card front">
          <div className="folio-frame">
            <svg className="folio-art" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="150" fill="#FAF4F4" />
              <ellipse cx="100" cy="128" rx="70" ry="10" fill="#F4EAD0" opacity=".9" />
              <path
                d="M40 118 V52 Q100 18 160 52 V118"
                stroke="#C9A24F"
                strokeWidth="3"
                fill="#FFFFFF"
              />
              <path
                d="M52 118 V62 Q100 36 148 62 V118"
                stroke="#5E0F2B"
                strokeWidth="2"
                fill="#F1E1E6"
                opacity=".85"
              />
              <circle cx="72" cy="58" r="7" fill="#E3C57E" />
              <circle cx="100" cy="48" r="9" fill="#5E0F2B" />
              <circle cx="128" cy="58" r="7" fill="#E3C57E" />
              <circle cx="88" cy="68" r="5" fill="#C9A24F" />
              <circle cx="112" cy="68" r="5" fill="#C9A24F" />
              <rect x="5" y="5" width="22" height="22" transform="rotate(45 16 16)" fill="#5E0F2B" />
              <path
                d="M9.5 21V11.5l6.5 6.5 6.5-6.5V21"
                stroke="#E3C57E"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="folio-caption">
            <span>Décor gallery</span>
            <em>Marriage · Sangeet · Celebrations</em>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
