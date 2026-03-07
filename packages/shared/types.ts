export type Emotion = "calm" | "scattered" | "frustrated" | "reactive" | "grounded"

export interface EmotionChunk {
      emotion: Emotion
      intensity: number
      confidence: number
      pace: "slow" | "medium" | "fast"
      note: string
      timestamp: string
}

export interface Task {
      id: string
      title: string
      description: string
      intensity: number
      type: "communication" | "review" | "deep-work" | "admin"
      source: "slack" | "jira" | "email" | "other"
}

export interface RankedTask extends Task {
      rank: number
      reason: string
}

export interface SessionSummary {
      arc: string
      dominantEmotion: Emotion
      averageIntensity: number
      recommendedTasks: RankedTask[]
      explanation: string
}