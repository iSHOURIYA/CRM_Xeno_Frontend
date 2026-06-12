import { get, post } from './client'
import type { Segment } from '../types'

export function listSegments(businessId: string): Promise<Segment[]> {
  return get(`/businesses/${businessId}/segments`)
}

export function getSegment(businessId: string, segmentId: string): Promise<Segment> {
  return get(`/businesses/${businessId}/segments/${segmentId}`)
}

export function createSegment(businessId: string, data: {
  name: string
  description?: string
  rules: { field: string; operator: string; value: number | string }[]
}): Promise<Segment> {
  return post(`/businesses/${businessId}/segments`, data)
}

export function aiSuggestSegment(businessId: string, prompt: string): Promise<{
  name: string
  description: string
  rules: { field: string; operator: string; value: number | string }[]
}> {
  return post(`/businesses/${businessId}/segments/ai`, { prompt })
}
