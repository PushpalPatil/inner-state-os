# Inner State OS

A Chrome extension that listens to your standup, reads your emotional state in real-time, and recommends which tasks to start with — ranked by cognitive intensity match.

Built with Gemini, Claude, Plasmo, and Next.js.

## How It Works

1. **Listen** — Click the orb during a video call standup. It captures your mic audio and sends chunks to Gemini every 10 seconds.
2. **Read** — Gemini analyzes each chunk for emotion, intensity, and pace in real-time. The orb changes color to reflect your state.
3. **Align** — When you stop recording, Claude synthesizes your emotional arc and recommends a task order matched to your current cognitive capacity.

## Project Structure

```
AI_Agent_Glow_Up/
├── inner-state-os/          # Next.js backend (API routes, deployed on Vercel)
├── inner-state-os-ext/      # Plasmo Chrome extension (orb UI + audio capture)
└── packages/shared/types.ts # Shared TypeScript types
```

## Prerequisites

- Node.js 18+
- npm
- Chrome browser (for loading the extension)

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/PushpalPatil/inner-state-os.git
cd inner-state-os
```

### 2. Install dependencies

```bash
# Backend
cd inner-state-os
npm install

# Extension
cd ../inner-state-os-ext
npm install
```

### 3. Configure environment variables

**Backend** — create `inner-state-os/.env.local`:
```
GEMINI_API_KEY=your_gemini_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

**Extension** — create `inner-state-os-ext/.env.development`:
```
PLASMO_PUBLIC_API_URL=http://localhost:3000
```

### 4. Run the backend

```bash
cd inner-state-os
npm run dev
```

Runs on http://localhost:3000.

### 5. Run the extension

```bash
cd inner-state-os-ext
npm run dev
```

Plasmo builds the extension into `build/chrome-mv3-dev/`.

### 6. Load the extension in Chrome

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `inner-state-os-ext/build/chrome-mv3-dev/` folder

### 7. Use it

1. Open any page in Chrome
2. Click the extension icon in the toolbar — the orb appears
3. Allow microphone access when prompted
4. Speak (as if in a standup)
5. Click the orb to stop — the panel slides in with your emotional summary and ranked tasks

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/analyze-chunk` | POST | Sends audio to Gemini for emotion analysis |
| `/api/pull-tasks` | POST | Returns tasks ranked by intensity match |
| `/api/session-summary` | POST | Claude synthesizes full standup summary |
| `/api/intervention` | POST | Claude generates grounding message during spikes |

## Tech Stack

- **Gemini 2.0 Flash** — real-time audio emotion analysis
- **Claude** — session summary + task ranking + intervention
- **Plasmo** — Chrome extension framework
- **Next.js** — API backend (deployed on Vercel)
- **Framer Motion** — orb animations
