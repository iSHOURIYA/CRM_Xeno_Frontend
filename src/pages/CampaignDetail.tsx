import { useState, useEffect, type FormEvent } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getCampaignDetails, getCampaignInsights, aiAssistCampaign, launchCampaign, runInsightPipeline, createAttribution, getAttributionList } from '../api/campaigns'
import type { CampaignDetails as CampaignDetailsType, CampaignInsights, InsightPipelineResult, AttributionListResponse } from '../types'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { Modal } from '../components/Modal'

export function CampaignDetail() {
  const { businessId, campaignId } = useParams<{ businessId: string; campaignId: string }>()
  const navigate = useNavigate()
  const [details, setDetails] = useState<CampaignDetailsType | null>(null)
  const [insights, setInsights] = useState<CampaignInsights | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [insightPipelineResult, setInsightPipelineResult] = useState<InsightPipelineResult | null>(null)
  const [insightPipelineLoading, setInsightPipelineLoading] = useState(false)
  const [attribution, setAttribution] = useState<AttributionListResponse | null>(null)
  const [attributionOpen, setAttributionOpen] = useState(false)
  const [attributing, setAttributing] = useState(false)

  async function loadData() {
    if (!businessId || !campaignId) return
    const [det, ins, attr] = await Promise.all([
      getCampaignDetails(businessId, campaignId),
      getCampaignInsights(businessId, campaignId).catch(() => null),
      getAttributionList(businessId, campaignId).catch(() => null),
    ])
    setDetails(det)
    setInsights(ins)
    setAttribution(attr || det.attribution || null)
  }

  useEffect(() => {
    if (!businessId || !campaignId) return
    loadData()
      .catch(() => navigate(`/businesses/${businessId}`))
      .finally(() => setLoading(false))
  }, [businessId, campaignId])

  async function handleRefresh() {
    setRefreshing(true)
    try {
      await loadData()
    } catch { /* ignore */ }
    finally { setRefreshing(false) }
  }

  async function handleAiAssist() {
    if (!businessId || !campaignId) return
    try {
      const result = await aiAssistCampaign(businessId, campaignId)
      alert(`AI Suggestion:\nChannel: ${result.channel}\nMessage: ${result.message}`)
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleLaunch() {
    if (!businessId || !campaignId) return
    try {
      const result = await launchCampaign(businessId, campaignId)
      alert(`Launched! ${result.recipientsCreated} recipients.`)
      const det = await getCampaignDetails(businessId, campaignId)
      setDetails(det)
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleInsightPipeline() {
    if (!businessId || !campaignId) return
    setInsightPipelineLoading(true)
    setInsightPipelineResult(null)
    try {
      const result = await runInsightPipeline(businessId, campaignId)
      setInsightPipelineResult(result)
      const det = await getCampaignDetails(businessId, campaignId)
      setDetails(det)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setInsightPipelineLoading(false)
    }
  }

  async function handleAttribution(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!businessId || !campaignId) return
    setAttributing(true)
    const form = new FormData(e.currentTarget)
    try {
      await createAttribution(businessId, campaignId, {
        orderId: form.get('orderId') as string,
        customerId: form.get('customerId') as string,
        revenue: Number(form.get('revenue')),
      })
      setAttributionOpen(false)
      const attr = await getAttributionList(businessId, campaignId)
      setAttribution(attr)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setAttributing(false)
    }
  }

  if (loading || !details) return <div className="loading-page"><div className="spinner" /></div>

  const { analytics } = details

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Campaign Details</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {details.channel}
          </div>
        </div>
        <div className="btn-group">
          <Button size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
          </Button>
          <Button size="sm" variant="accent" onClick={handleAiAssist}>AI Assist</Button>
          {details.status === 'SENT' && (
            <Button size="sm" variant="primary" onClick={handleInsightPipeline} disabled={insightPipelineLoading}>
              {insightPipelineLoading ? 'Analyzing...' : 'Insight Pipeline'}
            </Button>
          )}
          {details.status === 'DRAFT' && (
            <Button size="sm" variant="primary" onClick={handleLaunch}>Launch Campaign</Button>
          )}
          <Button size="sm" to={`/businesses/${businessId}`}>← Back</Button>
        </div>
      </div>

      {/* Campaign Info */}
      <Card title="Campaign" style={{ marginBottom: '1rem' }}>
        <div className="detail-grid">
          <div>
            <div className="detail-item-label">Status</div>
            <div className="detail-item-value">
              <span className={`badge ${details.status === 'SENT' ? 'badge-success' : 'badge-warning'}`}>
                {details.status}
              </span>
            </div>
          </div>
          <div>
            <div className="detail-item-label">Channel</div>
            <div className="detail-item-value">{details.channel}</div>
          </div>
          <div>
            <div className="detail-item-label">Segment</div>
            <div className="detail-item-value">{details.segment?.name || '—'}</div>
          </div>
          <div>
            <div className="detail-item-label">Audience Size</div>
            <div className="detail-item-value">{details.segment?.audienceSize || '—'}</div>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="detail-item-label">Message</div>
            <div className="detail-item-value" style={{ fontStyle: 'italic' }}>"{details.message}"</div>
          </div>
        </div>
      </Card>

      {/* Analytics */}
      {analytics && (
        <Card title="Analytics" style={{ marginBottom: '1rem' }}>
          <div className="card-grid">
            <div className="stat-card">
              <div className="stat-label">Sent</div>
              <div className="stat-value">{analytics.sent}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Delivered</div>
              <div className="stat-value">{analytics.delivered}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Opened</div>
              <div className="stat-value">{analytics.opened}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Read</div>
              <div className="stat-value">{analytics.read}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Clicked</div>
              <div className="stat-value">{analytics.clicked}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Failed</div>
              <div className="stat-value" style={{ color: 'var(--danger)' }}>{analytics.failed}</div>
            </div>
          </div>
        </Card>
      )}

      {/* Attribution */}
      {details.status === 'SENT' && (
        <Card title="Order Attribution" style={{ marginBottom: '1rem' }} actions={
          <Button size="sm" onClick={() => setAttributionOpen(true)}>+ Attribute Order</Button>
        }>
          {!attribution || attribution.attributedOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem' }}>
              <p style={{ fontSize: '0.85rem' }}>No orders attributed yet. Attribute a customer purchase to this campaign.</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="stat-card" style={{ flex: 1, padding: '0.75rem' }}>
                  <div className="stat-label">Attributed Orders</div>
                  <div className="stat-value" style={{ fontSize: '1.25rem' }}>{attribution.totalOrders}</div>
                </div>
                <div className="stat-card" style={{ flex: 1, padding: '0.75rem' }}>
                  <div className="stat-label">Revenue Attributed</div>
                  <div className="stat-value" style={{ fontSize: '1.25rem' }}>₹{attribution.totalRevenue}</div>
                </div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Revenue</th>
                      <th>Attributed At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attribution.attributedOrders.map(a => (
                      <tr key={a.orderId}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{a.orderId}</td>
                        <td>{a.customerName}</td>
                        <td>₹{a.revenue}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {new Date(a.attributedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Recipients */}
      {details.recipients && details.recipients.length > 0 && (
        <Card title={`Recipients (${details.recipients.length})`} style={{ marginBottom: '1rem' }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {details.recipients.map(r => (
                  <tr key={r.customerId}>
                    <td style={{ fontWeight: 500 }}>{r.customerName}</td>
                    <td style={{ fontSize: '0.8rem' }}>{r.email || '—'}</td>
                    <td style={{ fontSize: '0.8rem' }}>{r.phone || '—'}</td>
                    <td>
                      <span className={`badge ${
                        r.status === 'OPENED' || r.status === 'READ' ? 'badge-success' :
                        r.status === 'CLICKED' ? 'badge-success' :
                        r.status === 'FAILED' ? 'badge-danger' :
                        r.status === 'DELIVERED' ? 'badge-warning' : ''
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {new Date(r.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Status Legend */}
      <Card title="Recipient Status Reference" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {[
            { status: 'SENT', badge: '', desc: 'Handed off to channel service', detail: 'Immediately on launch' },
            { status: 'DELIVERED', badge: 'badge-warning', desc: 'Reached customer\'s device', detail: 'Provider confirms delivery' },
            { status: 'OPENED', badge: 'badge-success', desc: 'Customer opened/viewed', detail: 'First tap or open tracking' },
            { status: 'READ', badge: 'badge-success', desc: 'Customer read the content', detail: 'Blue double-tick / read receipt' },
            { status: 'CLICKED', badge: 'badge-success', desc: 'Customer clicked a link/CTA', detail: 'Link tracking in message' },
            { status: 'FAILED', badge: 'badge-danger', desc: 'Could not be delivered', detail: 'Invalid number, phone off, etc.' },
          ].map(s => (
            <div key={s.status} style={{
              padding: '0.65rem 0.75rem',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className={`badge ${s.badge}`} style={{ fontSize: '0.65rem' }}>{s.status}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{s.desc}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{s.detail}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Insight Pipeline Result */}
      {insightPipelineResult && (
        <Card title="Insight Pipeline Result" style={{ marginBottom: '1rem' }}>
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            <strong>{insightPipelineResult.summary}</strong>
          </div>
          {insightPipelineResult.segmentsCreated.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Segments Created</div>
              {insightPipelineResult.segmentsCreated.map(s => (
                <div key={s.id} style={{ fontSize: '0.85rem', padding: '0.25rem 0' }}>
                  • <strong>{s.name}</strong> ({s.audienceSize} customers)
                </div>
              ))}
            </div>
          )}
          {insightPipelineResult.campaignsCreated.length > 0 && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Follow-up Campaigns Created</div>
              {insightPipelineResult.campaignsCreated.map(c => (
                <div key={c.id} style={{ padding: '0.5rem', border: '2px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.channel}: {c.message}</div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* AI Insights */}
      {insights && (
        <Card title="AI Insights">
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Summary</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{insights.summary}</p>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Findings</div>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem' }}>
              {insights.findings.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Recommendations</div>
            <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem' }}>
              {insights.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </Card>
      )}

      {/* Attribution Modal */}
      <Modal open={attributionOpen} onClose={() => setAttributionOpen(false)} title="Attribute Order"
        footer={
          <div className="btn-group">
            <Button variant="primary" form="attr-form" disabled={attributing}>
              {attributing ? 'Attributing...' : 'Attribute'}
            </Button>
            <Button onClick={() => setAttributionOpen(false)}>Cancel</Button>
          </div>
        }
      >
        <form id="attr-form" onSubmit={handleAttribution}>
          <Input label="Order ID" name="orderId" required placeholder="e.g. ORD-ATTR-001" />
          <Input label="Customer ID" name="customerId" required placeholder="e.g. C003" />
          <Input label="Revenue" name="revenue" type="number" required placeholder="e.g. 450" />
        </form>
      </Modal>
    </div>
  )
}
