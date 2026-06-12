import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { createBusiness } from '../api/businesses'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Card } from '../components/Card'

export function CreateBusiness() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'SELF' | 'AI'>('SELF')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const form = new FormData(e.currentTarget)
    try {
      const business = await createBusiness({
        name: form.get('name') as string,
        industry: form.get('industry') as string,
        location: form.get('location') as string,
        description: form.get('description') as string,
        problem: form.get('problem') as string,
        goal: form.get('goal') as string,
        mode,
      })
      navigate(`/businesses/${business.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create business')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">New Business</div>
        <Button to="/businesses">← Back</Button>
      </div>

      <Card>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label="Business Name *" name="name" required placeholder="e.g. Brew Coffee Chain" />
            <Input label="Industry *" name="industry" required placeholder="e.g. Coffee Chain" />
            <Input label="Location" name="location" placeholder="e.g. Mumbai" />
            <Input label="Problem Statement" name="problem" placeholder="e.g. Customers do not come back" />
          </div>
          <Input label="Description" name="description" as="textarea" placeholder="Describe your business..." />
          <Input label="Goal" name="goal" as="textarea" placeholder="e.g. Increase repeat purchases by 20%" />

          {/* Mode Toggle */}
          <div style={{ marginBottom: '1rem' }}>
            <div className="field-label">Mode</div>
            <div className="btn-group">
              <Button
                type="button"
                variant={mode === 'SELF' ? 'primary' : 'default'}
                size="sm"
                onClick={() => setMode('SELF')}
              >
                SELF — Manual
              </Button>
              <Button
                type="button"
                variant={mode === 'AI' ? 'primary' : 'default'}
                size="sm"
                onClick={() => setMode('AI')}
              >
                AI — Automated
              </Button>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {mode === 'AI'
                ? 'AI mode auto-runs metrics → discovery → segments → campaigns after every CSV upload.'
                : 'Manually control each step: upload, metrics, discovery, segments, campaigns.'}
            </div>
          </div>

          <div className="btn-group" style={{ marginTop: '0.5rem' }}>
            <Button variant="primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Business ↳'}
            </Button>
            <Button type="button" onClick={() => navigate('/businesses')}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
