import { Link } from 'react-router-dom'
import { Button } from '../components/Button'

const features = [
  { icon: '◈', title: 'Business Management', desc: 'Create and manage multiple businesses with detailed profiles, goals, and industry tracking.' },
  { icon: '⊞', title: 'Smart Segments', desc: 'AI-powered customer segmentation. Define rules manually or let AI discover meaningful groups.' },
  { icon: '◉', title: 'Campaign Orchestration', desc: 'Multi-channel campaigns via WhatsApp, Email, and SMS with AI-assisted messaging.' },
  { icon: '▣', title: 'CSV Data Import', desc: 'Upload customer, order, and event data with automatic validation and error reporting.' },
  { icon: '◈', title: 'Analytics & Insights', desc: 'Track campaign performance with delivery, open, and click metrics. Get AI recommendations.' },
  { icon: '⚙', title: 'Metrics Engine', desc: 'Compute customer profiles — total spend, frequency, recency, and favorite products.' },
]

const flow = [
  { step: '01', label: 'Create Business', desc: 'Set up your business profile' },
  { step: '02', label: 'Import Data', desc: 'Upload customer & order CSVs' },
  { step: '03', label: 'Run Discovery', desc: 'AI analyzes your data' },
  { step: '04', label: 'Build Segments', desc: 'Target the right customers' },
  { step: '05', label: 'Launch Campaigns', desc: 'Engage across channels' },
  { step: '06', label: 'Measure Results', desc: 'Track & optimize' },
]

export function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 2.5rem',
        borderBottom: '2px solid var(--border-strong)',
        background: 'var(--bg-card)',
      }}>
        <div style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          <span style={{ color: 'var(--accent)' }}>x</span>eno CRM
        </div>
        <div className="btn-group">
          <Button to="/login">Sign In</Button>
          <Button variant="primary" to="/signup">Get Started</Button>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero" style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '6rem 2.5rem 4rem',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 5vw, 3rem)',
          fontWeight: 700,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
          marginBottom: '1.25rem',
        }}>
          CRM for the{' '}
          <span style={{
            background: 'var(--border-strong)',
            color: 'var(--bg-card)',
            padding: '0.1rem 0.4rem',
            border: '2px solid var(--border-strong)',
            boxShadow: '6px 6px 0 var(--accent)',
          }}>AI-First</span>{' '}
          Era
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.7,
        }}>
          Import your customer data, discover insights with AI, build targeted segments,
          and launch multi-channel campaigns — all from a clean, retro-inspired interface.
        </p>
        <div className="btn-group" style={{ justifyContent: 'center' }}>
          <Button variant="accent" size="default" to="/signup" style={{ padding: '0.9rem 2rem', fontSize: '0.85rem' }}>
            Start Free ↗
          </Button>
          <Button to="/login" style={{ padding: '0.9rem 2rem', fontSize: '0.85rem' }}>
            Sign In
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="landing-stats" style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '0 2.5rem 4rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
      }}>
        {[
          { label: 'API Endpoints', value: '25+' },
          { label: 'Channels Supported', value: '3' },
          { label: 'Setup Time', value: '< 5 min' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
            <div className="stat-value" style={{ color: 'var(--accent)' }}>{s.value}</div>
            <div className="stat-label" style={{ marginBottom: 0 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '0 2.5rem 5rem',
      }}>
        <h2 style={{ fontSize: '1.75rem', textAlign: 'center', marginBottom: '0.5rem' }}>Everything you need</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
          From data import to campaign analytics — one platform.
        </p>
        <div className="card-grid">
          {features.map(f => (
            <div key={f.title} className="card" style={{ border: '2px solid var(--border-strong)', boxShadow: '4px 4px 0 var(--border-strong)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{f.icon}</div>
              <div style={{ fontWeight: 600, marginBottom: '0.35rem' }}>{f.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Flow */}
      <section style={{
        background: 'var(--bg-card)',
        borderTop: '2px solid var(--border-strong)',
        borderBottom: '2px solid var(--border-strong)',
        padding: '4rem 2.5rem',
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>How it works</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.9rem' }}>
            Six steps from setup to insights.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
            {flow.map(f => (
              <div key={f.step} style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                padding: '1rem',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius)',
              }}>
                <div className="badge" style={{
                  fontSize: '0.8rem',
                  padding: '0.3rem 0.6rem',
                  background: 'var(--border-strong)',
                  color: 'var(--bg-card)',
                  borderColor: 'var(--border-strong)',
                  flexShrink: 0,
                }}>{f.step}</div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.15rem' }}>{f.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '5rem 2.5rem',
        textAlign: 'center',
      }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>Ready to transform your CRM?</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          No credit card required. Start with a single business and scale from there.
        </p>
        <Button variant="accent" to="/signup" style={{ padding: '0.9rem 2.5rem', fontSize: '0.85rem' }}>
          Create Free Account ↗
        </Button>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '2px solid var(--border)',
        padding: '1.5rem 2.5rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
      }}>
        Xeno CRM — Built for the AI era
      </footer>
    </div>
  )
}
