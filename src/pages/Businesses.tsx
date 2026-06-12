import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listBusinesses } from '../api/businesses'
import type { Business } from '../types'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

export function Businesses() {
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

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
        <div className="page-title">Businesses</div>
        <Button variant="primary" to="/businesses/new">+ New Business</Button>
      </div>

      {businesses.length === 0 ? (
        <Card>
          <div className="empty-state">
            <div className="empty-state-icon">◈</div>
            <p>No businesses found. Create your first business.</p>
            <div style={{ marginTop: '1rem' }}>
              <Button variant="primary" to="/businesses/new">Create Business</Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Industry</th>
                <th>Mode</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {businesses.map(b => (
                <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/businesses/${b.id}`)}>
                  <td style={{ fontWeight: 600 }}>{b.name}</td>
                  <td>{b.industry}</td>
                  <td>
                    <span className={`badge ${b.mode === 'AI' ? 'badge-success' : ''}`}>
                      {b.mode || 'SELF'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(b.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button size="sm" onClick={e => { e.stopPropagation(); navigate(`/businesses/${b.id}`) }}>
                      Open →
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
