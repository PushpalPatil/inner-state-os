import { useState, useRef } from "react"

export type PanelState = "idle" | "listening" | "processing" | "results" | "intervention" | "error"

export function useSessionState() {
  const [panelState, setPanelState] = useState<PanelState>("idle")
  const [emotion, setEmotion] = useState("calm")
  const [intensity, setIntensity] = useState(1)
  const [emotionLog, setEmotionLog] = useState<any[]>([])
  const [transcriptParts, setTranscriptParts] = useState<string[]>([])
  const [results, setResults] = useState<any>(null)
  const [interventionData, setInterventionData] = useState<any>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const sessionId = useRef(crypto.randomUUID())

  const addChunk = (chunk: any) => {
    setEmotion(chunk.emotion)
    setIntensity(chunk.intensity)
    setEmotionLog(prev => [...prev, chunk])
    if (chunk.transcript) {
      setTranscriptParts(prev => [...prev, chunk.transcript])
    }
  }

  const reset = () => {
    setEmotionLog([])
    setTranscriptParts([])
    setEmotion("calm")
    setIntensity(1)
    setResults(null)
    setInterventionData(null)
    setErrorMessage(null)
    sessionId.current = crypto.randomUUID()
  }

  return {
    panelState, setPanelState,
    emotion, intensity,
    emotionLog, addChunk,
    transcriptParts,
    results, setResults,
    interventionData, setInterventionData,
    errorMessage, setErrorMessage,
    sessionId: sessionId.current,
    reset
  }
}
