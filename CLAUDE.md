# Inner State OS — Claude Code Instructions

## What This Project Is

A Chrome extension (Plasmo + React) paired with a Next.js backend (deployed on Vercel).

The extension floats as an orb on screen. It listens to the user's daily standup meeting via microphone, analyzes their emotional state through voice, and after the standup ends recommends which tasks to start with — ranked by cognitive intensity match.

**Core loop:**
1. User starts standup → orb activates and listens
2. Orb analyzes voice in real time → detects emotional state
3. Standup ends → agent synthesizes state + recommends tasks in order
4. User sees ranked task list with a brief explanation of why

---

## Monorepo Structure

```
inner-state-os/
├── apps/
│   ├── web/          ← Next.js app (Vercel backend + API routes)
│   └── extension/    ← Plasmo Chrome extension (orb UI + mic capture)
├── packages/
│   └── shared/       ← Shared types and constants
└── CLAUDE.md
```

---

## Apps

### `apps/web` — Next.js (Backend)

**Purpose:** API routes only. No frontend pages needed.

**Routes:**
- `POST /api/analyze-chunk` — receives base64 audio, returns emotion analysis via Gemini
- `POST /api/pull-tasks` — returns task list ranked by intensity match to current emotion
- `POST /api/session-summary` — receives full emotion log, returns standup summary + recommended task order via Claude
- `POST /api/intervention` — receives recent chunks, returns reflection message via Claude

**Key files:**
```
apps/web/
├── app/
│   └── api/
│       ├── analyze-chunk/route.ts
│       ├── pull-tasks/route.ts
│       ├── session-summary/route.ts
│       └── intervention/route.ts
├── lib/
│   ├── gemini.ts       ← Gemini client
│   ├── claude.ts       ← Anthropic client
│   ├── mockTasks.ts    ← Hardcoded task list for hackathon
│   └── mockData.ts     ← Fallback data if APIs fail
└── .env.local
```

**Environment variables required:**
```
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
EXA_API_KEY=
PREFECT_SERVER_URL=
```

---

### `apps/extension` — Plasmo (Chrome Extension)

**Purpose:** Floating orb UI injected into all pages. Mic capture. Calls web API routes.

**Key files:**
```
apps/extension/
├── contents/
│   └── orb.tsx           ← Main content script, renders orb on all pages
├── components/
│   ├── Orb.tsx           ← Animated orb, color = emotion state
│   ├── Panel.tsx         ← Slide-in panel with task recommendations
│   ├── TaskCard.tsx      ← Individual task with intensity label
│   └── ArcCard.tsx       ← Post-standup summary card
├── hooks/
│   ├── useVoiceCapture.ts  ← Agora mic + chunking logic
│   └── useSessionState.ts  ← Emotion log, panel state management
├── lib/
│   └── api.ts            ← All fetch calls to Vercel API routes
└── .env.development
```

**Environment variables required:**
```
PLASMO_PUBLIC_API_URL=https://your-app.vercel.app
PLASMO_PUBLIC_AGORA_APP_ID=
```

---

## Shared Types

Always import types from `packages/shared`. Keep them in sync.

```typescript
// packages/shared/types.ts

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

```typescript
export const emotionColors = {
  calm:       "#4f8fff",   // blue
  scattered:  "#f4a261",   // amber
  frustrated: "#ff6b35",   // orange
  reactive:   "#f72585",   // rose
  grounded:   "#57cc99"    // green
}
```

---

## Task Intensity → State Matching Logic

```typescript
// Low intensity state (1-2) → recommend low intensity tasks first
// Medium intensity state (3) → recommend medium tasks first  
// High intensity / reactive state (4-5) → recommend low tasks first (not deep work)
// Calm / grounded state (1-2) → recommend high intensity tasks first

export function matchTasksToState(emotion: Emotion, intensity: number, tasks: Task[]): RankedTask[] {
  const targetIntensity = getTargetIntensity(emotion, intensity)
  return tasks
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

## API Contract

### POST /api/analyze-chunk
```typescript
// Request
{ audioBase64: string, sessionId: string }

// Response
{
  emotion: Emotion,
  intensity: number,
  confidence: number,
  pace: string,
  note: string,
  shouldIntervene: boolean    // Set by Prefect threshold check
}
```

### POST /api/session-summary
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

---

## Gemini Prompt (analyze-chunk)

```typescript
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

## Claude Prompt (session-summary)

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

---

## Mock Tasks (Hardcoded for Hackathon)

```typescript
// lib/mockTasks.ts
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

---

## Panel States

The panel has exactly these states. Build them in this order:

```typescript
type PanelState =
  | "idle"          // Orb floating, not recording
  | "listening"     // Standup in progress, mic active, orb pulsing
  | "processing"    // Standup ended, synthesizing state + tasks
  | "results"       // Task recommendations visible
  | "intervention"  // Mid-standup emotional spike detected
```

---

## Orb States

The orb is always visible. It communicates through color + animation only.

```
idle        → slow pulse, neutral grey/blue
listening   → active pulse speed matches detected pace
processing  → fast spin / loading animation
results     → steady glow, color = dominant emotion from standup
intervention → burst animation, shifts to rose
```

---

## Prefect Flow (apps/prefect/session_flow.py)

```python
# Two tasks only:
# 1. log_chunk — append emotion chunk to session
# 2. check_threshold — detect spike, return shouldIntervene boolean

# Threshold rules:
# - Sharp spike: intensity jumps 2+ points between consecutive chunks
# - Sustained high: 3+ consecutive chunks at intensity >= 4
```

---

## Build Order

Build in exactly this sequence. Each step unblocks the next.

1. Shared types (`packages/shared/types.ts`)
2. Mock data (`apps/web/lib/mockTasks.ts`, `mockData.ts`)
3. API routes (`apps/web/app/api/...`) — all four routes
4. Orb component (`apps/extension/components/Orb.tsx`)
5. Voice capture hook (`apps/extension/hooks/useVoiceCapture.ts`)
6. Panel component (`apps/extension/components/Panel.tsx`) — all states
7. Content script (`apps/extension/contents/orb.tsx`) — wires everything
8. Prefect flow (`apps/prefect/session_flow.py`)
9. Integration test — full flow end to end
10. Demo prep — rehearse script 3x

---

## Demo Flow (Rehearse This Exactly)

**Step 1:** Open Chrome. Orb visible in bottom right corner. Idle state.

**Step 2:** Say: *"Yeah so today I'm still working on the auth ticket, I'm pretty tired from yesterday honestly, we had a lot of back and forth about the account lock thing..."*
→ Orb shifts to amber. Pace: slow. Intensity: 3.

**Step 3:** Say: *"...and I just don't really have the energy to dig into that today."*
→ Orb pulses more slowly. Intensity drops to 2.

**Step 4:** Click orb or say "that's it for me" to end standup.
→ Orb enters processing state.

**Step 5:** Panel slides in with task recommendations.
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

---

## Error Handling Rules

- Every API route must have a try/catch that falls back to mock data
- Never let a failed API call break the demo
- Log errors to console only — no error UI during demo
- If Gemini returns malformed JSON, default to `{ emotion: "calm", intensity: 2 }`
- If mic fails, show a muted orb state — do not crash

---

## Code Style

- TypeScript everywhere
- Tailwind for all styling in extension
- Framer Motion for all orb animations
- No useEffect chains — keep state simple
- Keep API routes under 50 lines each
- Prefer async/await over .then chains
- Name things clearly — no abbreviations

---

*Inner State OS — Agent Glow Up Hackathon 2026*
*Built with: Agora · Gemini · Claude · Prefect · Exa · Plasmo · Next.js · Vercel*
