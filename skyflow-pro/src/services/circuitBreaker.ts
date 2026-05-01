type CircuitState = 'closed' | 'open' | 'half_open'

export interface CircuitBreakerOptions {
  failureThreshold: number
  successThreshold: number
  openTimeoutMs: number
}

export class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failureCount = 0
  private successCount = 0
  private openedAt = 0

  constructor(private readonly options: CircuitBreakerOptions) {}

  getState() {
    return this.state
  }

  canRequest(now = Date.now()) {
    if (this.state === 'closed') return true
    if (this.state === 'open') {
      if (now - this.openedAt >= this.options.openTimeoutMs) {
        this.state = 'half_open'
        this.successCount = 0
        return true
      }
      return false
    }
    // half-open
    return true
  }

  onSuccess() {
    if (this.state === 'half_open') {
      this.successCount += 1
      if (this.successCount >= this.options.successThreshold) {
        this.state = 'closed'
        this.failureCount = 0
        this.successCount = 0
      }
      return
    }
    // closed
    this.failureCount = 0
  }

  onFailure(now = Date.now()) {
    this.failureCount += 1
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'open'
      this.openedAt = now
      this.successCount = 0
    }
  }
}

