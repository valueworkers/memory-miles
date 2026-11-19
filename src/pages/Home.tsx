import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { HeroPlayer } from '../components/HeroPlayer'
import { BrandOrbits, FadeUp, FloatBlob, Stagger, StaggerItem } from '../components/Motion'
import { Connect } from './Connect'
import { Estimator } from './Estimator'
import { Events } from './Events'
import { Packages } from './Packages'
import { Portfolio } from './Portfolio'
import { Services } from './Services'
import { Taxi } from './Taxi'

const ease = [0.22, 1, 0.36, 1] as const

export function Home() {
  const reduce = useReducedMotion()

  return (
    <main id="top">
      <section className="hero hero-illus">
        <FloatBlob className="blob blob-a" />
        <FloatBlob className="blob blob-b" />
        <BrandOrbits className="hero-orbits" />
        <div className="in">
          <div className="hero-copy">
            <motion.span
              className="eyebrow"
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease }}
            >
              Religious · Social · Corporate
            </motion.span>
            <motion.h1
              initial={reduce ? false : { opacity: 0, y: 28, rotateX: 12 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.75, delay: 0.08, ease }}
              style={{ transformPerspective: 800 }}
            >
              Events worth remembering, planned <em>mile by mile.</em>
            </motion.h1>
            <motion.p
              className="lead"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.16, ease }}
            >
              From the first venue visit to the last guest&apos;s goodbye, we handle the venue, the
              food, the flowers, the cameras and the stage. Choose a ready package or tell us
              exactly what you need.
            </motion.p>
            <motion.div
              className="cta-row"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24, ease }}
            >
              <Link className="btn btn-wine" to="/#connect">
                Connect with us for your requirement
              </Link>
              <Link className="btn btn-line" to="/#estimator">
                Estimate your event spend
              </Link>
            </motion.div>
            <motion.div
              className="hero-types"
              aria-label="Event types"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.34 }}
            >
              <span>Pujas &amp; ceremonies</span>
              <span>Weddings &amp; milestones</span>
              <span>Offsites &amp; launches</span>
              <span>Airport &amp; city taxis</span>
            </motion.div>
          </div>
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.94, x: 28, rotateY: -12 }}
            animate={{ opacity: 1, scale: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.9, delay: 0.18, ease }}
            style={{ transformPerspective: 1200, transformStyle: 'preserve-3d' }}
          >
            <HeroPlayer />
          </motion.div>
        </div>
      </section>

      <Services />
      <Taxi />
      <Events />
      <Packages />
      <Portfolio />
      <Estimator />

      <section id="how">
        <div className="in">
          <FadeUp className="sec-head">
            <span className="eyebrow">From enquiry to event day</span>
            <h2>Four steps, no surprises.</h2>
          </FadeUp>
          <Stagger className="steps" stagger={0.12}>
            <StaggerItem className="step">
              <h3>Tell us</h3>
              <p>Share the occasion, date, guest count and anything that matters to you or your family.</p>
            </StaggerItem>
            <StaggerItem className="step">
              <h3>Receive a plan</h3>
              <p>We send a proposal with venue options, menus, design ideas and a costed estimate.</p>
            </StaggerItem>
            <StaggerItem className="step">
              <h3>Refine together</h3>
              <p>Taste, visit, adjust. Swap services in and out until it feels right.</p>
            </StaggerItem>
            <StaggerItem className="step">
              <h3>Enjoy the day</h3>
              <p>Our team runs the event on site, so you can be with your guests.</p>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      <Connect />
    </main>
  )
}
