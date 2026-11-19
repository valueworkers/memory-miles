import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from 'framer-motion'
import type { ReactNode } from 'react'
import { useRef } from 'react'

const ease = [0.22, 1, 0.36, 1] as const

export function FadeUp({
  children,
  delay = 0,
  className,
  ...rest
}: { children: ReactNode; delay?: number } & HTMLMotionProps<'div'>) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32, rotateX: 8 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, amount: 0.18, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.75, delay, ease }}
      style={{ transformPerspective: 900, transformStyle: 'preserve-3d' }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  )
}

export function ScaleIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.92, rotateY: -8 }}
      whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease }}
      style={{ transformPerspective: 1000 }}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({
  children,
  className,
  stagger = 0.09,
}: {
  children: ReactNode
  className?: string
  stagger?: number
}) {
  const reduce = useReducedMotion()
  if (reduce) return <div className={className}>{children}</div>
  return (
    <motion.div
      className={`perspective-scene ${className || ''}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: 0.06 } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
  as: Tag = 'div',
  hover = true,
}: {
  children: ReactNode
  className?: string
  as?: 'div' | 'article' | 'li'
  hover?: boolean
}) {
  const reduce = useReducedMotion()
  const MotionTag = motion[Tag]
  if (reduce) {
    const Static = Tag
    return <Static className={className}>{children}</Static>
  }
  return (
    <MotionTag
      className={className}
      style={{ transformStyle: 'preserve-3d' }}
      variants={{
        hidden: { opacity: 0, y: 28, rotateX: 12, scale: 0.97 },
        show: {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          transition: { duration: 0.6, ease },
        },
      }}
      whileHover={
        hover
          ? {
              y: -6,
              rotateX: 2,
              rotateY: -3,
              z: 24,
              transition: { duration: 0.28 },
            }
          : undefined
      }
    >
      {children}
    </MotionTag>
  )
}

/** Pointer-driven 3D tilt — soft wine/gold feel for cards. */
export function Tilt3D({
  children,
  className,
  max = 10,
}: {
  children: ReactNode
  className?: string
  max?: number
}) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [max, -max]), { stiffness: 180, damping: 18 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-max, max]), { stiffness: 180, damping: 18 })
  const glareX = useTransform(mx, [-0.5, 0.5], [0, 100])
  const glareY = useTransform(my, [-0.5, 0.5], [0, 100])
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(227,197,126,.28), transparent 55%)`

  if (reduce) return <div className={className}>{children}</div>

  return (
    <motion.div
      ref={ref}
      className={`tilt-3d ${className || ''}`}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformStyle: 'preserve-3d',
        transformPerspective: 900,
      }}
      onMouseMove={(e) => {
        const el = ref.current
        if (!el) return
        const r = el.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      }}
      onMouseLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      {children}
      <motion.div className="tilt-glare" style={{ background: glare }} aria-hidden />
    </motion.div>
  )
}

export function FloatBlob({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return null
  return (
    <motion.div
      className={className}
      aria-hidden
      animate={{ y: [0, -18, 0], x: [0, 8, 0], rotate: [0, 6, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

export function RecPulse({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return <i className={className} />
  return (
    <motion.i
      className={className}
      animate={{ opacity: [1, 0.35, 1], scale: [1, 0.85, 1] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}

/** Floating brand diamonds — wine + gold, 3D orbit for hero/portfolio. */
export function BrandOrbits({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  if (reduce) return null

  return (
    <div className={`brand-orbits ${className || ''}`} aria-hidden>
      <motion.div
        className="orbit-ring"
        animate={{ rotateZ: 360 }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
      >
        <motion.span
          className="orbit-gem gem-wine"
          animate={{ rotateZ: -360, rotateY: [0, 40, 0] }}
          transition={{
            rotateZ: { duration: 28, repeat: Infinity, ease: 'linear' },
            rotateY: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
        <motion.span
          className="orbit-gem gem-gold"
          style={{ ['--a' as string]: '180deg' }}
          animate={{ rotateZ: -360, rotateY: [0, -35, 0] }}
          transition={{
            rotateZ: { duration: 28, repeat: Infinity, ease: 'linear' },
            rotateY: { duration: 6.5, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
      </motion.div>
      <motion.div
        className="orbit-ring orbit-ring-inner"
        animate={{ rotateZ: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        <motion.span
          className="orbit-gem gem-gold-sm"
          animate={{ rotateZ: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </div>
  )
}
