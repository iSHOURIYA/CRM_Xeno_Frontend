import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getBusiness, discoverBusiness, runMetrics, updateBusiness, runAutoPipeline, deleteBusiness } from '../api/businesses'
import { uploadCustomers, uploadOrders, uploadEvents } from '../api/uploads'
import type { Business, DiscoveryResult, UploadResult, UploadError, AutoPipelineResult } from '../types'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Input } from '../components/Input'
import { FileUpload } from '../components/FileUpload'
import { Modal } from '../components/Modal'
import { listSegments, createSegment, aiSuggestSegment } from '../api/segments'
import { listCampaigns, createCampaign, aiAssistCampaign, launchCampaign } from '../api/campaigns'
import type { Segment, Campaign } from '../types'

const selfSteps = [
  { label: 'Create Business', key: 'create' },
  { label: 'Upload Data', key: 'upload' },
  { label: 'AI Discovery', key: 'discover' },
  { label: 'Metrics', key: 'metrics' },
  { label: 'Segments', key: 'segments' },
  { label: 'Campaigns', key: 'campaigns' },
  { label: 'Launch', key: 'launch' },
]

const aiSteps = [
  { label: 'Create Business', key: 'create' },
  { label: 'Upload Data', key: 'upload' },
  { label: 'Auto Pipeline', key: 'pipeline' },
  { label: 'Review & Launch', key: 'launch' },
]

export function BusinessDetail() {
  const { businessId } = useParams<{ businessId: string }>()
  const navigate = useNavigate()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [discovery, setDiscovery] = useState<DiscoveryResult | null>(null)
  const [segments, setSegments] = useState<Segment[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [uploadType, setUploadType] = useState<'customers' | 'orders' | 'events'>('customers')
  const [uploading, setUploading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [editOpen, setEditOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiSegment, setAiSegment] = useState<any>(null)
  const [aiSegLoading, setAiSegLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [pipelineResult, setPipelineResult] = useState<AutoPipelineResult | null>(null)
  const [pipelineLoading, setPipelineLoading] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [createCampaignOpen, setCreateCampaignOpen] = useState(false)
  const [campaignChannel, setCampaignChannel] = useState<string>('WHATSAPP')
  const [campaignMessage, setCampaignMessage] = useState<string>('')

  const isAiMode = business?.mode === 'AI'
  const steps = isAiMode ? aiSteps : selfSteps

  useEffect(() => {
    if (!businessId) return
    Promise.all([
      getBusiness(businessId),
      listSegments(businessId),
      listCampaigns(businessId),
    ])
      .then(([biz, segs, camps]) => {
        setBusiness(biz)
        setSegments(segs)
        setCampaigns(camps)
      })
      .catch(() => navigate('/businesses'))
      .finally(() => setLoading(false))
  }, [businessId])

  async function handleUpload(file: File) {
    if (!businessId) return
    setUploading(true)
    setUploadResult(null)
    try {
      let result: UploadResult
      if (uploadType === 'customers') result = await uploadCustomers(businessId, file)
      else if (uploadType === 'orders') result = await uploadOrders(businessId, file)
      else result = await uploadEvents(businessId, file)
      setUploadResult(result)
    } catch (err: any) {
      setUploadResult({ fileType: uploadType.toUpperCase() as any, imported: 0, errors: [err.message] })
    } finally {
      setUploading(false)
    }
  }

  async function handleAutoPipeline() {
    if (!businessId) return
    setPipelineLoading(true)
    setPipelineResult(null)
    try {
      const result = await runAutoPipeline(businessId)
      setPipelineResult(result)
      const [segs, camps] = await Promise.all([
        listSegments(businessId),
        listCampaigns(businessId),
      ])
      setSegments(segs)
      setCampaigns(camps)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setPipelineLoading(false)
    }
  }

  async function handleDiscover() {
    if (!businessId) return
    const result = await discoverBusiness(businessId)
    setDiscovery(result)
  }

  async function handleRunMetrics() {
    if (!businessId) return
    await runMetrics(businessId)
  }

  async function handleAiSegment() {
    if (!businessId || !aiPrompt) return
    setAiSegLoading(true)
    try {
      const result = await aiSuggestSegment(businessId, aiPrompt)
      setAiSegment(result)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setAiSegLoading(false)
    }
  }

  async function handleSaveAiSegment() {
    if (!businessId || !aiSegment) return
    setCreating(true)
    try {
      await createSegment(businessId, aiSegment)
      setAiSegment(null)
      setAiPrompt('')
      const segs = await listSegments(businessId)
      setSegments(segs)
    } catch (err: any) {
      alert(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function handleAiAssist(campaignId: string) {
    if (!businessId) return
    try {
      const result = await aiAssistCampaign(businessId, campaignId)
      alert(`AI Suggestion:\nChannel: ${result.channel}\nMessage: ${result.message}`)
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleLaunch(campaignId: string) {
    if (!businessId) return
    try {
      const result = await launchCampaign(businessId, campaignId)
      alert(`Launched! ${result.recipientsCreated} recipients created. Status: ${result.status}`)
      const camps = await listCampaigns(businessId)
      setCampaigns(camps)
    } catch (err: any) {
      alert(err.message)
    }
  }

  async function handleDelete() {
    if (!businessId) return
    try {
      await deleteBusiness(businessId)
      navigate('/businesses')
    } catch (err: any) {
      alert(err.message)
    }
  }

  function completeStep(step: number) {
    if (step > currentStep) setCurrentStep(step)
  }

  function renderUploadErrors(errors: UploadError[] | string[]) {
    if (errors.length === 0) return null
    if (typeof errors[0] === 'string') {
      return (
        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
          {(errors as string[]).map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )
    }
    return (
      <ul style={{ marginTop: '0.5rem', paddingLeft: '1.25rem' }}>
        {(errors as UploadError[]).map((e, i) => (
          <li key={i}>Line {e.line}: <strong>{e.field}</strong> — {e.message}</li>
        ))}
      </ul>
    )
  }

  if (loading || !business) return <div className="loading-page"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">{business.name}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {business.industry} {business.location ? `· ${business.location}` : ''}
            <span style={{ marginLeft: '0.75rem' }}>
              <span className={`badge ${isAiMode ? 'badge-success' : ''}`}>
                {business.mode || 'SELF'} mode
              </span>
            </span>
          </div>
        </div>
        <div className="btn-group">
          <Button size="sm" onClick={() => setEditOpen(true)}>Edit</Button>
          <Button size="sm" variant="accent" onClick={() => setDeleteConfirmOpen(true)}>Delete</Button>
          <Button size="sm" to="/businesses">← Back</Button>
        </div>
      </div>

      {/* Steps */}
      <div className="steps" style={{ marginBottom: '1.5rem' }}>
        {steps.map((s, i) => (
          <span key={s.key} className={`step ${i < currentStep ? 'completed' : i === currentStep ? 'active' : ''}`}>
            <span className="step-number">{i < currentStep ? '✓' : i + 1}</span>
            {s.label}
            {i < steps.length - 1 && <span className="step-arrow">→</span>}
          </span>
        ))}
      </div>

      {/* Business Info */}
      <Card title="Business Details" style={{ marginBottom: '1rem' }}>
        <div className="detail-grid">
          <div><div className="detail-item-label">Name</div><div className="detail-item-value">{business.name}</div></div>
          <div><div className="detail-item-label">Industry</div><div className="detail-item-value">{business.industry}</div></div>
          <div><div className="detail-item-label">Location</div><div className="detail-item-value">{business.location || '—'}</div></div>
          <div><div className="detail-item-label">Problem</div><div className="detail-item-value">{business.problem || '—'}</div></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="detail-item-label">Goal</div>
            <div className="detail-item-value">{business.goal || '—'}</div>
          </div>
        </div>
      </Card>

      {/* AI Mode info banner */}
      {/* Upload Data */}
      <Card title="Upload CSV Data" style={{ marginBottom: '1rem' }}>
        <div className="btn-group" style={{ marginBottom: '1rem' }}>
          {(['customers', 'orders', 'events'] as const).map(t => (
            <Button key={t} size="sm" variant={uploadType === t ? 'primary' : 'default'} onClick={() => { setUploadType(t); setUploadResult(null) }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Button>
          ))}
        </div>
        <FileUpload key={uploadType} onUpload={handleUpload} loading={uploading} />
        {uploadResult && (
          <div style={{ marginTop: '1rem' }}>
            <div className={`alert ${uploadResult.errors.length > 0 ? 'alert-error' : 'alert-success'}`}>
              <strong>{uploadResult.fileType}</strong>: {uploadResult.imported} records imported
              {uploadResult.productsCreated != null && ` · ${uploadResult.productsCreated} products created`}
              {renderUploadErrors(uploadResult.errors)}
            </div>
            {uploadResult.errors.length === 0 && !isAiMode && (
              <Button size="sm" variant="primary" onClick={() => completeStep(2)}>Mark step complete →</Button>
            )}
          </div>
        )}
        {pipelineLoading && (
          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div className="spinner" /> Auto-pipeline running...
          </div>
        )}
        {pipelineResult && !pipelineLoading && isAiMode && (
          <div className="alert alert-success" style={{ marginTop: '1rem' }}>
            <strong>Pipeline Complete</strong>
            <div style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
              • {pipelineResult.metricsUpdated} customers updated
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              • {pipelineResult.segmentsCreated.length} segments created
            </div>
            <div style={{ fontSize: '0.85rem' }}>
              • {pipelineResult.campaignsCreated.length} campaigns drafted
            </div>
          </div>
        )}
      </Card>

      {/* SELF mode: Metrics Engine */}
      {!isAiMode && (
        <Card title="AI Discovery" style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Analyze your business data and get AI-powered suggestions.
          </p>
          {!discovery ? (
            <div className="btn-group">
              <Button variant="accent" onClick={handleDiscover}>Run Discovery ↳</Button>
            </div>
          ) : (
            <div>
              <div className="alert alert-success">Discovery complete!</div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Suggested Metrics ({discovery.suggestedMetrics.length})</div>
                {discovery.suggestedMetrics.map((m, i) => (
                  <div key={i} style={{ fontSize: '0.85rem', padding: '0.25rem 0' }}>• <strong>{m.name}</strong>: {m.description}</div>
                ))}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Suggested Segments ({discovery.suggestedSegments.length})</div>
                {discovery.suggestedSegments.map((s, i) => (
                  <div key={i} style={{ fontSize: '0.85rem', padding: '0.25rem 0' }}>• <strong>{s.name}</strong>: {s.description}</div>
                ))}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Suggested Campaigns ({discovery.suggestedCampaigns.length})</div>
                {discovery.suggestedCampaigns.map((c, i) => (
                  <div key={i} style={{ fontSize: '0.85rem', padding: '0.25rem 0' }}>• <strong>{c.name}</strong> ({c.channel}): {c.message}</div>
                ))}
              </div>
              <Button size="sm" variant="primary" onClick={() => completeStep(3)}>Mark step complete →</Button>
            </div>
          )}
        </Card>
      )}

      {/* Auto Pipeline */}
      <Card title={isAiMode ? "Analyze" : "Auto Pipeline (One-Shot)"} style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          {isAiMode
            ? "Upload all CSVs first, then run the full pipeline: metrics → AI discovery → segments → campaigns."
            : "Run the full pipeline in one click: metrics → discovery → segments → campaigns."}
        </p>
          {pipelineResult ? (
            <div>
              <div className="alert alert-success">
                <strong>Pipeline Complete</strong>
                <div style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
                  • {pipelineResult.metricsUpdated} customers updated
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  • {pipelineResult.segmentsCreated.length} segments created
                </div>
                <div style={{ fontSize: '0.85rem' }}>
                  • {pipelineResult.campaignsCreated.length} campaigns drafted
                </div>
              </div>
              {pipelineResult.segmentsCreated.length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Segments</div>
                  {pipelineResult.segmentsCreated.map(s => (
                    <div key={s.id} style={{ fontSize: '0.8rem' }}>• {s.name} ({s.audienceSize} customers)</div>
                  ))}
                </div>
              )}
              {pipelineResult.campaignsCreated.length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Campaigns</div>
                  {pipelineResult.campaignsCreated.map(c => (
                    <div key={c.id} style={{ fontSize: '0.8rem' }}>• {c.name} ({c.channel}): {c.message}</div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Button variant="accent" onClick={handleAutoPipeline} disabled={pipelineLoading}>
              {pipelineLoading ? 'Running...' : 'Run Full Pipeline ↳'}
            </Button>
          )}
        </Card>

      {/* SELF mode: Metrics Engine */}
      {!isAiMode && (
        <Card title="Metrics Engine" style={{ marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Compute customer profiles: total orders, spend, last purchase, and more.
          </p>
          <Button variant="accent" onClick={handleRunMetrics}>Run Metrics ↳</Button>
          <div style={{ marginTop: '0.75rem' }}>
            <Button size="sm" variant="primary" onClick={() => completeStep(4)}>Mark step complete →</Button>
          </div>
        </Card>
      )}

      {/* Segments */}
      <Card title="Segments" style={{ marginBottom: '1rem' }} actions={
        !isAiMode && (
          <Button size="sm" onClick={handleAiSegment} disabled={aiSegLoading || !aiPrompt}>
            {aiSegLoading ? '...' : 'AI Suggest'}
          </Button>
        )
      }>
        {/* AI Segment Creator (SELF mode) */}
        {!isAiMode && (
          <>
            <Input label="AI Segment Prompt" name="ai-prompt" placeholder='e.g. "Find customers who used to buy frequently but disappeared recently"' value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} />
            {aiSegment && (
              <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 600 }}>{aiSegment.name}</div>
                <div style={{ fontSize: '0.85rem' }}>{aiSegment.description}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Rules: {aiSegment.rules.map((r: any) => `${r.field} ${r.operator} ${r.value}`).join(', ')}
                </div>
                <div className="btn-group" style={{ marginTop: '0.5rem' }}>
                  <Button size="sm" variant="primary" onClick={handleSaveAiSegment} disabled={creating}>
                    {creating ? 'Saving...' : 'Save Segment'}
                  </Button>
                  <Button size="sm" onClick={() => setAiSegment(null)}>Dismiss</Button>
                </div>
              </div>
            )}
          </>
        )}

        {segments.length === 0 ? (
          <div className="empty-state" style={{ padding: '1rem' }}>
            <p style={{ fontSize: '0.85rem' }}>No segments yet. {isAiMode ? 'Run the pipeline to auto-generate.' : 'Create one manually or use AI.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {segments.map(s => (
              <div key={s.id} style={{ padding: '0.75rem', border: '2px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {s.description} · {s.audienceSize} customers
                  </div>
                </div>
                <div className="badge">{s.audienceSize}</div>
              </div>
            ))}
          </div>
        )}
        {!isAiMode && (
          <div style={{ marginTop: '0.75rem' }}>
            <Button size="sm" variant="primary" onClick={() => completeStep(5)}>Mark step complete →</Button>
          </div>
        )}
      </Card>

      {/* Campaigns */}
      <Card title="Campaigns" style={{ marginBottom: '1rem' }} actions={
        segments.length > 0 && !isAiMode && (
          <Button size="sm" onClick={() => { setCampaignChannel('WHATSAPP'); setCampaignMessage(''); setCreateCampaignOpen(true) }}>+ Campaign</Button>
        )
      }>
        {campaigns.length === 0 ? (
          <div className="empty-state" style={{ padding: '1rem' }}>
            <p style={{ fontSize: '0.85rem' }}>No campaigns yet. {isAiMode ? 'Run the pipeline to auto-generate.' : 'Create one after adding segments.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {campaigns.map(c => (
              <div key={c.id} style={{ padding: '0.75rem', border: '2px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.message}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {c.channel} · {c.segment?.name || '—'} · {c.segment?.audienceSize || '?'} recipients
                    </div>
                  </div>
                  <span className={`badge ${c.status === 'SENT' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span>
                </div>
                <div className="btn-group">
                  <Button size="sm" variant="accent" onClick={() => handleAiAssist(c.id)}>AI Assist</Button>
                  {c.status === 'DRAFT' && (
                    <Button size="sm" variant="primary" onClick={() => handleLaunch(c.id)}>Launch</Button>
                  )}
                  {c.status === 'SENT' && (
                    <Button size="sm" onClick={() => navigate(`/businesses/${businessId}/campaigns/${c.id}`)}>Results</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {!isAiMode && (
          <div style={{ marginTop: '0.75rem' }}>
            <Button size="sm" variant="primary" onClick={() => completeStep(6)}>Mark step complete →</Button>
          </div>
        )}
      </Card>

      {/* Create Campaign Modal */}
      <Modal open={createCampaignOpen} onClose={() => setCreateCampaignOpen(false)} title="Create Campaign"
        footer={
          <div className="btn-group">
            <Button variant="primary" onClick={async () => {
              if (!businessId || !segments[0]) return
              try {
                await createCampaign(businessId, { segmentId: segments[0].id, channel: campaignChannel, message: campaignMessage })
                setCreateCampaignOpen(false)
                const camps = await listCampaigns(businessId)
                setCampaigns(camps)
              } catch (err: any) { alert(err.message) }
            }}>Create</Button>
            <Button onClick={() => setCreateCampaignOpen(false)}>Cancel</Button>
          </div>
        }
      >
        <Input label="Channel" name="channel" as="select" value={campaignChannel} onChange={e => setCampaignChannel(e.target.value)}>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="EMAIL">Email</option>
          <option value="SMS">SMS</option>
          <option value="RCS">RCS</option>
        </Input>
        <Input label="Segment" name="segment" as="select" value={segments[0]?.id} disabled>
          {segments.map(s => <option key={s.id} value={s.id}>{s.name} ({s.audienceSize})</option>)}
        </Input>
        <Input label="Message" name="message" as="textarea" required value={campaignMessage} onChange={e => setCampaignMessage(e.target.value)} placeholder="e.g. Enjoy 20% off your next coffee!" />
      </Modal>

      {/* Edit Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Business"
        footer={
          <div className="btn-group">
            <Button variant="primary" form="edit-form">Save</Button>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          </div>
        }
      >
        <form id="edit-form" onSubmit={async (e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget)
          try {
            await updateBusiness(businessId!, {
              name: form.get('name') as string,
              industry: form.get('industry') as string,
              location: form.get('location') as string,
              description: form.get('description') as string,
              problem: form.get('problem') as string,
              goal: form.get('goal') as string,
              mode: form.get('mode') as 'SELF' | 'AI',
            })
            const updated = await getBusiness(businessId!)
            setBusiness(updated)
            setEditOpen(false)
          } catch (err: any) { alert(err.message) }
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
            <Input label="Name" name="name" defaultValue={business.name} />
            <Input label="Industry" name="industry" defaultValue={business.industry} />
            <Input label="Location" name="location" defaultValue={business.location || ''} />
            <Input label="Problem" name="problem" defaultValue={business.problem || ''} />
          </div>
          <Input label="Description" name="description" as="textarea" defaultValue={business.description || ''} />
          <Input label="Goal" name="goal" as="textarea" defaultValue={business.goal || ''} />
          <Input label="Mode" name="mode" as="select" defaultValue={business.mode || 'SELF'}>
            <option value="SELF">SELF — Manual</option>
            <option value="AI">AI — Automated</option>
          </Input>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title="Delete Business"
        footer={
          <div className="btn-group">
            <Button variant="accent" onClick={handleDelete}>Permanently Delete</Button>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          </div>
        }
      >
        <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
          Are you sure you want to delete <strong>{business.name}</strong>?
        </p>
        <div className="alert alert-error" style={{ marginTop: '0.75rem' }}>
          ⚠️ This action is irreversible. All customer data, order history, segments, and campaigns will be permanently removed.
        </div>
      </Modal>
    </div>
  )
}
