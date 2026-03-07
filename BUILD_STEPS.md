# Inner State OS — Complete Build Steps

---

## Status Check (Already Done)
- [x] `AI_Agent_Glow_Up/` folder created
- [x] `inner-state-os/` — Next.js app created inside
- [x] `inner-state-os-ext/` — Plasmo extension created inside
- [x] GitHub repo created at github.com/PushpalPatil/inner-state-os
- [x] Code pushed to GitHub

---

## Tonight: Pre-Hackathon Setup

### Step 1 — Create shared types folder
```bash
cd /Users/pushpalpatil/Desktop/Hackathons/AI_Agent_Glow_Up
mkdir -p packages/shared
touch packages/shared/types.ts
```

Paste this into `packages/shared/types.ts`:
```typescript
export type Emotion = "calm" | "scattered" | "frustrated" | "reactive" | "grounded"

export interface EmotionChunk {
  emotion: Emotion
  intensity: number
  confidence: number
  pace: "slow" | "medium" | "fast"
  note: string
  timestamp: string
}

export interface Task {
  id: string
  title: string
  description: string
  intensity: number
  type: "communication" | "review" | "deep-work" | "admin"
  source: "slack" | "jira" | "email" | "other"
}

export interface RankedTask extends Task {
  rank: number
  reason: string
}

export interface SessionSummary {
  arc: string
  dominantEmotion: Emotion
  averageIntensity: number
  recommendedTasks: RankedTask[]
  explanation: string
}
```

---

### Step 2 — Install dependencies

In `inner-state-os` (Next.js):
```bash
cd /Users/pushpalpatil/Desktop/Hackathons/AI_Agent_Glow_Up/inner-state-os
npm install @google/generative-ai @anthropic-ai/sdk
```

In `inner-state-os-ext` (Plasmo):
```bash
cd /Users/pushpalpatil/Desktop/Hackathons/AI_Agent_Glow_Up/inner-state-os-ext
npm install framer-motion
```

Note: Agora is installed but not used until the stretch goal at the end of the day. Exa and Prefect are removed from scope entirely.

---

### Step 3 — Create env files

Create `inner-state-os/.env.local`:
```
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
```

Create `inner-state-os-ext/.env.development`:
```
PLASMO_PUBLIC_API_URL=http://localhost:3000
PLASMO_PUBLIC_AGORA_APP_ID=
```

---

### Step 4 — Get all API keys (do this tonight)

| Service | Where to get it |
|---|---|
| Gemini | aistudio.google.com → Get API key |
| Anthropic | console.anthropic.com → API keys |
| Agora App ID | console.agora.io → create project (stretch goal only) |

Paste keys into `.env.local` before you sleep.

---

### Step 5 — Deploy Next.js to Vercel

```bash
cd /Users/pushpalpatil/Desktop/Hackathons/AI_Agent_Glow_Up/inner-state-os
npx vercel
```

When prompted:
- Link to existing project? **No**
- Root directory? **./** (already inside inner-state-os)
- Override build settings? **No**

Then go to vercel.com → your project → Settings → Environment Variables → add `GEMINI_API_KEY` and `ANTHROPIC_API_KEY`.

Save the live Vercel URL. Update `inner-state-os-ext/.env.development`:
```
PLASMO_PUBLIC_API_URL=https://your-app.vercel.app
```

---

### Step 6 — Drop CLAUDE.md into root
```bash
cp /path/to/CLAUDE.md /Users/pushpalpatil/Desktop/Hackathons/AI_Agent_Glow_Up/CLAUDE.md
```

---

### Step 7 — Push everything to GitHub
```bash
cd /Users/pushpalpatil/Desktop/Hackathons/AI_Agent_Glow_Up
git add .
git commit -m "add shared types, env files, CLAUDE.md"
git push origin main
```

---

## Hackathon Day

---

## Hour 1: Alignment (All Together — 9:00–10:00)

### Step 8 — Open Claude Code
```bash
cd /Users/pushpalpatil/Desktop/Hackathons/AI_Agent_Glow_Up
claude
```
Claude Code reads `CLAUDE.md` automatically. Full project context loaded.

### Step 9 — Agree on API contract
Everyone reads the API contract section of `CLAUDE.md`. Lock it in. Don't change it mid-day.

```
POST /api/analyze-chunk   → { audioBase64, sessionId } → { emotion, intensity, confidence, note, shouldIntervene }
POST /api/pull-tasks      → { emotion, intensity } → { tasks: RankedTask[] }
POST /api/session-summary → { emotionLog, sessionId } → { arc, recommendedTasks, explanation }
POST /api/intervention    → { recentChunks } → { message, question }
```

### Step 10 — Split lanes
Both teammates are on design. You are solo on code.

Build order for you: backend first (Steps 11–17), then extension (Steps 18–26).

---

## Hours 2–3: Backend (10:00–12:00)

### Step 11 — Build `cors.ts`

Create `inner-state-os/lib/cors.ts` **first** — every route uses it:
```typescript
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
}

export function withCors(data: object, status = 200) {
  return Response.json(data, { status, headers: corsHeaders })
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}
```

---

### Step 12 — Build mock data

Create `inner-state-os/lib/mockTasks.ts`:
```typescript
export const mockTasks = [
  { id: "1", title: "Reply to Sarah's Slack message", description: "She asked about the auth feature timeline", intensity: 1, type: "communication", source: "slack" },
  { id: "2", title: "Review PR #47 — loading states", description: "Quick UI changes, low-stakes review", intensity: 2, type: "review", source: "jira" },
  { id: "3", title: "Respond to PM's question in Jira", description: "Context question on AUTH-142 acceptance criteria", intensity: 2, type: "communication", source: "jira" },
  { id: "4", title: "Write unit tests for login flow", description: "Cover happy path and all error states", intensity: 4, type: "deep-work", source: "jira" },
  { id: "5", title: "Implement account lock after failed attempts", description: "AUTH-142 core feature — complex logic", intensity: 5, type: "deep-work", source: "jira" }
]
```

Create `inner-state-os/lib/mockData.ts`:
```typescript
export const mockEmotionResult = {
  emotion: "scattered", intensity: 3, confidence: 0.8,
  pace: "medium", note: "speaking at medium pace with occasional hesitation",
  shouldIntervene: false
}

export const mockSessionSummary = {
  arc: "Tired → Scattered → Settling",
  dominantEmotion: "scattered",
  averageIntensity: 2.8,
  explanation: "Your voice was low energy throughout. Starting with lighter tasks will help you build momentum.",
  recommendedTasks: [
    { id: "1", rank: 1, title: "Reply to Sarah's Slack message", description: "She asked about the auth feature timeline", intensity: 1, type: "communication", source: "slack", reason: "Easy win to get moving without burning energy." },
    { id: "2", rank: 2, title: "Review PR #47 — loading states", description: "Quick UI changes", intensity: 2, type: "review", source: "jira", reason: "Low stakes, clear scope — good for easing in." },
    { id: "3", rank: 3, title: "Respond to PM's question in Jira", description: "Context question on AUTH-142", intensity: 2, type: "communication", source: "jira", reason: "Quick answer, no deep thinking needed." },
    { id: "4", rank: 4, title: "Write unit tests for login flow", description: "Cover happy path and error states", intensity: 4, type: "deep-work", source: "jira", reason: "Save this — needs more focus than you have right now." },
    { id: "5", rank: 5, title: "Implement account lock after failed attempts", description: "AUTH-142 core feature", intensity: 5, type: "deep-work", source: "jira", reason: "Your hardest task. Come back when you're more resourced." }
  ]
}

export const mockIntervention = {
  message: "Your pace shifted when you mentioned the account lock decision.",
  question: "Is there something about that decision that doesn't sit right with you?"
}
```

---

### Step 13 — Build `matching.ts`

Create `inner-state-os/lib/matching.ts`:
```typescript
export function getTargetIntensity(emotion: string, intensity: number): number {
  if (emotion === "calm" || emotion === "grounded") return 5
  if (emotion === "reactive" || intensity >= 4) return 1
  if (emotion === "scattered" || emotion === "frustrated") return 2
  return 3
}

export function rankTasksByState(emotion: string, intensity: number, tasks: any[]) {
  const target = getTargetIntensity(emotion, intensity)
  return [...tasks]
    .sort((a, b) => Math.abs(a.intensity - target) - Math.abs(b.intensity - target))
    .map((task, i) => ({ ...task, rank: i + 1 }))
}
```

---

### Step 14 — Build `sessionStore.ts` (replaces Prefect)

Create `inner-state-os/lib/sessionStore.ts`:
```typescript
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
```

No Prefect server needed. Threshold detection runs inline in `analyze-chunk`.

---

### Step 15 — Build `/api/analyze-chunk`

Create `inner-state-os/app/api/analyze-chunk/route.ts`:
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai"
import { withCors, OPTIONS } from "@/lib/cors"
import { logChunk, checkThreshold } from "@/lib/sessionStore"
import { mockEmotionResult } from "@/lib/mockData"

export { OPTIONS }

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  const { audioBase64, sessionId } = await req.json()
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent([
      { inlineData: { mimeType: "audio/webm;codecs=opus", data: audioBase64 } },
      { text: `Analyze this audio of a software engineer in their standup.
        Return ONLY valid JSON, no markdown:
        {
          "emotion": "calm|scattered|frustrated|reactive|grounded",
          "intensity": <1-5>,
          "pace": "slow|medium|fast",
          "confidence": <0.0-1.0>,
          "note": "<one sentence, observable fact about their voice>"
        }` }
    ])
    const raw = result.response.text()
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim())
    const chunks = logChunk(sessionId, parsed)
    const shouldIntervene = checkThreshold(chunks)
    return withCors({ ...parsed, shouldIntervene })
  } catch (e) {
    console.error(e)
    return withCors(mockEmotionResult)
  }
}
```

---

### Step 16 — Build `/api/pull-tasks`

Create `inner-state-os/app/api/pull-tasks/route.ts`:
```typescript
import { withCors, OPTIONS } from "@/lib/cors"
import { mockTasks } from "@/lib/mockTasks"
import { rankTasksByState } from "@/lib/matching"

export { OPTIONS }

export async function POST(req: Request) {
  try {
    const { emotion, intensity } = await req.json()
    const ranked = rankTasksByState(emotion, intensity, mockTasks)
    return withCors({ tasks: ranked })
  } catch (e) {
    return withCors({ tasks: mockTasks })
  }
}
```

---

### Step 17 — Build `/api/session-summary`

Create `inner-state-os/app/api/session-summary/route.ts`:
```typescript
import Anthropic from "@anthropic-ai/sdk"
import { withCors, OPTIONS } from "@/lib/cors"
import { mockTasks } from "@/lib/mockTasks"
import { rankTasksByState } from "@/lib/matching"
import { mockSessionSummary } from "@/lib/mockData"

export { OPTIONS }

const client = new Anthropic()

export async function POST(req: Request) {
  const { emotionLog } = await req.json()
  try {
    const avgIntensity = emotionLog.reduce((s: number, c: any) => s + c.intensity, 0) / emotionLog.length
    const dominant = emotionLog.sort((a: any, b: any) =>
      emotionLog.filter((x: any) => x.emotion === b.emotion).length -
      emotionLog.filter((x: any) => x.emotion === a.emotion).length
    )[0]?.emotion || "calm"
    const preRanked = rankTasksByState(dominant, avgIntensity, mockTasks)

    const msg = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `A software engineer just finished their standup. Voice analysis: ${JSON.stringify(emotionLog)}
        Tasks pre-ranked by intensity match: ${JSON.stringify(preRanked)}
        Return ONLY valid JSON, no markdown:
        {
          "arc": "<3-4 state journey e.g. Tired → Scattered → Settling>",
          "dominantEmotion": "${dominant}",
          "averageIntensity": ${avgIntensity.toFixed(1)},
          "explanation": "<2 sentences: what you noticed + why tasks in this order>",
          "recommendedTasks": [
            { "id": "<id>", "rank": <1-5>, "reason": "<one sentence, human tone>" }
          ]
        }
        Rules: if averageIntensity >= 4 never rank deep-work first. reason must feel like a thoughtful colleague.`
      }]
    })
    const raw = (msg.content[0] as any).text
    return withCors(JSON.parse(raw.replace(/```json|```/g, "").trim()))
  } catch (e) {
    console.error(e)
    return withCors(mockSessionSummary)
  }
}
```

---

### Step 18 — Build `/api/intervention`

Create `inner-state-os/app/api/intervention/route.ts`:
```typescript
import Anthropic from "@anthropic-ai/sdk"
import { withCors, OPTIONS } from "@/lib/cors"
import { mockIntervention } from "@/lib/mockData"

export { OPTIONS }

const client = new Anthropic()

export async function POST(req: Request) {
  const { recentChunks } = await req.json()
  try {
    const msg = await client.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 150,
      messages: [{
        role: "user",
        content: `Voice analysis of last 30 seconds: ${JSON.stringify(recentChunks)}
        Write ONE calm observation (1 sentence). Ask ONE open question. No advice.
        Return JSON only: { "message": string, "question": string }`
      }]
    })
    const raw = (msg.content[0] as any).text
    return withCors(JSON.parse(raw.replace(/```json|```/g, "").trim()))
  } catch (e) {
    return withCors(mockIntervention)
  }
}
```

---

### Step 19 — Deploy and test all routes
```bash
cd inner-state-os
vercel deploy
```

Test each route:
```bash
# analyze-chunk
curl -X POST https://your-app.vercel.app/api/analyze-chunk \
  -H "Content-Type: application/json" \
  -d '{"audioBase64":"dGVzdA==","sessionId":"123"}'

# pull-tasks
curl -X POST https://your-app.vercel.app/api/pull-tasks \
  -H "Content-Type: application/json" \
  -d '{"emotion":"scattered","intensity":3}'

# intervention
curl -X POST https://your-app.vercel.app/api/intervention \
  -H "Content-Type: application/json" \
  -d '{"recentChunks":[{"emotion":"reactive","intensity":4}]}'
```

All 3 should return JSON. If any return errors, fix before moving to the extension.

---

## Hours 3–4: Extension (12:00–2:00)

### Step 20 — Update manifest permissions

In `inner-state-os-ext/package.json`, add:
```json
{
  "manifest": {
    "permissions": ["activeTab", "tabCapture"],
    "host_permissions": ["https://*/*", "http://localhost:3000/*"]
  }
}
```

Note: `storage` removed, `tabCapture` added. Mic permission is requested at runtime via `getUserMedia` — no manifest entry needed.

---

### Step 21 — Build `constants.ts` and `api.ts`

Create `inner-state-os-ext/lib/constants.ts`:
```typescript
export const emotionColors: Record<string, string> = {
  calm: "#4f8fff",
  scattered: "#f4a261",
  frustrated: "#ff6b35",
  reactive: "#f72585",
  grounded: "#57cc99"
}
```

Create `inner-state-os-ext/lib/api.ts`:
```typescript
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
```

---

### Step 22 — Build `background.ts` (service worker)

`chrome.tabCapture` can only be called from a background service worker — not directly from a content script. This is a hard Chrome constraint.

Create `inner-state-os-ext/background.ts`:
```typescript
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_TAB_CAPTURE") {
    chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
      if (chrome.runtime.lastError || !stream) {
        sendResponse({ error: chrome.runtime.lastError?.message || "capture failed" })
        return
      }
      // Stream can't be passed directly across contexts
      // Pass stream ID back — content script reconstructs via MediaStream
      sendResponse({ streamId: (stream as any).id })
    })
    return true // keep message channel open for async response
  }
})
```

---

### Step 23 — Build `useAudioCapture.ts`

Create `inner-state-os-ext/hooks/useAudioCapture.ts`:
```typescript
import { analyzeChunk } from "../lib/api"

export function useAudioCapture(sessionId: string, onResult: (result: any) => void) {
  let mediaRecorder: MediaRecorder | null = null
  let audioContext: AudioContext | null = null

  const startCapture = async () => {
    // 1. Get user's mic
    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })

    // 2. Request tab capture via background service worker
    const { streamId, error } = await chrome.runtime.sendMessage({ type: "START_TAB_CAPTURE" })
    if (error) throw new Error(error)

    // 3. Reconstruct tab stream from ID
    const tabStream = await (navigator.mediaDevices as any).getUserMedia({
      audio: { mandatory: { chromeMediaSource: "tab", chromeMediaSourceId: streamId } }
    })

    // 4. Mix both streams with Web Audio API
    audioContext = new AudioContext()
    const destination = audioContext.createMediaStreamDestination()

    // Tab audio → mix + keep audible (so user can still hear the call)
    const tabSource = audioContext.createMediaStreamSource(tabStream)
    tabSource.connect(destination)
    tabSource.connect(audioContext.destination)

    // Mic → mix only (don't echo back)
    audioContext.createMediaStreamSource(micStream).connect(destination)

    // 5. Record the mixed stream
    mediaRecorder = new MediaRecorder(destination.stream, { mimeType: "audio/webm;codecs=opus" })

    mediaRecorder.ondataavailable = async (e) => {
      if (e.data.size === 0) return
      const buffer = await e.data.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
      const result = await analyzeChunk(base64, sessionId)
      onResult(result)
    }

    mediaRecorder.start(10000) // chunk every 10 seconds
    return { micStream, tabStream }
  }

  const stopCapture = (streams: { micStream: MediaStream, tabStream: MediaStream }) => {
    mediaRecorder?.stop()
    audioContext?.close()
    streams?.micStream?.getTracks().forEach(t => t.stop())
    streams?.tabStream?.getTracks().forEach(t => t.stop())
  }

  return { startCapture, stopCapture }
}
```

---

### Step 24 — Build `useSessionState.ts`

Create `inner-state-os-ext/hooks/useSessionState.ts`:
```typescript
import { useState, useRef } from "react"

export type PanelState = "idle" | "listening" | "processing" | "results" | "intervention"

export function useSessionState() {
  const [panelState, setPanelState] = useState<PanelState>("idle")
  const [emotion, setEmotion] = useState("calm")
  const [intensity, setIntensity] = useState(1)
  const [emotionLog, setEmotionLog] = useState<any[]>([])
  const [results, setResults] = useState<any>(null)
  const [interventionData, setInterventionData] = useState<any>(null)
  const sessionId = useRef(crypto.randomUUID())

  const addChunk = (chunk: any) => {
    setEmotion(chunk.emotion)
    setIntensity(chunk.intensity)
    setEmotionLog(prev => [...prev, chunk])
  }

  const reset = () => {
    setEmotionLog([])
    setEmotion("calm")
    setIntensity(1)
    setResults(null)
    setInterventionData(null)
    sessionId.current = crypto.randomUUID()
  }

  return {
    panelState, setPanelState,
    emotion, intensity,
    emotionLog, addChunk,
    results, setResults,
    interventionData, setInterventionData,
    sessionId: sessionId.current,
    reset
  }
}
```

---

### Step 25 — Build Orb, ArcCard, TaskCard, Panel components

**`components/Orb.tsx`:**
```tsx
import { motion } from "framer-motion"
import { emotionColors } from "../lib/constants"

export function Orb({ emotion, intensity, isListening, onClick }: any) {
  const color = emotionColors[emotion] || "#6b7280"
  const pulseScale = 1 + (intensity * 0.04)
  return (
    <motion.div
      onClick={onClick}
      animate={{
        scale: [1, pulseScale, 1],
        boxShadow: [`0 0 ${intensity * 8}px ${color}40`, `0 0 ${intensity * 20}px ${color}70`, `0 0 ${intensity * 8}px ${color}40`]
      }}
      transition={{ duration: isListening ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" }}
      style={{ width: 64, height: 64, borderRadius: "50%", background: `radial-gradient(circle, ${color}50 0%, ${color}15 100%)`, border: `1.5px solid ${color}70`, cursor: "pointer" }}
    />
  )
}
```

**`components/ArcCard.tsx`:**
```tsx
import { emotionColors } from "../lib/constants"

export function ArcCard({ summary }: any) {
  const color = emotionColors[summary.dominantEmotion] || "#4f8fff"
  return (
    <div style={{ padding: 16, borderRadius: 10, marginBottom: 12, background: "#0f0f1a", borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{summary.arc}</div>
      <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>{summary.explanation}</div>
    </div>
  )
}
```

**`components/TaskCard.tsx`:**
```tsx
export function TaskCard({ task }: any) {
  const isDeferred = task.intensity >= 4
  const dotColor = task.intensity <= 2 ? "#57cc99" : task.intensity === 3 ? "#f4a261" : "#f72585"
  return (
    <div style={{ opacity: isDeferred ? 0.45 : 1, padding: "12px 14px", borderRadius: 8, marginBottom: 8, background: "#14141f", border: "1px solid #222" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "#555" }}>#{task.rank}</span>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{task.type}</span>
        {isDeferred && <span style={{ fontSize: 10, color: "#444", marginLeft: "auto" }}>save for later</span>}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0", marginBottom: 4 }}>{task.title}</div>
      <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5 }}>{task.reason}</div>
    </div>
  )
}
```

**`components/Panel.tsx`:**
```tsx
import { motion, AnimatePresence } from "framer-motion"
import { ArcCard } from "./ArcCard"
import { TaskCard } from "./TaskCard"

export function Panel({ state, results, interventionData }: any) {
  return (
    <AnimatePresence>
      {state !== "idle" && state !== "listening" && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          style={{ position: "fixed", top: 0, right: 0, width: 360, height: "100vh", background: "#080810", borderLeft: "1px solid #1a1a2e", padding: 20, overflowY: "auto" as const, zIndex: 999998 }}
        >
          {state === "processing" && (
            <div style={{ color: "#888", fontSize: 14, marginTop: 40, textAlign: "center" as const }}>
              Reading your standup...
            </div>
          )}
          {state === "results" && results && (
            <>
              <ArcCard summary={results} />
              {results.recommendedTasks?.map((task: any) => <TaskCard key={task.id} task={task} />)}
            </>
          )}
          {state === "intervention" && interventionData && (
            <div style={{ padding: 16, background: "#1a0010", border: "1px solid #f72585", borderRadius: 10 }}>
              <div style={{ fontSize: 14, color: "#f72585", marginBottom: 8 }}>{interventionData.message}</div>
              <div style={{ fontSize: 13, color: "#aaa" }}>{interventionData.question}</div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

---

### Step 26 — Build content script `contents/orb.tsx`

Create `inner-state-os-ext/contents/orb.tsx`:
```tsx
import type { PlasmoCSConfig } from "plasmo"
import { Orb } from "../components/Orb"
import { Panel } from "../components/Panel"
import { useAudioCapture } from "../hooks/useAudioCapture"
import { useSessionState } from "../hooks/useSessionState"
import { getSessionSummary, getIntervention } from "../lib/api"

export const config: PlasmoCSConfig = { matches: ["<all_urls>"] }

export default function OrbContent() {
  const {
    panelState, setPanelState,
    emotion, intensity,
    emotionLog, addChunk,
    results, setResults,
    interventionData, setInterventionData,
    sessionId
  } = useSessionState()

  const [streams, setStreams] = require("react").useState(null)

  const { startCapture, stopCapture } = useAudioCapture(sessionId, async (result) => {
    addChunk(result)
    if (result.shouldIntervene && !interventionData) {
      const data = await getIntervention(emotionLog.slice(-3))
      setInterventionData(data)
      setPanelState("intervention")
    }
  })

  const handleOrbClick = async () => {
    if (panelState === "idle") {
      const captured = await startCapture()
      setStreams(captured)
      setPanelState("listening")
    } else if (panelState === "listening") {
      stopCapture(streams)
      setPanelState("processing")
      const summary = await getSessionSummary(emotionLog, sessionId)
      setResults(summary)
      setPanelState("results")
    } else if (panelState === "results") {
      setPanelState("idle")
    }
  }

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999999 }}>
      <Panel state={panelState} results={results} interventionData={interventionData} />
      <Orb emotion={emotion} intensity={intensity} isListening={panelState === "listening"} onClick={handleOrbClick} />
    </div>
  )
}
```

---

## Hour 5: Integration Test (2:00–3:00)

### Step 27 — Build the extension
```bash
cd inner-state-os-ext
npm run build
```

### Step 28 — Load into Chrome
1. Open `chrome://extensions`
2. Toggle Developer mode ON (top right)
3. Click "Load unpacked"
4. Select `inner-state-os-ext/build/chrome-mv3-prod`

### Step 29 — Test the full flow
- Open Google Meet in a Chrome tab (or any tab)
- Click the orb to start
- Speak for 30 seconds
- Click orb to end
- Verify:
  - Orb color changes while speaking
  - Panel opens after ~5 seconds
  - Tasks ranked with easy ones first
  - Each task has a reason

### Step 30 — Fix only the top 3 visible issues
Don't touch anything that isn't broken.

### Step 31 — Final prod deploy
```bash
cd inner-state-os
vercel --prod
```
Update `inner-state-os-ext/.env.development` to prod URL. Rebuild extension. Reload in Chrome.

---

## Hour 6: Demo Prep (3:00–4:00)

### Step 32 — Stretch goal: Agora swap-in (only if time)
Replace `getUserMedia` mic capture with Agora SDK for sponsor credit:
```typescript
import AgoraRTC from "agora-rtc-sdk-ng"
const agoraTrack = await AgoraRTC.createMicrophoneAudioTrack()
const micStream = new MediaStream([agoraTrack.getMediaStreamTrack()])
// rest of the mixing logic stays identical
```

### Step 33 — Rehearse the demo script 3 times

Open Google Meet. Click orb. Say exactly:

> *"Yeah so today I'm still working on the auth ticket, I'm pretty tired from yesterday honestly, we had a lot of back and forth about the account lock thing and I just don't really have the energy to dig into that today."*

Expected: orb goes amber → panel opens → Slack reply is task #1.

### Step 34 — Set up the demo laptop
- Extension loaded and pinned
- Google Meet open in a tab
- Orb visible bottom right
- Mic tested in the demo room
- Backup: screen recording of working flow ready

### Step 35 — The pitch close

Last line. Say it. Stop talking.

> *"Dev tools have always known everything about your code. Inner State OS is the first one that knows something about you."*

---

## Full Timeline

| Time | What |
|---|---|
| Tonight | Steps 1–7: types, deps, env, Vercel deployed, CLAUDE.md in root |
| 9–10am | Steps 8–10: Claude Code open, contract locked |
| 10am–12pm | Steps 11–19: all 4 API routes built + deployed + tested |
| 12–2pm | Steps 20–26: extension built, audio capture, content script wired |
| 2–3pm | Steps 27–31: full integration test, prod deploy |
| 3–4pm | Steps 32–35: stretch goal, demo rehearsal, pitch prep |

---

## Folder Structure Reference

```
AI_Agent_Glow_Up/               ← git root
├── inner-state-os/             ← Next.js (Vercel)
│   ├── app/api/
│   │   ├── analyze-chunk/route.ts
│   │   ├── pull-tasks/route.ts
│   │   ├── session-summary/route.ts
│   │   └── intervention/route.ts
│   └── lib/
│       ├── cors.ts
│       ├── gemini.ts
│       ├── claude.ts
│       ├── matching.ts
│       ├── sessionStore.ts
│       ├── mockTasks.ts
│       └── mockData.ts
├── inner-state-os-ext/         ← Plasmo (Chrome)
│   ├── background.ts
│   ├── contents/orb.tsx
│   ├── components/
│   │   ├── Orb.tsx
│   │   ├── Panel.tsx
│   │   ├── TaskCard.tsx
│   │   └── ArcCard.tsx
│   ├── hooks/
│   │   ├── useAudioCapture.ts
│   │   └── useSessionState.ts
│   └── lib/
│       ├── api.ts
│       └── constants.ts
└── packages/shared/types.ts
```

---

*Inner State OS — Agent Glow Up Hackathon 2026*
*Gemini · Claude · tabCapture · Plasmo · Next.js · Vercel · (Agora — stretch goal)*
