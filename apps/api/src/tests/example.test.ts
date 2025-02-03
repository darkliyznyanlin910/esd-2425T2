import { describe, it, expect } from 'vitest'

describe('Example Test Suite', () => {
  it('should pass', () => {
    expect(true).toBe(true)
  })

  it('should handle async operations', async () => {
    const result = await Promise.resolve(42)
    expect(result).toBe(42)
  })
}) 