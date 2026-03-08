import { emotionColors } from "../lib/constants"

export function ArcCard({ summary }: any) {
  const color = emotionColors[summary.dominantEmotion] || "#4f8fff"
  return (
    <div style={{ padding: 16, borderRadius: 10, marginBottom: 12, background: "#0f0f1a", borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{summary.arc}</div>
      <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6 }}>{summary.explanation}</div>
    </div>
  )
}
