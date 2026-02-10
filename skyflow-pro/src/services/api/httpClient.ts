import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { CircuitBreaker } from './circuitBreaker'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function backoffMs(attempt: number) {
  // attempt: 0,1,2...
  const base = 250
  const max = 2500
  const exp = Math.min(max, base * 2 ** attempt)
  const jitter = Math.random() * 120
  return Math.round(exp + jitter)
}

export interface ResilientRequestOptions {
  retries: number
  breakerKey: string
  fallback?: () => Promise<unknown>
}

const breakers = new Map<string, CircuitBreaker>()

function getBreaker(key: string) {
  const existing = breakers.get(key)
  if (existing) return existing
  const created = new CircuitBreaker({
    failureThreshold: 3,
    successThreshold: 2,
    openTimeoutMs: 20_000,
  })
  breakers.set(key, created)
  return created
}

export function createHttpClient(): AxiosInstance {
  const baseURL =
    import.meta.env.VITE_API_BASE_URL?.toString() || '/api'

  const instance = axios.create({
    baseURL,
    timeout: 12_000,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  return instance
}

export async function requestWithResilience<T>(
  client: AxiosInstance,
  config: AxiosRequestConfig,
  options: ResilientRequestOptions,
): Promise<T> {
  const breaker = getBreaker(options.breakerKey)
  if (!breaker.canRequest()) {
    if (options.fallback) return (await options.fallback()) as T
    throw new Error('Service temporarily unavailable (circuit open).')
  }

  let lastError: unknown = null
  for (let attempt = 0; attempt <= options.retries; attempt++) {
    try {
      const res = await client.request<T>(config)
      breaker.onSuccess()
      return res.data
    } catch (err) {
      lastError = err
      breaker.onFailure()
      if (attempt < options.retries) await sleep(backoffMs(attempt))
    }
  }

  if (options.fallback) return (await options.fallback()) as T
  throw lastError instanceof Error
    ? lastError
    : new Error('Request failed.')
}

