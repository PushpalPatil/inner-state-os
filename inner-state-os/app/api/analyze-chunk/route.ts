import { GoogleGenerativeAI } from "@google/generative-ai"
import { withCors, OPTIONS } from "@/lib/cors"
import { logChunk, checkThreshold } from "@/lib/sessionStore"

export { OPTIONS }

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(req: Request) {
  const { audioBase64, sessionId } = await req.json()
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent([
      { inlineData: { mimeType: "audio/webm;codecs=opus", data: audioBase64 } },
      { text: `Analyze this audio of a software engineer in their standup.
        Return ONLY valid JSON, no markdown:
        {
          "emotion": "calm|scattered|frustrated|reactive|grounded",
          "intensity": <1-5>,
          "pace": "slow|medium|fast",
          "confidence": <0.0-1.0>,
          "note": "<one sentence, observable fact about their voice>",
          "transcript": "<verbatim transcription of what was said, or empty string if inaudible>"
        }` }
    ])
    const raw = result.response.text()
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim())
    const chunks = logChunk(sessionId, parsed)
    const shouldIntervene = checkThreshold(chunks)
    return withCors({ ...parsed, shouldIntervene })
  } catch (e: any) {
    console.error("[analyze-chunk] Error:", e)
    const message = e?.message || "Unknown error"
    return withCors({ error: `Gemini API failed: ${message}` }, 500)
  }
}
