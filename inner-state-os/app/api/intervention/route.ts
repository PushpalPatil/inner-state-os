import Anthropic from "@anthropic-ai/sdk"
import { withCors, OPTIONS } from "@/lib/cors"
import { mockIntervention } from "@/lib/mockData"

export { OPTIONS }

const client = new Anthropic()

export async function POST(req: Request) {
  const { recentChunks } = await req.json()
  try {
    const msg = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 150,
      messages: [{
        role: "user",
        content: `Voice analysis of last 30 seconds: ${JSON.stringify(recentChunks)}
        Write ONE calm observation (1 sentence). Ask ONE open question. No advice.
        Return JSON only: { "message": string, "question": string }`
      }]
    })
    const raw = (msg.content[0] as any).text
    return withCors(JSON.parse(raw.replace(/```json|```/g, "").trim()))
  } catch (e) {
    return withCors(mockIntervention)
  }
}
