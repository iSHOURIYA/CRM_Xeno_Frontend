import { upload } from './client'
import type { UploadResult } from '../types'

export function uploadCustomers(businessId: string, file: File): Promise<UploadResult> {
  return upload(`/uploads/${businessId}/customers`, file)
}

export function uploadOrders(businessId: string, file: File): Promise<UploadResult> {
  return upload(`/uploads/${businessId}/orders`, file)
}

export function uploadEvents(businessId: string, file: File): Promise<UploadResult> {
  return upload(`/uploads/${businessId}/events`, file)
}
