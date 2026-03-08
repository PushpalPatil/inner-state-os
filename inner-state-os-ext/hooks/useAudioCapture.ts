import { useRef } from "react"
import { analyzeChunk } from "../lib/api"

export function useAudioCapture(onResult: (result: any) => void) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const sessionIdRef = useRef<string>("")

  const startCapture = async (sessionId: string) => {
    // Clean up any previous recording
    stopCapture()

    sessionIdRef.current = sessionId

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream

    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" })
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = async (e) => {
      if (e.data.size === 0) return
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

    recorder.start(10000)
  }

  const stopCapture = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    mediaRecorderRef.current = null
  }

  return { startCapture, stopCapture }
}
