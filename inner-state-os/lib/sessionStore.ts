const store: Record<string, { chunks: any[] }> = {}

export function logChunk(sessionId: string, chunk: any) {
  if (!store[sessionId]) store[sessionId] = { chunks: [] }
  store[sessionId].chunks.push({ ...chunk, timestamp: new Date().toISOString() })
  return store[sessionId].chunks
}

export function checkThreshold(chunks: any[]): boolean {
  if (chunks.length < 2) return false
  const recent = chunks.slice(-3)
  const spike = recent.some((c, i) =>
    i > 0 && Math.abs(c.intensity - recent[i - 1].intensity) >= 2
  )
  const sustained = recent.filter(c => c.intensity >= 4).length >= 3
  return spike || sustained
}

export function getSession(sessionId: string) {
  return store[sessionId] || { chunks: [] }
}
