import { get, post } from './client'
import type { Campaign, CampaignAnalytics, CampaignInsights, CampaignDetails, InsightPipelineResult, AttributionListResponse } from '../types'

export function listCampaigns(businessId: string): Promise<Campaign[]> {
  return get(`/businesses/${businessId}/campaigns`)
}

export function getCampaign(businessId: string, campaignId: string): Promise<Campaign> {
  return get(`/businesses/${businessId}/campaigns/${campaignId}`)
}

export function createCampaign(businessId: string, data: {
  segmentId: string
  channel: string
  message: string
}): Promise<Campaign> {
  return post(`/businesses/${businessId}/campaigns`, data)
}

export function aiAssistCampaign(businessId: string, campaignId: string): Promise<{
  channel: string
  message: string
}> {
  return post(`/businesses/${businessId}/campaigns/${campaignId}/ai-assist`)
}

export function launchCampaign(businessId: string, campaignId: string): Promise<{
  recipientsCreated: number
  status: string
}> {
  return post(`/businesses/${businessId}/campaigns/${campaignId}/launch`)
}

export function getCampaignAnalytics(businessId: string, campaignId: string): Promise<CampaignAnalytics> {
  return get(`/businesses/${businessId}/campaigns/${campaignId}/analytics`)
}

export function getCampaignInsights(businessId: string, campaignId: string): Promise<CampaignInsights> {
  return get(`/businesses/${businessId}/campaigns/${campaignId}/insights`)
}

export function getCampaignDetails(businessId: string, campaignId: string): Promise<CampaignDetails> {
  return get(`/businesses/${businessId}/campaigns/${campaignId}/details`)
}

export function runInsightPipeline(businessId: string, campaignId: string): Promise<InsightPipelineResult> {
  return post(`/businesses/${businessId}/campaigns/${campaignId}/insight-pipeline`)
}

export function createAttribution(businessId: string, campaignId: string, data: {
  orderId: string
  customerId: string
  revenue: number
}): Promise<any> {
  return post(`/businesses/${businessId}/campaigns/${campaignId}/attribution`, data)
}

export function getAttributionList(businessId: string, campaignId: string): Promise<AttributionListResponse> {
  return get(`/businesses/${businessId}/campaigns/${campaignId}/attribution`)
}
