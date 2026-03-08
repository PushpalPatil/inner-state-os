import { emotionColors } from "../lib/constants"

function IntensityBar({ value }: { value: number }) {
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: 4, height: 14,
            borderRadius: 2,
            background: i <= value ? "#c4a8ff" : "#2a2a3a",
          }}
        />
      ))}
    </div>
  )
}

export function ArcCard({ summary, emotionLog }: any) {
  const color = emotionColors[summary?.dominantEmotion] || "#f4a261"
  const hasEnoughData = emotionLog && emotionLog.length > 0 && summary

  if (!hasEnoughData) {
    return (
      <div style={{
        padding: 16, borderRadius: 10, background: "#0f0f1a",
        borderLeft: "3px solid #555", marginBottom: 16,
      }}>
        <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6 }}>
          Not enough audio captured to generate an analysis. Try recording for at least 10 seconds.
        </div>
      </div>
    )
  }

  // Get dominant chunk info for the summary
  const dominant = emotionLog.reduce((best: any, chunk: any) =>
    !best || chunk.intensity > best.intensity ? chunk : best
  , null)

  return (
    <div style={{
      padding: 16, borderRadius: 10, background: "#0f0f1a",
      borderLeft: `3px solid ${color}`, marginBottom: 16,
    }}>
      {/* Arc journey */}
      <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
        {summary.arc}
      </div>
      <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.6, marginBottom: 14 }}>
        {summary.explanation}
      </div>

      {/* Dominant emotion reading */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 10px", borderRadius: 8,
        background: "#0a0a18", border: "1px solid #1a1a2e",
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: color, flexShrink: 0,
          boxShadow: `0 0 8px ${color}60`,
        }} />
        <span style={{ fontSize: 13, color: "#e8e8f0", textTransform: "capitalize" as const, flex: 1 }}>
          {summary.dominantEmotion}
        </span>
        <span style={{ fontSize: 10, color: "#555", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>
          {dominant?.pace || "medium"}
        </span>
        <IntensityBar value={Math.round(summary.averageIntensity)} />
      </div>

      {/* Observation note */}
      {dominant?.note && (
        <div style={{ fontSize: 11, color: "#666", marginTop: 8, lineHeight: 1.4, paddingLeft: 2 }}>
          {dominant.note}
        </div>
      )}
    </div>
  )
}
