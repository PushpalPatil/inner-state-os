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
