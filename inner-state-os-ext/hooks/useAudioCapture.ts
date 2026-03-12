import { useRef } from "react"
import { analyzeChunk } from "../lib/api"

const CHUNK_INTERVAL_MS = 5000
const SILENCE_THRESHOLD = 0.01 // RMS below this = silence

export function useAudioCapture(onResult: (result: any) => void) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const sessionIdRef = useRef<string>("")
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  /** Check if current audio level is above silence threshold */
  const isSilent = (): boolean => {
    const analyser = analyserRef.current
    if (!analyser) return false

    const data = new Float32Array(analyser.fftSize)
    analyser.getFloatTimeDomainData(data)

    // Calculate RMS (root mean square) volume
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i]
    }
    const rms = Math.sqrt(sum / data.length)
    return rms < SILENCE_THRESHOLD
  }

  const startCapture = async (sessionId: string) => {
    // Clean up any previous recording
    stopCapture()

    sessionIdRef.current = sessionId

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    // Set up AnalyserNode for silence detection
    const audioCtx = new AudioContext()
    audioCtxRef.current = audioCtx
    const source = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 2048
    source.connect(analyser)
    analyserRef.current = analyser

    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" })
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = async (e) => {
      if (e.data.size === 0) return

      // Skip silent chunks to save API calls
      if (isSilent()) {
        console.log("[InnerStateOS] Skipping silent chunk")
        return
      }

      try {
        const buffer = await e.data.arrayBuffer()
        const bytes = new Uint8Array(buffer)
        let binary = ""
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        const base64 = btoa(binary)
        const result = await analyzeChunk(base64, sessionIdRef.current)
        onResult(result)
      } catch (err) {
        console.error("Chunk analysis failed:", err)
      }
    }

    recorder.start(CHUNK_INTERVAL_MS)
  }

  const stopCapture = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {})
      audioCtxRef.current = null
    }
    analyserRef.current = null
    mediaRecorderRef.current = null
  }

  return { startCapture, stopCapture }
}
