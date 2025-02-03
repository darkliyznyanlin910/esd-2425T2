import { describe, it, expect, beforeAll } from 'vitest'
import { app } from '../app'
import { Hono } from 'hono'

interface HelloResponse {
  message: string
}

interface TestResponse {
  message: string
  query?: Record<string, string>
  body?: Record<string, unknown>
}

interface Test2Response {
  message: string
}

describe('API Tests', () => {
  let server: Hono
  
  beforeAll(() => {
    server = app
  })

  // Root endpoint test
  it('should return 200 OK at root', async () => {
    const res = await server.request('/')
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
  })

  // Test router tests
  it('should handle /test/hello with valid name', async () => {
    const res = await server.request('/test/hello?name=John')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({
      message: 'Hello! John from test'
    })
  })

  it('should validate name parameter in /test/hello', async () => {
    const res = await server.request('/test/hello')
    expect(res.status).toBe(400)
  })

  // Test2 router tests
  it('should handle /test2/hello with valid name', async () => {
    const res = await server.request('/test2/hello?name=Jane')
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({
      message: 'Hello! Jane from test2'
    })
  })

  it('should validate name parameter in /test2/hello', async () => {
    const res = await server.request('/test2/hello')
    expect(res.status).toBe(400)
  })

  // Error handling test
  it('should handle not found routes', async () => {
    const res = await server.request('/non-existent')
    expect(res.status).toBe(404)
  })
}) 