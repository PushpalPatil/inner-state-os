const BASE = process.env.PLASMO_PUBLIC_API_URL

export const analyzeChunk = (audioBase64: string, sessionId: string) =>
  fetch(`${BASE}/api/analyze-chunk`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioBase64, sessionId })
  }).then(r => r.json())

export const getSessionSummary = (emotionLog: any[], sessionId: string) =>
  fetch(`${BASE}/api/session-summary`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emotionLog, sessionId })
  }).then(r => r.json())

export const getIntervention = (recentChunks: any[]) =>
  fetch(`${BASE}/api/intervention`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recentChunks })
  }).then(r => r.json())
