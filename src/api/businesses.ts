import { get, post, put, del } from './client'
import type { Business, DiscoveryResult, AutoPipelineResult, DashboardData } from '../types'

export function listBusinesses(): Promise<Business[]> {
  return get('/businesses')
}

export function getBusiness(id: string): Promise<Business> {
  return get(`/businesses/${id}`)
}

export function createBusiness(data: Partial<Business>): Promise<Business> {
  return post('/businesses', data)
}

export function updateBusiness(id: string, data: Partial<Business>): Promise<Business> {
  return put(`/businesses/${id}`, data)
}

export function discoverBusiness(id: string): Promise<DiscoveryResult> {
  return post(`/businesses/${id}/discover`)
}

export function runMetrics(id: string): Promise<{ customersUpdated: number }> {
  return post(`/businesses/${id}/metrics/run`)
}

export function runAutoPipeline(id: string): Promise<AutoPipelineResult> {
  return post(`/businesses/${id}/auto-pipeline`)
}

export function deleteBusiness(id: string): Promise<{ deleted: boolean }> {
  return del(`/businesses/${id}`)
}

export function getDashboard(id: string): Promise<DashboardData> {
  return get(`/businesses/${id}/dashboard`)
}
