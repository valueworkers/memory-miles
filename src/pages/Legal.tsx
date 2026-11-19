import { Link, useParams } from 'react-router-dom'
import { FadeUp } from '../components/Motion'

const PAGES: Record<
  string,
  { title: string; updated: string; sections: { h: string; p: string[] }[] }
> = {
  terms: {
    title: 'Terms & conditions',
    updated: 'November 2026',
    sections: [
      {
        h: 'About these terms',
        p: [
          'These terms cover event planning and taxi booking services offered by Memories and Miles. By sending an enquiry, booking a taxi or signing a proposal with us, you agree to these terms.',
        ],
      },
      {
        h: 'Quotes and bookings',
        p: [
          'Estimates on this website are planning figures only. A confirmed booking needs a written proposal or WhatsApp confirmation from us, including date, scope and price.',
          'Taxi bookings are confirmed only after we reply and accept your request. Lead times and city availability shown on the site apply.',
        ],
      },
      {
        h: 'Your responsibilities',
        p: [
          'Share accurate guest counts, dates, pickup details and special requirements in good time. Changes close to the event or trip may affect price or availability.',
        ],
      },
      {
        h: 'Payments',
        p: [
          'Payment schedules are set out in your proposal. Deposits are usually required to reserve dates, venues or vehicles. Final balances are due as agreed in writing.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy policy',
    updated: 'November 2026',
    sections: [
      {
        h: 'What we collect',
        p: [
          'When you enquire or book, we may collect your name, phone number, email, event or travel details, and messages you send us (including via WhatsApp).',
        ],
      },
      {
        h: 'How we use it',
        p: [
          'We use your details to respond to enquiries, prepare quotes, confirm bookings, deliver services and improve how we work with clients.',
          'We do not sell your personal information. We share details only with vendors or drivers needed to deliver your event or trip, or when the law requires it.',
        ],
      },
      {
        h: 'Storage and contact',
        p: [
          'Demo sign-in data on this site stays in your browser only. Live accounts, when connected, are handled by our authentication provider under their security controls.',
          'To ask about your data or request a correction, contact us on WhatsApp or email using the details on the Connect section of this site.',
        ],
      },
    ],
  },
  refunds: {
    title: 'Cancellations & refunds',
    updated: 'November 2026',
    sections: [
      {
        h: 'Event planning',
        p: [
          'Cancellation terms depend on your written proposal and how much work or supplier booking has already started. Deposits may be partly or fully non-refundable once venues, vendors or materials are reserved.',
          'If we cancel a confirmed service for reasons within our control, we will refund amounts paid for the cancelled portion, less non-recoverable third-party costs already incurred.',
        ],
      },
      {
        h: 'Taxi bookings',
        p: [
          'Airport trips need at least 4 hours’ notice; intercity and hourly packages need at least 24 hours. Cancellations inside those windows may incur a fee or forfeit of any advance paid, as confirmed when we accept your booking.',
          'No-shows or last-minute changes after the driver is dispatched may be charged in full.',
        ],
      },
      {
        h: 'How to cancel',
        p: [
          'Please cancel in writing by WhatsApp or email as soon as you can. We will confirm the outcome and any refund timeline in our reply.',
        ],
      },
    ],
  },
}

export function Legal() {
  const { slug } = useParams()
  const page = PAGES[slug || '']

  if (!page) {
    return (
      <main className="legal-page">
        <div className="in">
          <h1>Page not found</h1>
          <p className="lead">
            <Link to="/">Return home</Link>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="legal-page">
      <div className="in">
        <FadeUp className="sec-head">
          <span className="eyebrow">Legal &amp; policies</span>
          <h1>{page.title}</h1>
          <p className="lead">Last updated {page.updated}</p>
        </FadeUp>
        <div className="legal-body">
          {page.sections.map((s, i) => (
            <FadeUp key={s.h} delay={i * 0.06} className="legal-block">
              <h2>{s.h}</h2>
              {s.p.map((para) => (
                <p key={para}>{para}</p>
              ))}
            </FadeUp>
          ))}
        </div>
        <FadeUp className="cta-row" style={{ marginTop: 40 }}>
          <Link className="btn btn-wine" to="/#connect">
            Connect with us
          </Link>
          <Link className="btn btn-line" to="/">
            Back to home
          </Link>
        </FadeUp>
      </div>
    </main>
  )
}
