import type { PlasmoCSConfig } from "plasmo"
import { useState } from "react"
import { Orb } from "../components/Orb"
import { Panel } from "../components/Panel"
import { useAudioCapture } from "../hooks/useAudioCapture"
import { useSessionState } from "../hooks/useSessionState"
import { getIntervention, getSessionSummary } from "../lib/api"

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

  const [streams, setStreams] = useState(null)

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
      try {
        const captured = await startCapture()
        setStreams(captured)
        setPanelState("listening")
      } catch (e) {
        console.error("Failed to start capture:", e)
      }
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
    <div style={{ position: "fixed", top: 24, right: 24, zIndex: 999999 }}>
      <Panel state={panelState} results={results} interventionData={interventionData} />
      <Orb emotion={emotion} intensity={intensity} isListening={panelState === "listening"} onClick={handleOrbClick} />
    </div>
  )
}
