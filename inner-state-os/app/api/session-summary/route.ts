import Anthropic from "@anthropic-ai/sdk"
import { withCors, OPTIONS } from "@/lib/cors"
import { mockTasks } from "@/lib/mockTasks"
import { rankTasksByState } from "@/lib/matching"

export { OPTIONS }

const client = new Anthropic()

export async function POST(req: Request) {
  try {
    const { emotionLog } = await req.json()
    const avgIntensity = emotionLog.reduce((s: number, c: any) => s + c.intensity, 0) / emotionLog.length
    const dominant = emotionLog.sort((a: any, b: any) =>
      emotionLog.filter((x: any) => x.emotion === b.emotion).length -
      emotionLog.filter((x: any) => x.emotion === a.emotion).length
    )[0]?.emotion || "calm"
    const preRanked = rankTasksByState(dominant, avgIntensity, mockTasks)

    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `A software engineer just finished their standup. Voice analysis: ${JSON.stringify(emotionLog)}
        Tasks pre-ranked by intensity match: ${JSON.stringify(preRanked)}
        Return ONLY valid JSON, no markdown:
        {
          "arc": "<3-4 state journey e.g. Tired → Scattered → Settling>",
          "dominantEmotion": "${dominant}",
          "averageIntensity": ${avgIntensity.toFixed(1)},
          "explanation": "<2 sentences: what you noticed + why tasks in this order>",
          "recommendedTasks": [
            { "id": "<id>", "rank": <1-5>, "reason": "<one sentence, human tone>" }
          ]
        }
        Rules: if averageIntensity >= 4 never rank deep-work first. reason must feel like a thoughtful colleague.`
      }]
    })
    const raw = (msg.content[0] as any).text
    return withCors(JSON.parse(raw.replace(/```json|```/g, "").trim()))
  } catch (e: any) {
    console.error("[session-summary] Error:", e)
    const message = e?.message || "Unknown error"
    return withCors({ error: `Claude API failed: ${message}` }, 500)
  }
}
