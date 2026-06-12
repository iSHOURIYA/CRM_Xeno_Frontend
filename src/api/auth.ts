import { post } from './client'
import type { AuthResponse } from '../types'

export function login(email: string, password: string): Promise<AuthResponse> {
  return post('/auth/login', { email, password })
}

export function signup(email: string, password: string, name: string): Promise<AuthResponse> {
  return post('/auth/signup', { email, password, name })
}
