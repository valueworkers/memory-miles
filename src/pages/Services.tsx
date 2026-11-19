import { motion } from 'framer-motion'
import { FadeUp, Stagger, StaggerItem, Tilt3D } from '../components/Motion'
import {
  IcoCamera,
  IcoFlower,
  IcoFood,
  IcoGift,
  IcoHotel,
  IcoMic,
  IcoPin,
  IcoTeam,
  IcoTravel,
} from '../components/Icons'

const SERVICES = [
  {
    icon: IcoPin,
    title: 'Venue identification',
    body: 'We shortlist halls, lawns, community spaces, banquets and resorts that fit your guest count, budget and date, then visit them with you.',
    tags: ['Shortlisting', 'Site visits', 'Negotiation'],
  },
  {
    icon: IcoFood,
    title: 'Food catering',
    body: 'Pure vegetarian, Jain, regional or multi-cuisine menus, planned for your guest count with live counters, tastings and trained service staff.',
    tags: ['Menu tasting', 'Live counters', 'Service staff'],
  },
  {
    icon: IcoCamera,
    title: 'Photography & videography',
    body: 'Candid and traditional photography, cinematic video and drone coverage, with a highlight film and an organised gallery after the event.',
    tags: ['Candid + traditional', 'Highlight film', 'Drone'],
  },
  {
    icon: IcoFlower,
    title: 'Flowers & event decoration',
    body: 'Entrances, stages, mandaps, tables and photo corners in fresh flowers, drapes and lighting, styled to your theme and colours.',
    tags: ['Stage & entrance', 'Floral work', 'Lighting'],
  },
  {
    icon: IcoMic,
    title: 'Compering',
    body: 'Hosts who keep the programme on time and the room warm, in the languages your guests speak, for ceremonies, receptions and corporate evenings.',
    tags: ['Multilingual', 'Run of show', 'Awards & stage'],
  },
  {
    icon: IcoTeam,
    title: 'Team activities',
    body: 'Games, icebreakers and group challenges for offsites, family gatherings and sangeet nights, with facilitators and all the props.',
    tags: ['Icebreakers', 'Group games', 'Facilitators'],
  },
  {
    icon: IcoHotel,
    title: 'Hotel booking',
    body: 'Rooms booked near the venue for out-of-town family and guests, with room allocation planned for you.',
    tags: ['Near the venue', 'Room allocation', 'Group bookings'],
  },
  {
    icon: IcoTravel,
    title: 'Travel arrangements',
    body: 'Flights, buses and group travel for your guests, ticketed and coordinated so everyone arrives together.',
    tags: ['Flights', 'Bus', 'Group travel'],
  },
  {
    icon: IcoGift,
    title: 'Return gifts',
    body: 'Thoughtful return gifts chosen for your guests, packed, labelled and ready to hand over at the event.',
    tags: ['Curated', 'Packed & labelled', 'Custom branding'],
  },
]

export function Services() {
  return (
    <section id="services" className="band-blush">
      <div className="in">
        <FadeUp className="sec-head">
          <span className="eyebrow">What we do</span>
          <h2>Nine services. Take one, or take them all.</h2>
          <p className="lead">
            Every service works on its own or as part of a complete event. One team, one plan, one
            point of contact.
          </p>
        </FadeUp>
        <Stagger className="grid-3">
          {SERVICES.map((s) => (
            <StaggerItem key={s.title} hover={false}>
              <Tilt3D className="svc" max={8}>
                <motion.div
                  className="ico"
                  style={{ transform: 'translateZ(28px)' }}
                  whileHover={{ rotateY: 18, rotateX: -8, scale: 1.08 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                >
                  <s.icon />
                </motion.div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
                <ul>
                  {s.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </Tilt3D>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  )
}
