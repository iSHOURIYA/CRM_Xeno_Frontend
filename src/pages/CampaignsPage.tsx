import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listBusinesses } from '../api/businesses'
import { listCampaigns, createCampaign, aiAssistCampaign, launchCampaign } from '../api/campaigns'
import { listSegments } from '../api/segments'
import type { Business, Campaign, Segment } from '../types'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Modal } from '../components/Modal'

export function Campaigns() {
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBid, setSelectedBid] = useState<string>('')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)

  useEffect(() => {
    listBusinesses().then(bizs => {
      setBusinesses(bizs)
      if (bizs.length > 0) setSelectedBid(bizs[0].id)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedBid) return
    Promise.all([
      listCampaigns(selectedBid),
      listSegments(selectedBid),
    ]).then(([camps, segs]) => {
      setCampaigns(camps)
      setSegments(segs)
    }).catch(() => {})
  }, [selectedBid])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedBid) return
    const form = new FormData(e.currentTarget)
    try {
      await createCampaign(selectedBid, {
        segmentId: form.get('segmentId') as string,
        channel: form.get('channel') as string,
        message: form.get('message') as string,
      })
      setCreateOpen(false)
      const camps = await listCampaigns(selectedBid)
      setCampaigns(camps)
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleAiAssist(campaignId: string) {
    if (!selectedBid) return
    try {
      const result = await aiAssistCampaign(selectedBid, campaignId)
      alert(`AI Suggestion:\nChannel: ${result.channel}\nMessage: ${result.message}`)
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleLaunch(campaignId: string) {
    if (!selectedBid) return
    try {
      const result = await launchCampaign(selectedBid, campaignId)
      alert(`Launched! ${result.recipientsCreated} recipients. Status: ${result.status}`)
      const camps = await listCampaigns(selectedBid)
      setCampaigns(camps)
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <div className="loading-page"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Campaigns</div>
        <div className="btn-group">
          {selectedBid && <Button variant="primary" onClick={() => setCreateOpen(true)}>+ New Campaign</Button>}
        </div>
      </div>

      <Card style={{ marginBottom: '1rem' }}>
        <Input label="Business" name="business" as="select" value={selectedBid} onChange={e => setSelectedBid(e.target.value)}>
          {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Input>
      </Card>

      {!selectedBid ? (
        <Card><div className="empty-state"><p>Select a business to view campaigns.</p></div></Card>
      ) : campaigns.length === 0 ? (
        <Card><div className="empty-state"><div className="empty-state-icon">◉</div><p>No campaigns yet.</p></div></Card>
      ) : (
        <div className="card-grid">
          {campaigns.map(c => (
            <div key={c.id} className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span className={`badge ${c.status === 'SENT' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span>
                <span className="badge">{c.channel}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{c.message}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                {c.segment?.name || '—'} · {c.segment?.audienceSize || '?'} recipients
              </div>
              <div className="btn-group">
                <Button size="sm" variant="accent" onClick={() => handleAiAssist(c.id)}>AI</Button>
                {c.status === 'DRAFT' && (
                  <Button size="sm" variant="primary" onClick={() => handleLaunch(c.id)}>Launch</Button>
                )}
                {c.status === 'SENT' && (
                  <Button size="sm" onClick={() => navigate(`/businesses/${selectedBid}/campaigns/${c.id}`)}>Analytics</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Campaign"
        footer={<div className="btn-group">
          <Button variant="primary" form="create-camp">Create</Button>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
        </div>}
      >
        <form id="create-camp" onSubmit={handleCreate}>
          <Input label="Segment" name="segmentId" as="select" required>
            {segments.map(s => <option key={s.id} value={s.id}>{s.name} ({s.audienceSize} customers)</option>)}
          </Input>
          <Input label="Channel" name="channel" as="select" required>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
            <option value="RCS">RCS</option>
          </Input>
          <Input label="Message" name="message" as="textarea" required placeholder="e.g. Enjoy 20% off your next coffee!" />
        </form>
      </Modal>
    </div>
  )
}
