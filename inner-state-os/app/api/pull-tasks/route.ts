import { withCors, OPTIONS } from "@/lib/cors"
import { mockTasks } from "@/lib/mockTasks"
import { rankTasksByState } from "@/lib/matching"

export { OPTIONS }

export async function POST(req: Request) {
  try {
    const { emotion, intensity } = await req.json()
    const ranked = rankTasksByState(emotion, intensity, mockTasks)
    return withCors({ tasks: ranked })
  } catch (e) {
    return withCors({ tasks: mockTasks })
  }
}
