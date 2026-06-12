export interface User {
  id: string
  email: string
  name: string
}

export type Channel = 'WHATSAPP' | 'EMAIL' | 'SMS' | 'RCS'

export interface Business {
  id: string
  userId: string
  name: string
  industry: string
  location?: string
  description?: string
  problem?: string
  goal?: string
  mode?: 'SELF' | 'AI'
  createdAt: string
  updatedAt: string
}

export interface UploadError {
  line: number
  field: string
  message: string
}

export interface UploadResult {
  fileType: 'CUSTOMERS' | 'ORDERS' | 'EVENTS'
  imported: number
  errors: UploadError[] | string[]
  productsCreated?: number
}

export interface DiscoveryResult {
  suggestedMetrics: { name: string; description: string }[]
  suggestedSegments: { name: string; description: string; rules: string }[]
  suggestedCampaigns: { name: string; description: string; channel: string; message: string }[]
}

export interface SegmentRule {
  field: string
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne'
  value: number | string
}

export interface Segment {
  id: string
  businessId: string
  name: string
  description?: string
  rulesJson: SegmentRule[]
  audienceSize: number
  createdAt: string
  updatedAt: string
}

export interface Campaign {
  id: string
  businessId: string
  segmentId: string
  channel: Channel
  message: string
  status: 'DRAFT' | 'SENT'
  segment?: { name: string; audienceSize: number }
  createdAt: string
  launchedAt?: string | null
  updatedAt: string
}

export interface CampaignAnalytics {
  campaignId: string
  sent: number
  delivered: number
  opened: number
  read: number
  clicked: number
  failed: number
}

export interface RecipientInfo {
  customerId: string
  customerName: string
  email?: string
  phone?: string
  status: string
  updatedAt: string
}

export interface AttributionEntry {
  orderId: string
  customerId: string
  customerName: string
  revenue: number
  attributedAt: string
}

export interface AttributionListResponse {
  campaignId: string
  attributedOrders: AttributionEntry[]
  totalRevenue: number
  totalOrders: number
}

export interface CampaignDetails {
  id: string
  channel: string
  message: string
  status: string
  launchedAt: string | null
  createdAt: string
  segment: {
    id: string
    name: string
    description?: string
    audienceSize: number
  }
  analytics: CampaignAnalytics
  recipients: RecipientInfo[]
  attribution?: AttributionListResponse
}

export interface CampaignInsights {
  summary: string
  findings: string[]
  recommendations: string[]
}

export interface AutoPipelineResult {
  metricsUpdated: number
  segmentsCreated: { id: string; name: string; audienceSize: number }[]
  campaignsCreated: { id: string; name: string; channel: string; message: string }[]
}

export interface InsightPipelineResult {
  summary: string
  segmentsCreated: { id: string; name: string; audienceSize: number }[]
  campaignsCreated: { id: string; name: string; channel: string; message: string }[]
}

export interface DashboardSummary {
  totalCustomers: number
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  totalProducts: number
  totalCampaigns: number
  totalSegments: number
  totalEvents: number
}

export interface CampaignPerformance {
  totalSent: number
  totalDelivered: number
  totalOpened: number
  totalRead: number
  totalClicked: number
  totalFailed: number
  overallOpenRate: number
  overallCtr: number
}

export interface CustomerGrowth {
  total: number
  repeatCustomers: number
  repeatRate: number
  signupsByMonth: { month: string; count: number }[]
}

export interface RevenueBreakdown {
  total: number
  campaignAttributed: number
  campaignAttributedPercent: number
}

export interface OrdersOverTime {
  month: string
  count: number
  revenue: number
}

export interface TopProduct {
  name: string
  category: string
  orders: number
  revenue: number
}

export interface ChannelBreakdown {
  channel: string
  sent: number
  opened: number
  openRate: number
}

export interface SegmentSize {
  name: string
  size: number
}

export interface RecentCampaign {
  id: string
  channel: string
  status: string
  message: string
  sent: number
  delivered: number
  opened: number
  read: number
  clicked: number
  failed: number
  launchedAt: string
}

export interface DashboardData {
  summary: DashboardSummary
  campaignPerformance: CampaignPerformance
  customerGrowth: CustomerGrowth
  revenueBreakdown: RevenueBreakdown
  ordersOverTime: OrdersOverTime[]
  topProducts: TopProduct[]
  channelBreakdown: ChannelBreakdown[]
  segmentSizes: SegmentSize[]
  recentCampaigns: RecentCampaign[]
}

export interface AuthResponse {
  token: string
  user: User
}
