import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBusiness, getDashboard, listBusinesses } from '../api/businesses'
import type { DashboardData, Business } from '../types'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'

function HBar({ value, max, label, color }: { value: number; max: number; label: string; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.15rem' }}>
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{value}</span>
      </div>
      <div style={{ height: '14px', background: 'var(--bg)', border: '2px solid var(--border-strong)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color || 'var(--accent)', transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

function Donut({ pct, label }: { pct: number; label: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        width: '100px', height: '100px', borderRadius: '50%',
        background: `conic-gradient(var(--accent) 0% ${pct}%, var(--bg) ${pct}% 100%)`,
        border: '3px solid var(--border-strong)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '1.1rem', fontFamily: 'var(--font-mono)',
        }}>{pct}%</div>
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>{label}</div>
    </div>
  )
}

export function Analytics() {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBid, setSelectedBid] = useState(businessId || '')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    listBusinesses().then(setBusinesses).catch(() => {})
  }, [])

  useEffect(() => {
    const bid = businessId || selectedBid
    if (!bid) { setLoading(false); return }
    setLoading(true)
    Promise.all([
      getBusiness(bid),
      getDashboard(bid),
    ])
      .then(([biz, d]) => { setBusiness(biz); setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [businessId, selectedBid])

  async function handleRefresh() {
    const bid = businessId || selectedBid
    if (!bid) return
    setRefreshing(true)
    try { setData(await getDashboard(bid)) } catch { /* */ }
    finally { setRefreshing(false) }
  }

  function handleBusinessChange(bid: string) {
    setSelectedBid(bid)
    if (businessId) navigate(`/businesses/${bid}/analytics`)
  }

  const bid = businessId || selectedBid

  if (!bid) {
    return (
      <div>
        <div className="page-header"><div className="page-title">Analytics</div></div>
        <Card>
          <Input label="Business" name="business" as="select" value="" onChange={e => handleBusinessChange(e.target.value)}>
            <option value="">Select a business...</option>
            {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Input>
        </Card>
      </div>
    )
  }

  if (loading) return <div className="loading-page"><div className="spinner" /></div>
  if (!data || !business) {
    return (
      <div>
        <div className="page-header"><div className="page-title">Analytics</div></div>
        <Card>
          <Input label="Business" name="business" as="select" value={bid} onChange={e => handleBusinessChange(e.target.value)}>
            {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Input>
        </Card>
      </div>
    )
  }

  const { summary, campaignPerformance, customerGrowth, revenueBreakdown, ordersOverTime, topProducts, channelBreakdown, segmentSizes, recentCampaigns } = data
  const maxOrderCount = Math.max(...ordersOverTime.map(o => o.count), 1)
  const maxRevenue = Math.max(...ordersOverTime.map(o => o.revenue), 1)
  const maxProductOrders = Math.max(...topProducts.map(p => p.orders), 1)
  const maxSegmentSize = Math.max(...segmentSizes.map(s => s.size), 1)

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Analytics</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {business.name} · {business.industry}
          </div>
        </div>
        <div className="btn-group">
          <Button size="sm" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? '⟳ Refreshing...' : '⟳ Refresh'}
          </Button>
          <Button size="sm" to={`/businesses/${bid}`}>← Business</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Card title="Overview" style={{ marginBottom: '1rem' }}>
        <div className="card-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
          {[
            { label: 'Customers', value: summary.totalCustomers.toLocaleString() },
            { label: 'Orders', value: summary.totalOrders.toLocaleString() },
            { label: 'Revenue', value: `₹${summary.totalRevenue.toLocaleString()}` },
            { label: 'AOV', value: `₹${summary.averageOrderValue}` },
            { label: 'Products', value: summary.totalProducts },
            { label: 'Campaigns', value: summary.totalCampaigns },
            { label: 'Segments', value: summary.totalSegments },
            { label: 'Events', value: summary.totalEvents },
          ].map(k => (
            <div key={k.label} className="stat-card" style={{ padding: '0.9rem', textAlign: 'center' }}>
              <div className="stat-label" style={{ marginBottom: '0.15rem' }}>{k.label}</div>
              <div className="stat-value" style={{ fontSize: '1.25rem' }}>{k.value}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="chart-grid">
        {/* Campaign Performance Funnel */}
        <Card title="Campaign Performance">
          {[
            { label: 'Sent', value: campaignPerformance.totalSent, color: 'var(--border-strong)' },
            { label: 'Delivered', value: campaignPerformance.totalDelivered, color: '#2d6a4f' },
            { label: 'Opened', value: campaignPerformance.totalOpened, color: '#1e8449' },
            { label: 'Read', value: campaignPerformance.totalRead, color: '#1a9e5c' },
            { label: 'Clicked', value: campaignPerformance.totalClicked, color: '#16a34a' },
            { label: 'Failed', value: campaignPerformance.totalFailed, color: 'var(--danger)' },
          ].map(s => (
            <HBar key={s.label} label={s.label} value={s.value} max={campaignPerformance.totalSent || 1} color={s.color} />
          ))}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span>Open Rate: <strong style={{ color: 'var(--text)' }}>{campaignPerformance.overallOpenRate}%</strong></span>
            <span>CTR: <strong style={{ color: 'var(--text)' }}>{campaignPerformance.overallCtr}%</strong></span>
          </div>
        </Card>

        {/* Customer Growth */}
        <Card title="Customer Growth">
          <div className="chart-grid" style={{ marginBottom: '1rem' }}>
            <div className="stat-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
              <div className="stat-label">Total</div>
              <div className="stat-value" style={{ fontSize: '1.25rem' }}>{customerGrowth.total.toLocaleString()}</div>
            </div>
            <div className="stat-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
              <div className="stat-label">Repeat Rate</div>
              <div className="stat-value" style={{ fontSize: '1.25rem' }}>{customerGrowth.repeatRate}%</div>
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Signups by Month</div>
          {customerGrowth.signupsByMonth.slice(-6).map(m => (
            <HBar key={m.month} label={m.month} value={m.count} max={Math.max(...customerGrowth.signupsByMonth.map(x => x.count), 1)} color="var(--accent)" />
          ))}
        </Card>
      </div>

      <div className="chart-grid">
        {/* Revenue Breakdown */}
        <Card title="Revenue Breakdown">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Donut pct={revenueBreakdown.campaignAttributedPercent} label="Campaign Attributed" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Revenue</span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)' }}>₹{revenueBreakdown.total.toLocaleString()}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Campaign Attributed</span>
                  <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>₹{revenueBreakdown.campaignAttributed.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Channel Breakdown */}
        <Card title="Channel Performance">
          {channelBreakdown.map(ch => (
            <div key={ch.channel} style={{ marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                <span>{ch.channel}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>{ch.openRate}% open</span>
              </div>
              <div style={{ height: '12px', background: 'var(--bg)', border: '2px solid var(--border-strong)', borderRadius: 'var(--radius)', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${(ch.opened / Math.max(ch.sent, 1)) * 100}%`, height: '100%', background: 'var(--accent)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                <span>{ch.sent} sent</span>
                <span>{ch.opened} opened</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Orders Over Time */}
      <Card title="Orders Over Time" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginBottom: '0.75rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--border-strong)', marginRight: 4 }} /> Orders</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--accent)', marginRight: 4 }} /> Revenue</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '150px', padding: '0 0.25rem' }}>
          {ordersOverTime.map(o => (
            <div key={o.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '120px', width: '100%' }}>
                <div style={{
                  flex: 1, background: 'var(--border-strong)',
                  height: `${(o.count / maxOrderCount) * 100}%`,
                  border: '2px solid var(--border-strong)', borderBottom: 'none',
                  borderRadius: '2px 2px 0 0', minHeight: '4px',
                }} />
                <div style={{
                  flex: 1, background: 'var(--accent)',
                  height: `${(o.revenue / maxRevenue) * 100}%`,
                  border: '2px solid var(--accent)', borderBottom: 'none',
                  borderRadius: '2px 2px 0 0', minHeight: '4px', opacity: 0.7,
                }} />
              </div>
              <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '0.25rem', whiteSpace: 'nowrap' }}>{o.month}</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="chart-grid">
        <Card title="Top Products">
          {topProducts.slice(0, 7).map(p => (
            <div key={p.name} style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.15rem' }}>
                <span style={{ fontWeight: 500 }}>{p.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{p.orders} orders</span>
              </div>
              <div style={{ height: '10px', background: 'var(--bg)', border: '2px solid var(--border-strong)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                <div style={{ width: `${(p.orders / maxProductOrders) * 100}%`, height: '100%', background: 'var(--border-strong)' }} />
              </div>
            </div>
          ))}
        </Card>

        <Card title="Segment Sizes">
          {segmentSizes.map(s => (
            <HBar key={s.name} label={s.name} value={s.size} max={maxSegmentSize} color="var(--accent)" />
          ))}
          {segmentSizes.length === 0 && (
            <div className="empty-state" style={{ padding: '1rem' }}><p style={{ fontSize: '0.85rem' }}>No segments created yet.</p></div>
          )}
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card title="Recent Campaigns">
        {recentCampaigns.length === 0 ? (
          <div className="empty-state" style={{ padding: '1rem' }}><p style={{ fontSize: '0.85rem' }}>No campaigns launched yet.</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Ch</th>
                  <th>Sent</th>
                  <th>Dlv</th>
                  <th>Opn</th>
                  <th>Read</th>
                  <th>Clk</th>
                  <th>Fail</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentCampaigns.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500, fontSize: '0.8rem', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.message}</td>
                    <td><span className="badge" style={{ fontSize: '0.6rem' }}>{c.channel}</span></td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{c.sent}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{c.delivered}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{c.opened}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{c.read}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{c.clicked}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--danger)' }}>{c.failed}</td>
                    <td><Button size="sm" onClick={() => navigate(`/businesses/${bid}/campaigns/${c.id}`)}>→</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
