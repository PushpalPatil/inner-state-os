import type { PlasmoCSConfig } from "plasmo"
import { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
    transcriptParts,
    results, setResults,
    interventionData, setInterventionData,
    errorMessage, setErrorMessage,
    sessionId, reset
  } = useSessionState()

  const { startCapture, stopCapture } = useAudioCapture(async (result) => {
    addChunk(result)
    if (result.shouldIntervene && !interventionData) {
      try {
        const data = await getIntervention(emotionLog.slice(-3))
        setInterventionData(data)
        setPanelState("intervention")
      } catch (e: any) {
        console.error("Intervention failed:", e.message)
      }
    }
  })

  // Listen for extension icon click
  useEffect(() => {
    const listener = (message: any) => {
      if (message.type === "TOGGLE_ORB") {
        // Always reset and start fresh
        reset()
        const newSessionId = crypto.randomUUID()
        startCapture(newSessionId)
          .then(() => setPanelState("listening"))
          .catch((e) => console.error("Failed to start capture:", e))
      }
    }
    chrome.runtime.onMessage.addListener(listener)
    return () => chrome.runtime.onMessage.removeListener(listener)
  }, [])

  // Click orb to stop recording and get summary
  const handleOrbClick = async () => {
    if (panelState === "listening") {
      stopCapture()

      // Not enough audio — show results with no-data state
      if (emotionLog.length === 0) {
        setResults(null)
        setPanelState("results")
        return
      }

      setPanelState("processing")
      try {
        const summary = await getSessionSummary(emotionLog, sessionId)
        setResults(summary)
        setPanelState("results")
      } catch (e: any) {
        console.error("Failed to get summary:", e)
        setErrorMessage(e.message || "Failed to generate summary")
        setPanelState("error")
      }
    }
  }

  // Close panel and reset
  const handleClose = () => {
    stopCapture()
    reset()
    setPanelState("idle")
  }

  return (
    <>
      <AnimatePresence>
        {panelState === "listening" && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            style={{ position: "fixed", top: 24, right: 24, zIndex: 999999 }}
          >
            <Orb
              emotion={emotion}
              intensity={intensity}
              isListening={true}
              onClick={handleOrbClick}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Panel
        state={panelState}
        results={results}
        interventionData={interventionData}
        emotion={emotion}
        emotionLog={emotionLog}
        transcriptParts={transcriptParts}
        errorMessage={errorMessage}
        onClose={handleClose}
      />
    </>
  )
}
