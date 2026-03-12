const BASE = process.env.PLASMO_PUBLIC_API_URL

async function request(url: string, body: object) {
  const res = await fetch(url, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  })
  const data = await res.json()
  if (!res.ok || data.error) {
    throw new Error(data.error || `API error (${res.status})`)
  }
  return data
}

export const analyzeChunk = (audioBase64: string, sessionId: string) =>
  request(`${BASE}/api/analyze-chunk`, { audioBase64, sessionId })

export const getSessionSummary = (emotionLog: any[], sessionId: string) =>
  request(`${BASE}/api/session-summary`, { emotionLog, sessionId })

export const getIntervention = (recentChunks: any[]) =>
  request(`${BASE}/api/intervention`, { recentChunks })
