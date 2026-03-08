export function TaskCard({ task }: any) {
  const isDeferred = task.intensity >= 4
  const dotColor = task.intensity <= 2 ? "#57cc99" : task.intensity === 3 ? "#f4a261" : "#f72585"
  return (
    <div style={{ opacity: isDeferred ? 0.45 : 1, padding: "12px 14px", borderRadius: 8, marginBottom: 8, background: "#14141f", border: "1px solid #222" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "#555" }}>#{task.rank}</span>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: "#555", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{task.type}</span>
        {isDeferred && <span style={{ fontSize: 10, color: "#444", marginLeft: "auto" }}>save for later</span>}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#e8e8f0", marginBottom: 4 }}>{task.title}</div>
      <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5 }}>{task.reason}</div>
    </div>
  )
}
