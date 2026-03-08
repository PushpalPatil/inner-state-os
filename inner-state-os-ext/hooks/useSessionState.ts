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
