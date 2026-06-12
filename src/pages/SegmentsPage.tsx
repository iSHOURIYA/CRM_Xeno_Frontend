import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listBusinesses } from '../api/businesses'
import { listSegments, createSegment, aiSuggestSegment } from '../api/segments'
import type { Business, Segment } from '../types'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Modal } from '../components/Modal'

export function Segments() {
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBid, setSelectedBid] = useState<string>('')
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResult, setAiResult] = useState<any>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    listBusinesses().then(bizs => {
      setBusinesses(bizs)
      if (bizs.length > 0) setSelectedBid(bizs[0].id)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedBid) return
    listSegments(selectedBid).then(setSegments).catch(() => {})
  }, [selectedBid])

  async function handleAiSuggest() {
    if (!selectedBid || !aiPrompt) return
    setAiLoading(true)
    try {
      const result = await aiSuggestSegment(selectedBid, aiPrompt)
      setAiResult(result)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setAiLoading(false)
    }
  }

  async function handleSaveAiSegment() {
    if (!selectedBid || !aiResult) return
    setCreating(true)
    try {
      await createSegment(selectedBid, aiResult)
      setAiResult(null)
      setAiOpen(false)
      setAiPrompt('')
      const segs = await listSegments(selectedBid)
      setSegments(segs)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleCreateManual(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedBid) return
    const form = new FormData(e.currentTarget)
    const rulesStr = form.get('rules') as string
    let rules: any[]
    try { rules = JSON.parse(rulesStr) } catch { rules = [] }

    setCreating(true)
    try {
      await createSegment(selectedBid, {
        name: form.get('name') as string,
        description: form.get('description') as string,
        rules,
      })
      setCreateOpen(false)
      const segs = await listSegments(selectedBid)
      setSegments(segs)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setCreating(false)
    }
  }

  if (loading) return <div className="loading-page"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Segments</div>
        <div className="btn-group">
          {selectedBid && <Button onClick={() => setAiOpen(true)}>AI Suggest</Button>}
          {selectedBid && <Button variant="primary" onClick={() => setCreateOpen(true)}>+ New Segment</Button>}
        </div>
      </div>

      <Card style={{ marginBottom: '1rem' }}>
        <div className="detail-grid" style={{ gridTemplateColumns: '1fr', marginBottom: '0' }}>
          <Input label="Business" name="business" as="select" value={selectedBid} onChange={e => setSelectedBid(e.target.value)}>
            {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Input>
        </div>
      </Card>

      {!selectedBid ? (
        <Card><div className="empty-state"><p>Select a business to view segments.</p></div></Card>
      ) : segments.length === 0 ? (
        <Card><div className="empty-state"><div className="empty-state-icon">⊞</div><p>No segments found for this business.</p></div></Card>
      ) : (
        <div className="card-grid">
          {segments.map(s => (
            <div key={s.id} className="stat-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/businesses/${selectedBid}`)}>
              <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{s.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{s.description}</div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge">{s.audienceSize} customers</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                {s.rulesJson?.map((r: any) => `${r.field} ${r.operator} ${r.value}`).join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Segment"
        footer={<div className="btn-group">
          <Button variant="primary" form="create-seg" disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
        </div>}
      >
        <form id="create-seg" onSubmit={handleCreateManual}>
          <Input label="Name *" name="name" required placeholder="e.g. High Value Customers" />
          <Input label="Description" name="description" placeholder="e.g. Customers who spend the most" />
          <Input label="Rules (JSON)" name="rules" as="textarea" placeholder='[{"field":"totalSpend","operator":"gt","value":5000}]' />
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Fields: daysSinceLastPurchase, totalOrders, totalSpend, signupDate, lastPurchaseDate<br />
            Operators: gt, gte, lt, lte, eq, ne
          </div>
        </form>
      </Modal>

      <Modal open={aiOpen} onClose={() => { setAiOpen(false); setAiResult(null) }} title="AI Segment Suggestion"
        footer={aiResult ? <div className="btn-group">
          <Button variant="primary" onClick={handleSaveAiSegment} disabled={creating}>{creating ? 'Saving...' : 'Save Segment'}</Button>
          <Button onClick={() => { setAiResult(null); setAiOpen(false) }}>Cancel</Button>
        </div> : undefined}
      >
        <Input label="Describe the segment" name="ai-prompt" placeholder='e.g. "Find customers who used to buy frequently but disappeared recently"' value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
        {!aiResult ? (
          <Button variant="accent" onClick={handleAiSuggest} disabled={aiLoading || !aiPrompt} style={{ marginTop: '0.5rem' }}>
            {aiLoading ? 'Thinking...' : 'Generate Suggestion'}
          </Button>
        ) : (
          <div className="alert alert-info" style={{ marginTop: '1rem' }}>
            <div style={{ fontWeight: 600 }}>{aiResult.name}</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{aiResult.description}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {aiResult.rules?.map((r: any) => `${r.field} ${r.operator} ${r.value}`).join(', ')}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
