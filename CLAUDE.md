# Inner State OS — Claude Code Instructions

## What This Project Is

A Chrome extension (Plasmo + React) paired with a Next.js backend (deployed on Vercel).

The extension floats as an orb on screen. During a video call standup (Google Meet, Zoom in browser, etc.), the user clicks the orb to start recording. It captures **both the user's mic and the tab's call audio** — giving Gemini full conversation context. After the user clicks to stop, the agent synthesizes their emotional state and recommends which tasks to start with — ranked by cognitive intensity match.

**Core loop:**
1. User is on a standup video call → clicks orb to start recording
2. Extension captures tab audio (all participants) + user's mic via `chrome.tabCapture` + `getUserMedia`, mixed together
3. Audio chunks sent to Gemini every 10 seconds → real-time emotion analysis
4. User clicks orb to end → agent synthesizes state + recommends tasks via Claude
5. Panel slides in with ranked task list and brief explanation of why

---

## Monorepo Structure

```
AI_Agent_Glow_Up/
├── inner-state-os/          ← Next.js app (Vercel backend + API routes)
├── inner-state-os-ext/      ← Plasmo Chrome extension (orb UI + audio capture)
├── packages/
│   └── shared/
│       └── types.ts         ← Shared types (already built)
├── CLAUDE.md
└── README.md
```

**No monorepo tooling needed.** Each app has its own `package.json` and runs independently. Just `cd` into each app and run `npm run dev`.

**Running both apps for development:**
```bash
# Terminal 1 — backend
cd inner-state-os && npm run dev    # → http://localhost:3000

# Terminal 2 — extension
cd inner-state-os-ext && npm run dev  # → loads in Chrome via plasmo
```

---

## Apps

### `inner-state-os/` — Next.js (Backend)

**Purpose:** API routes only. No frontend pages needed.

**Routes:**
- `POST /api/analyze-chunk` — receives base64 audio, returns emotion analysis via Gemini
- `POST /api/pull-tasks` — returns task list ranked by intensity match to current emotion
- `POST /api/session-summary` — receives full emotion log, returns standup summary + recommended task order via Claude
- `POST /api/intervention` — receives recent emotion chunks, returns reflection message via Claude

**Key files:**
```
inner-state-os/
├── app/
│   ├── layout.tsx              ← (boilerplate, leave as-is)
│   ├── page.tsx                ← (boilerplate, leave as-is)
│   └── api/
│       ├── analyze-chunk/route.ts
│       ├── pull-tasks/route.ts
│       ├── session-summary/route.ts
│       └── intervention/route.ts
├── lib/
│   ├── gemini.ts               ← Gemini client init + audio analysis helper
│   ├── claude.ts               ← Anthropic client init
│   ├── mockTasks.ts            ← Hardcoded task list for hackathon
│   ├── mockData.ts             ← Fallback responses for every route
│   ├── matching.ts             ← matchTasksToState() function
│   └── cors.ts                 ← CORS headers helper
└── .env.local                  ← Already configured with API keys
```

**Installed dependencies:**
- `@anthropic-ai/sdk` — Claude API client
- `@google/generative-ai` — Gemini API client
- `next`, `react`, `react-dom`

**Environment variables (already in `.env.local`):**
```
GEMINI_API_KEY=<set>
ANTHROPIC_API_KEY=<set>
```

---

### `inner-state-os-ext/` — Plasmo (Chrome Extension)

**Purpose:** Floating orb UI injected into all pages. Captures tab + mic audio during standup calls. Calls web API routes.

**Key files:**
```
inner-state-os-ext/
├── contents/
│   └── orb.tsx                 ← Main content script, renders orb + panel on all pages
├── components/
│   ├── Orb.tsx                 ← Animated orb, color = emotion state
│   ├── Panel.tsx               ← Slide-in panel with task recommendations
│   ├── TaskCard.tsx            ← Individual task with intensity label + match reason
│   └── ArcCard.tsx             ← Post-standup emotional arc summary card
├── hooks/
│   ├── useAudioCapture.ts      ← tabCapture + mic mixing + chunking logic
│   └── useSessionState.ts      ← Emotion log, panel state, session management
├── lib/
│   ├── api.ts                  ← All fetch calls to Next.js API routes
│   └── constants.ts            ← Emotion colors, shared constants
├── background.ts               ← Service worker — initiates tabCapture
├── popup.tsx                   ← (boilerplate, leave as-is)
└── .env.development            ← Already configured
```

**Installed dependencies:**
- `plasmo` — Chrome extension framework
- `react`, `react-dom` (v18)
- `framer-motion` — orb animations
- `agora-rtc-sdk-ng` — (installed, optional swap-in for sponsor credit)

**Environment variables (already in `.env.development`):**
```
PLASMO_PUBLIC_API_URL=http://localhost:3000
PLASMO_PUBLIC_AGORA_APP_ID=<set>
```

**Manifest permissions** — update `package.json` `manifest` field:
```json
{
  "manifest": {
    "host_permissions": ["https://*/*", "http://localhost:3000/*"],
    "permissions": ["activeTab", "tabCapture"]
  }
}
```

---

## Shared Types (Already Built)

Located at `packages/shared/types.ts`. Import with relative paths:

```typescript
// From inner-state-os/lib/*.ts:
import type { Emotion, EmotionChunk, Task, RankedTask, SessionSummary } from "../../packages/shared/types"

// From inner-state-os-ext/components/*.tsx:
import type { Emotion, EmotionChunk, Task, RankedTask, SessionSummary } from "../../packages/shared/types"
```

If relative imports cause issues with Plasmo or Next.js, copy the types into each app. Keeping them in sync manually is fine for a hackathon.

```typescript
// packages/shared/types.ts (already exists)

export type Emotion = "calm" | "scattered" | "frustrated" | "reactive" | "grounded"

export interface EmotionChunk {
  emotion: Emotion
  intensity: number    // 1-5
  confidence: number   // 0.0-1.0
  pace: "slow" | "medium" | "fast"
  note: string
  timestamp: string
}

export interface Task {
  id: string
  title: string
  description: string
  intensity: number    // 1-5 (1 = low cognitive load, 5 = deep work)
  type: "communication" | "review" | "deep-work" | "admin"
  source: "slack" | "jira" | "email" | "other"
}

export interface SessionSummary {
  arc: string              // "Tired → Slightly anxious → Settling"
  dominantEmotion: Emotion
  averageIntensity: number
  recommendedTasks: RankedTask[]
  explanation: string
}

export interface RankedTask extends Task {
  rank: number
  reason: string           // Why this task matches current state
}
```

---

## Emotion → Orb Color Mapping

Place in `inner-state-os-ext/lib/constants.ts`:

```typescript
import type { Emotion } from "../../packages/shared/types"

export const emotionColors: Record<Emotion, string> = {
  calm:       "#4f8fff",   // blue
  scattered:  "#f4a261",   // amber
  frustrated: "#ff6b35",   // orange
  reactive:   "#f72585",   // rose
  grounded:   "#57cc99"    // green
}
```

---

## Task Intensity → State Matching Logic

Place in `inner-state-os/lib/matching.ts`:

```typescript
import type { Emotion, Task, RankedTask } from "../../packages/shared/types"

export function matchTasksToState(emotion: Emotion, intensity: number, tasks: Task[]): RankedTask[] {
  const targetIntensity = getTargetIntensity(emotion, intensity)
  return [...tasks]
    .sort((a, b) => Math.abs(a.intensity - targetIntensity) - Math.abs(b.intensity - targetIntensity))
    .map((task, i) => ({ ...task, rank: i + 1, reason: "" }))
}

function getTargetIntensity(emotion: Emotion, intensity: number): number {
  if (emotion === "calm" || emotion === "grounded") return 5      // Use peak state for deep work
  if (emotion === "reactive" || intensity >= 4) return 1          // Protect from hard decisions
  if (emotion === "scattered") return 2                           // Ease in gently
  return 3                                                        // Default: medium
}
```

---

## API Contracts (All Four Routes)

### POST /api/analyze-chunk
Receives an audio chunk, sends to Gemini for emotion analysis. Checks intervention thresholds inline.

```typescript
// Request
{
  audioBase64: string,
  sessionId: string,
  previousChunks?: EmotionChunk[]    // Last 3 chunks, for intervention detection
}

// Response (success)
{
  emotion: Emotion,
  intensity: number,
  confidence: number,
  pace: "slow" | "medium" | "fast",
  note: string,
  shouldIntervene: boolean
}

// Response (error fallback — use mockEmotionChunk from mockData.ts)
{
  emotion: "calm",
  intensity: 2,
  confidence: 0,
  pace: "medium",
  note: "Unable to analyze audio",
  shouldIntervene: false
}
```

### POST /api/pull-tasks
Returns mock tasks ranked by intensity match to current emotional state.

```typescript
// Request
{ emotion: Emotion, intensity: number }

// Response
{ tasks: RankedTask[] }
```

Uses `matchTasksToState()` from `lib/matching.ts`.

### POST /api/session-summary
Receives full emotion log, sends to Claude for synthesis.

```typescript
// Request
{ emotionLog: EmotionChunk[], tasks: Task[] }

// Response
{
  arc: string,
  dominantEmotion: Emotion,
  averageIntensity: number,
  recommendedTasks: RankedTask[],
  explanation: string
}
```

### POST /api/intervention
Triggered mid-standup when emotional spike detected. Sends recent chunks to Claude for a grounding message.

```typescript
// Request
{ recentChunks: EmotionChunk[] }

// Response
{
  message: string,        // Brief, human, grounding reflection
  suggestion: string      // One concrete micro-action
}
```

---

## CORS Configuration

The extension makes cross-origin requests to the Next.js backend. Every API route needs CORS headers.

**File: `inner-state-os/lib/cors.ts`**

```typescript
export function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  }
}
```

**In every route file, export an OPTIONS handler + add headers to POST responses:**
```typescript
import { corsHeaders } from "@/lib/cors"

export async function OPTIONS() {
  return new Response(null, { headers: corsHeaders() })
}

export async function POST(request: Request) {
  // ... handler logic ...
  return Response.json(data, { headers: corsHeaders() })
}
```

---

## Gemini Setup (Audio Analysis)

**File: `inner-state-os/lib/gemini.ts`**

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

// Gemini 2.0 Flash — supports audio input, fast inference
export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

export async function analyzeAudioChunk(audioBase64: string) {
  const result = await geminiModel.generateContent([
    {
      inlineData: {
        mimeType: "audio/webm",    // Must match MediaRecorder output format
        data: audioBase64
      }
    },
    { text: EMOTION_PROMPT }
  ])

  const text = result.response.text()
  // Strip markdown code fences if Gemini wraps the JSON
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  return JSON.parse(cleaned)
}

const EMOTION_PROMPT = `
Analyze this audio clip of a software engineer during their daily standup meeting.
Return ONLY valid JSON with no markdown or explanation:
{
  "emotion": "calm|scattered|frustrated|reactive|grounded",
  "intensity": <1-5>,
  "pace": "slow|medium|fast",
  "confidence": <0.0-1.0>,
  "note": "<one sentence, plain language observation>"
}
Rules:
- confidence below 0.5 means not enough signal — return intensity 1 and emotion "calm"
- pace is how fast they are speaking relative to normal
- note should be observable, not interpretive ("speaking slowly with long pauses" not "seems depressed")
`
```

---

## Claude Setup (Session Summary + Intervention)

**File: `inner-state-os/lib/claude.ts`**

```typescript
import Anthropic from "@anthropic-ai/sdk"

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})
```

**Session Summary Prompt** (used in `/api/session-summary`):
```typescript
const SUMMARY_PROMPT = (emotionLog: EmotionChunk[], tasks: Task[]) => `
A software engineer just finished their daily standup. Here is their voice analysis:
${JSON.stringify(emotionLog)}

Here are their tasks for today:
${JSON.stringify(tasks)}

Based on their emotional state during the standup, recommend which tasks they should start with.
Return ONLY valid JSON:
{
  "arc": "<emotional journey in 3-4 words e.g. Tired → Anxious → Settling>",
  "dominantEmotion": "<most frequent emotion>",
  "averageIntensity": <1-5>,
  "explanation": "<2 sentences: what you noticed + why these tasks in this order>",
  "recommendedTasks": [
    {
      "id": "<task id>",
      "rank": <1-n>,
      "reason": "<one sentence: why this task fits their current state>"
    }
  ]
}
Rules:
- If intensity is high (4-5), never rank deep work tasks first
- If emotion is calm or grounded, rank high intensity tasks first
- reason should feel human and direct, not clinical
`
```

**Intervention Prompt** (used in `/api/intervention`):
```typescript
const INTERVENTION_PROMPT = (recentChunks: EmotionChunk[]) => `
A software engineer is in their daily standup and their emotional state has spiked.
Recent voice analysis: ${JSON.stringify(recentChunks)}

They need a brief, grounding moment. Return ONLY valid JSON:
{
  "message": "<1-2 sentences, warm and human, acknowledging what you notice>",
  "suggestion": "<one concrete micro-action: take a breath, pause, stretch, etc.>"
}
Rules:
- Do not be clinical or therapeutic
- Be direct and warm, like a thoughtful coworker
- Keep it under 30 words total
`
```

---

## Mock Data

### Mock Tasks — `inner-state-os/lib/mockTasks.ts`

```typescript
import type { Task } from "../../packages/shared/types"

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Reply to Sarah's Slack message",
    description: "She asked about the timeline for the auth feature",
    intensity: 1,
    type: "communication",
    source: "slack"
  },
  {
    id: "2",
    title: "Review PR #47 — add loading states",
    description: "Quick review, mostly UI changes",
    intensity: 2,
    type: "review",
    source: "jira"
  },
  {
    id: "3",
    title: "Respond to PM's question in Jira",
    description: "Context question on AUTH-142 acceptance criteria",
    intensity: 2,
    type: "communication",
    source: "jira"
  },
  {
    id: "4",
    title: "Implement account lock after failed attempts",
    description: "AUTH-142 core feature work",
    intensity: 5,
    type: "deep-work",
    source: "jira"
  },
  {
    id: "5",
    title: "Write unit tests for login flow",
    description: "Cover happy path and error states",
    intensity: 4,
    type: "deep-work",
    source: "jira"
  }
]
```

### Mock Fallback Data — `inner-state-os/lib/mockData.ts`

Fallback responses used when any API call fails. Ensures the demo never breaks.

```typescript
import type { EmotionChunk, SessionSummary } from "../../packages/shared/types"
import { mockTasks } from "./mockTasks"

// Fallback for /api/analyze-chunk when Gemini fails
export const mockEmotionChunk = {
  emotion: "calm" as const,
  intensity: 2,
  confidence: 0,
  pace: "medium" as const,
  note: "Unable to analyze audio",
  shouldIntervene: false
}

// Fallback for /api/intervention when Claude fails
export const mockIntervention = {
  message: "Sounds like things are heating up. That's okay.",
  suggestion: "Take one slow breath before continuing."
}

// Fallback for /api/session-summary when Claude fails
export const mockSessionSummary: SessionSummary = {
  arc: "Steady → Slightly tired → Settling",
  dominantEmotion: "calm",
  averageIntensity: 2,
  explanation: "You seem to be in a steady, low-energy state. Starting with lightweight tasks will help you build momentum.",
  recommendedTasks: mockTasks.map((task, i) => ({
    ...task,
    rank: i + 1,
    reason: "Fallback recommendation"
  }))
}
```

---

## Audio Capture — tabCapture + Mic Mixing

**Primary use case:** User is on a video call standup in a browser tab (Google Meet, web Zoom, etc.). We capture **both** the tab's audio output (all participants) and the user's microphone, mix them together, and chunk the mixed audio for analysis.

### How It Works

1. User clicks orb → content script sends message to **background service worker**
2. Background service worker calls `chrome.tabCapture.capture({ audio: true })` (must be called from background, not content script)
3. Background sends the tab audio stream ID back to content script
4. Content script also gets user's mic via `navigator.mediaDevices.getUserMedia({ audio: true })`
5. Both streams are mixed using **Web Audio API** into a single `MediaStream`
6. Mixed stream is fed into `MediaRecorder` with `mimeType: "audio/webm;codecs=opus"`
7. Every **10 seconds**, the recorder produces a blob → convert to base64 → send to `/api/analyze-chunk`
8. Tab audio is also routed to `ctx.destination` so the user can still hear the call

### Background Service Worker — `inner-state-os-ext/background.ts`

`chrome.tabCapture` can only be called from the extension's background context, not from a content script. The background service worker listens for a message from the content script, initiates tab capture, and returns the stream.

```typescript
// background.ts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "START_TAB_CAPTURE") {
    chrome.tabCapture.capture({ audio: true, video: false }, (stream) => {
      // Can't send MediaStream directly — use chrome.tabCapture.getMediaStreamId instead
      // Or handle recording in the background/offscreen document
    })
  }
})
```

**Important constraint:** `MediaStream` objects can't be sent between background and content scripts via `chrome.runtime.sendMessage`. Two approaches:

**Approach A — Offscreen Document (Recommended for MV3):**
Record in an offscreen document that has access to both `tabCapture` and `getUserMedia`. Send base64 chunks back to the content script via messaging.

**Approach B — tabCapture in popup/side panel:**
Use `chrome.tabCapture.getMediaStreamId()` from background, pass the stream ID to the content script, and reconstruct the stream there with `navigator.mediaDevices.getUserMedia({ audio: { mandatory: { chromeMediaSource: "tab", chromeMediaSourceId: streamId } } })`.

**For the hackathon, use Approach B** — it keeps recording logic in the content script where the UI lives.

### Audio Mixing (in content script or offscreen doc)

```typescript
async function createMixedStream(tabStream: MediaStream): Promise<MediaStream> {
  const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const ctx = new AudioContext()
  const destination = ctx.createMediaStreamDestination()

  // Mix tab audio into recording
  const tabSource = ctx.createMediaStreamSource(tabStream)
  tabSource.connect(destination)

  // Also keep playing tab audio so user hears the call
  tabSource.connect(ctx.destination)

  // Mix mic audio into recording
  const micSource = ctx.createMediaStreamSource(micStream)
  micSource.connect(destination)

  return destination.stream
}
```

### Chunking Logic

```typescript
const CHUNK_INTERVAL = 10_000 // 10 seconds

function startChunking(mixedStream: MediaStream, onChunk: (base64: string) => void) {
  const recorder = new MediaRecorder(mixedStream, {
    mimeType: "audio/webm;codecs=opus"
  })

  recorder.ondataavailable = async (event) => {
    if (event.data.size > 0) {
      const base64 = await blobToBase64(event.data)
      onChunk(base64)
    }
  }

  // Record in 10-second intervals
  recorder.start(CHUNK_INTERVAL)
  return recorder
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
```

### Hook API — `inner-state-os-ext/hooks/useAudioCapture.ts`

```typescript
interface UseAudioCaptureOptions {
  onChunkAnalyzed: (chunk: EmotionChunk) => void
  onInterventionTriggered: (intervention: { message: string; suggestion: string }) => void
  apiUrl: string
}

interface UseAudioCaptureReturn {
  isRecording: boolean
  startRecording: () => Promise<void>    // Requests tabCapture + mic, starts chunking
  stopRecording: () => void              // Stops recorder, sends final chunk
  error: string | null
}
```

### Agora Swap-In (Stretch Goal for Sponsor Credit)

If time permits, replace the `getUserMedia` mic source with Agora's SDK:

```typescript
import AgoraRTC from "agora-rtc-sdk-ng"

// Instead of: navigator.mediaDevices.getUserMedia({ audio: true })
const micTrack = await AgoraRTC.createMicrophoneAudioTrack()
const micStream = new MediaStream([micTrack.getMediaStreamTrack()])
```

The rest of the mixing and chunking logic stays identical. Tab capture still goes through `chrome.tabCapture`. This is a ~5-line swap that gets "Built with Agora" on the slide.

---

## Session State Hook

**File: `inner-state-os-ext/hooks/useSessionState.ts`**

Manages all session-level state for the extension.

**Hook API:**
```typescript
interface UseSessionStateReturn {
  // Panel state
  panelState: PanelState
  setPanelState: (state: PanelState) => void

  // Emotion tracking
  emotionLog: EmotionChunk[]
  addChunk: (chunk: EmotionChunk) => void
  currentEmotion: Emotion | null
  currentIntensity: number

  // Session summary (populated after standup ends)
  summary: SessionSummary | null
  setSummary: (summary: SessionSummary) => void

  // Intervention
  intervention: { message: string; suggestion: string } | null
  setIntervention: (intervention: { message: string; suggestion: string } | null) => void

  // Session lifecycle
  sessionId: string
  resetSession: () => void
}

type PanelState = "idle" | "listening" | "processing" | "results" | "intervention"
```

**State flow:**
```
idle → (user clicks orb) → listening
listening → (user clicks orb) → processing
processing → (API returns summary) → results
listening → (shouldIntervene = true) → intervention
intervention → (user dismisses) → listening
results → (user clicks close) → idle (resets session)
```

**Implementation notes:**
- `sessionId` is a random UUID generated on each session start
- `emotionLog` is an array that grows with each analyzed chunk
- `currentEmotion` and `currentIntensity` always reflect the most recent chunk
- `resetSession` clears everything and generates a new sessionId

---

## API Client (Extension → Backend)

**File: `inner-state-os-ext/lib/api.ts`**

```typescript
import type { Emotion, EmotionChunk, Task } from "../../packages/shared/types"

const API_URL = process.env.PLASMO_PUBLIC_API_URL || "http://localhost:3000"

export async function analyzeChunk(
  audioBase64: string,
  sessionId: string,
  previousChunks?: EmotionChunk[]
) {
  const response = await fetch(`${API_URL}/api/analyze-chunk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audioBase64, sessionId, previousChunks })
  })
  return response.json()
}

export async function pullTasks(emotion: Emotion, intensity: number) {
  const response = await fetch(`${API_URL}/api/pull-tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emotion, intensity })
  })
  return response.json()
}

export async function getSessionSummary(emotionLog: EmotionChunk[], tasks: Task[]) {
  const response = await fetch(`${API_URL}/api/session-summary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emotionLog, tasks })
  })
  return response.json()
}

export async function getIntervention(recentChunks: EmotionChunk[]) {
  const response = await fetch(`${API_URL}/api/intervention`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recentChunks })
  })
  return response.json()
}
```

---

## Intervention Detection (Inline — No Prefect)

Instead of running a separate Prefect server, detect interventions inline in the `/api/analyze-chunk` route:

```typescript
function shouldIntervene(currentChunk: EmotionChunk, previousChunks: EmotionChunk[]): boolean {
  // Sharp spike: intensity jumped 2+ points from the previous chunk
  if (previousChunks.length > 0) {
    const lastChunk = previousChunks[previousChunks.length - 1]
    if (currentChunk.intensity - lastChunk.intensity >= 2) return true
  }

  // Sustained high: 3+ consecutive chunks at intensity >= 4
  const recent = [...previousChunks.slice(-2), currentChunk]
  if (recent.length >= 3 && recent.every(c => c.intensity >= 4)) return true

  // Reactive emotion at high intensity
  if (currentChunk.emotion === "reactive" && currentChunk.intensity >= 4) return true

  return false
}
```

The extension sends the last 3 `previousChunks` in the analyze-chunk request so the backend can check thresholds.

---

## Extension Components

### Orb Component — `components/Orb.tsx`

Always visible in the bottom-right corner. Communicates state through color and animation only.

**Props:**
```typescript
interface OrbProps {
  panelState: PanelState
  currentEmotion: Emotion | null
  currentPace: "slow" | "medium" | "fast" | null
  onClick: () => void
}
```

**Visual states:**
| State | Color | Animation |
|-------|-------|-----------|
| `idle` | `#6b7280` (grey) | Slow pulse, 3s cycle |
| `listening` | `emotionColors[currentEmotion]` | Pulse speed: slow=2s, medium=1.5s, fast=0.8s |
| `processing` | Last emotion color | Fast spin / rotating border, 1s cycle |
| `results` | `emotionColors[dominantEmotion]` | Steady glow, no pulse |
| `intervention` | `#f72585` (rose) | Burst — scale up 1.4x then settle |

**Size:** 56px diameter circle. Fixed position bottom-right, 24px margin.

**Framer Motion animations:**
- Pulse = `scale` oscillating between 1.0 and 1.15
- Spin = `rotate` from 0 to 360 over 1s, repeating
- Burst = `scale` from 1.0 to 1.4 to 1.0 over 0.5s
- All transitions use `spring` type for organic feel

### Panel Component — `components/Panel.tsx`

Slide-in panel from the right side of the screen.

**Props:**
```typescript
interface PanelProps {
  panelState: PanelState
  emotionLog: EmotionChunk[]
  summary: SessionSummary | null
  intervention: { message: string; suggestion: string } | null
  onDismissIntervention: () => void
  onClose: () => void
}
```

**Panel visibility:**
- `idle` → panel hidden
- `listening` → panel hidden (orb only)
- `processing` → panel slides in with loading spinner + "Synthesizing your standup..."
- `results` → panel shows ArcCard at top + ranked TaskCards below
- `intervention` → panel slides in with intervention message + dismiss button

**Panel styling:**
- Fixed position, right side of screen
- Width: 380px
- Background: white with subtle shadow
- Slides in from right with Framer Motion `x` animation
- Rounded left corners (12px)
- Max height: 80vh with overflow scroll
- Use inline styles or CSS-in-JS (avoids Tailwind-in-content-script complexity)

### TaskCard Component — `components/TaskCard.tsx`

Displays a single ranked task.

**Props:**
```typescript
interface TaskCardProps {
  task: RankedTask
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│ #1  Reply to Sarah's Slack message  │
│     ● slack · intensity 1           │
│                                     │
│     "Starting light will help you   │
│      build momentum."               │
└─────────────────────────────────────┘
```
- Rank number (large, bold)
- Task title
- Source badge + intensity indicator (1-5)
- Reason text in italics
- Subtle left border colored by task type: communication=blue, review=purple, deep-work=orange, admin=grey

### ArcCard Component — `components/ArcCard.tsx`

Shown at the top of the results panel. Summarizes the emotional journey.

**Props:**
```typescript
interface ArcCardProps {
  summary: SessionSummary
}
```

**Layout:**
```
┌─────────────────────────────────────┐
│  Tired → Slightly anxious → Settling │
│                                     │
│  Dominant: scattered · Avg: 2.3     │
│                                     │
│  "You're running low on energy      │
│   today. Starting with something    │
│   lightweight will help you build   │
│   momentum before the heavier work."│
└─────────────────────────────────────┘
```
- Arc text (large)
- Dominant emotion + average intensity
- Explanation text

---

## Content Script — `contents/orb.tsx`

Main Plasmo content script that wires everything together. Renders on all pages.

**Plasmo config:**
```typescript
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}
```

**Component tree:**
```
OrbContentScript
├── useSessionState()       ← manages all state
├── useAudioCapture()       ← tab + mic capture, chunking, API calls
├── Orb                     ← floating orb, always visible
└── Panel                   ← slide-in panel (hidden until needed)
    ├── ArcCard             ← shown in "results" state
    ├── TaskCard[]          ← shown in "results" state
    └── InterventionView    ← shown in "intervention" state
```

**Click handler logic:**
```typescript
function handleOrbClick() {
  if (panelState === "idle") {
    startRecording()         // Triggers tabCapture + mic + chunking
    setPanelState("listening")
  } else if (panelState === "listening") {
    stopRecording()          // Stops recorder, sends final chunk
    setPanelState("processing")
    // Fetch session summary from /api/session-summary
    // On response → setSummary(data) + setPanelState("results")
  } else if (panelState === "results") {
    resetSession()           // Clear everything, back to idle
  }
}
```

---

## Panel States

```typescript
type PanelState =
  | "idle"          // Orb floating, not recording. Panel hidden.
  | "listening"     // Recording active, orb pulsing. Panel hidden.
  | "processing"    // Recording stopped, fetching summary. Panel visible with spinner.
  | "results"       // Task recommendations visible. Panel visible with cards.
  | "intervention"  // Mid-recording emotional spike. Panel visible with grounding message.
```

---

## Orb States

The orb is always visible. It communicates through color + animation only.

```
idle         → slow pulse, grey (#6b7280)
listening    → active pulse speed matches detected pace, color = current emotion
processing   → fast spin / loading animation, last emotion color
results      → steady glow, color = dominant emotion from standup
intervention → burst animation, rose (#f72585)
```

---

## Build Order

Build in exactly this sequence. Each step unblocks the next.

1. **Mock data** (`inner-state-os/lib/mockTasks.ts`, `mockData.ts`) — types already exist
2. **Gemini + Claude clients** (`inner-state-os/lib/gemini.ts`, `claude.ts`)
3. **Matching logic** (`inner-state-os/lib/matching.ts`)
4. **CORS helper** (`inner-state-os/lib/cors.ts`)
5. **API routes** (`inner-state-os/app/api/...`) — all four routes
6. **Extension constants + API client** (`inner-state-os-ext/lib/constants.ts`, `api.ts`)
7. **Orb component** (`inner-state-os-ext/components/Orb.tsx`)
8. **Audio capture hook** (`inner-state-os-ext/hooks/useAudioCapture.ts`) — tabCapture + mic mixing
9. **Background service worker** (`inner-state-os-ext/background.ts`) — tabCapture initiation
10. **Session state hook** (`inner-state-os-ext/hooks/useSessionState.ts`)
11. **TaskCard + ArcCard** (`inner-state-os-ext/components/TaskCard.tsx`, `ArcCard.tsx`)
12. **Panel component** (`inner-state-os-ext/components/Panel.tsx`) — all states
13. **Content script** (`inner-state-os-ext/contents/orb.tsx`) — wires everything
14. **Manifest permissions** — update `package.json` with `tabCapture`, `activeTab`
15. **Integration test** — full flow end to end
16. **Agora swap-in** (stretch goal) — replace `getUserMedia` mic with Agora SDK
17. **Demo prep** — rehearse script 3x

---

## Demo Flow (Rehearse This Exactly)

**Step 1:** Open Chrome with extension loaded. Open Google Meet in a tab. Join a call (or fake one). Orb visible in bottom right corner. Idle state (grey, slow pulse).

**Step 2:** Click the orb. It starts recording tab audio + mic. Orb enters listening state. Say:
*"Yeah so today I'm still working on the auth ticket, I'm pretty tired from yesterday honestly, we had a lot of back and forth about the account lock thing..."*
→ Orb shifts to amber. Pace: slow. Intensity: 3.

**Step 3:** Continue: *"...and I just don't really have the energy to dig into that today."*
→ Orb pulses more slowly. Intensity drops to 2.

**Step 4:** Click orb to end standup.
→ Orb enters processing state (fast spin).

**Step 5:** Panel slides in with task recommendations.
→ ArcCard: "Tired → Low energy → Settling"
→ Top task: "Reply to Sarah's Slack message"
→ Agent note: *"You're running low on energy today. Starting with something lightweight will help you build momentum before the heavier work."*

**The moment that wins the demo:** The agent didn't ask what you wanted to do. It just knew.

---

## What NOT to Build

- No Jira OAuth integration (mock it)
- No Slack OAuth integration (mock it)
- No user accounts or auth
- No persistent storage beyond session memory
- No HD chart or external profile
- No mobile UI
- No settings screen beyond mic permission
- No Prefect server (intervention detection is inline in analyze-chunk route)
- No Exa integration (removed from scope)
- No speech-to-text / keyword detection (click-only to start/stop)

---

## Error Handling Rules

- Every API route must have a try/catch that falls back to mock data from `lib/mockData.ts`
- Never let a failed API call break the demo
- Log errors to console only — no error UI during demo
- If Gemini returns malformed JSON, default to `mockEmotionChunk`
- If Claude returns malformed JSON, default to `mockSessionSummary` or `mockIntervention`
- If tabCapture or mic fails, show a muted orb state (grey, no pulse) — do not crash
- If `fetch` to backend fails, return mock data on the extension side too

---

## Code Style

- TypeScript everywhere
- Inline styles or CSS-in-JS for extension components (avoids Tailwind-in-content-script complexity with Plasmo shadow DOM)
- Framer Motion for all orb animations
- No useEffect chains — keep state simple
- Keep API routes under 50 lines each
- Prefer async/await over .then chains
- Name things clearly — no abbreviations

---

*Inner State OS — Agent Glow Up Hackathon 2026*
*Built with: Gemini · Claude · Plasmo · Next.js · Vercel · (Agora — stretch goal for sponsor credit)*
