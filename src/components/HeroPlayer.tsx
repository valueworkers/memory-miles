import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { RecPulse } from './Motion'
import { IcoCamera, IcoFlower, IcoFood, IcoMic, IcoVenueSmall } from './Icons'

const STEPS: [string, string][] = [
  ['Find the venue', 'We shortlist and walk the venues with you.'],
  ['Plan the food', 'Menus tasted, counts fixed, service timed.'],
  ['Dress the space', 'Flowers and decor built to your theme.'],
  ['Place the cameras', 'Photo and video crews set before guests arrive.'],
  ['Run the show', 'Compering and activities keep the day moving.'],
]

const DUR = 3600
const ICONS = [IcoVenueSmall, IcoFood, IcoFlower, IcoCamera, IcoMic]
const POS = [
  { x: 12.5, y: 12.5 },
  { x: 49.5, y: 12.5 },
  { x: 12.5, y: 49.5 },
  { x: 49.5, y: 49.5 },
  { x: 31, y: 31 },
]

export function HeroPlayer() {
  const reduce = useReducedMotion()
  const [cur, setCur] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [barOn, setBarOn] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setPlaying(!reduce)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current)
    setBarOn(false)
    if (!playing) return

    requestAnimationFrame(() => {
      setBarOn(true)
    })
    timer.current = setTimeout(() => {
      setCur((c) => (c + 1) % STEPS.length)
    }, DUR)

    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [playing, cur])

  function go(i: number) {
    setCur(i)
  }

  return (
    <div className="player" role="group" aria-label="Animated 3D walkthrough of how we work">
      <div className="player-top">
        <span className="rec">
          <RecPulse />
          How we work
        </span>
        <span>
          Step {cur + 1} of {STEPS.length}
        </span>
      </div>
      <div className="scene" aria-hidden="true">
        <motion.div
          className="stage"
          animate={
            reduce
              ? undefined
              : {
                  rotateZ: [45, 47, 45],
                  rotateX: [60, 58, 60],
                }
          }
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="floor"></div>
          {[
            ['24cqw', '3cqw'],
            ['28cqw', '3cqw'],
            ['32cqw', '3cqw'],
            ['3cqw', '24cqw'],
            ['3cqw', '28cqw'],
            ['3cqw', '32cqw'],
            ['57cqw', '24cqw'],
            ['57cqw', '28cqw'],
          ].map(([left, top], i) => (
            <motion.div
              key={i}
              className="guest"
              style={{ left, top }}
              animate={reduce ? undefined : { opacity: [0.55, 0.95, 0.55], scale: [1, 1.15, 1] }}
              transition={{ duration: 2.4 + i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
          {POS.map((p, i) => {
            const Icon = ICONS[i]
            return (
              <motion.div
                key={i}
                className={`node${cur === i ? ' on' : ''}`}
                style={{ ['--x' as string]: p.x, ['--y' as string]: p.y }}
                animate={
                  reduce
                    ? undefined
                    : cur === i
                      ? { scale: 1.08, z: 8 }
                      : { scale: 1, z: 0 }
                }
                transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              >
                <div className="sh"></div>
                <div className="med">
                  <Icon />
                  <span className="num">{i + 1}</span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
        <div className="hud">
          <div className="cap" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={cur}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.35 }}
              >
                <small>
                  Step {cur + 1} · {STEPS[cur][0]}
                </small>
                {STEPS[cur][1]}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="bar">
            <i
              style={{
                width: barOn && playing ? '100%' : '0',
                transition: barOn && playing ? `width ${DUR}ms linear` : 'none',
              }}
            ></i>
          </div>
        </div>
      </div>
      <div className="ctl">
        <button
          className="pp"
          type="button"
          aria-label={playing ? 'Pause animation' : 'Play animation'}
          onClick={() => setPlaying((p) => !p)}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            {playing ? (
              <>
                <rect x="3" y="2" width="3.5" height="12" rx="1" />
                <rect x="9.5" y="2" width="3.5" height="12" rx="1" />
              </>
            ) : (
              <path d="M4 2.5v11l9-5.5z" />
            )}
          </svg>
        </button>
        <div className="dots">
          {STEPS.map((s, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Step ${i + 1}: ${s[0]}`}
              aria-current={i === cur ? 'true' : 'false'}
              onClick={() => go(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <span className="hint">Illustrative walkthrough</span>
      </div>
    </div>
  )
}
