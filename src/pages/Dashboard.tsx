import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listBusinesses } from '../api/businesses'
import type { Business } from '../types'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

export function Dashboard() {
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    listBusinesses()
      .then(setBusinesses)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading-page"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Welcome back, {user.name || 'User'}
          </div>
        </div>
        <Button variant="primary" to="/businesses/new">+ New Business</Button>
      </div>

      <div className="card-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-label">Businesses</div>
          <div className="stat-value">{businesses.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Status</div>
          <div className="stat-value" style={{ fontSize: '1rem' }}>
            {businesses.length > 0 ? '● Active' : '○ Idle'}
          </div>
        </div>
      </div>

      <Card title="Your Businesses" actions={
        businesses.length > 0 ? <Button size="sm" to="/businesses">View All →</Button> : undefined
      }>
        {businesses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">◈</div>
            <p>No businesses yet. Create your first business to get started.</p>
            <div style={{ marginTop: '1rem' }}>
              <Button variant="primary" to="/businesses/new">Create Business</Button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {businesses.slice(0, 5).map(b => (
              <div
                key={b.id}
                style={{
                  padding: '0.75rem',
                  border: '2px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onClick={() => navigate(`/businesses/${b.id}`)}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{b.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{b.industry}</div>
                </div>
                <span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>→</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
