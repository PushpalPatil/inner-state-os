import { motion, AnimatePresence } from "framer-motion"
import { ArcCard } from "./ArcCard"
import { TaskCard } from "./TaskCard"
import { emotionColors } from "../lib/constants"

function MiniOrb({ emotion }: { emotion: string }) {
  const color = emotionColors[emotion] || "#7547FF"
  return (
    <div style={{
      width: 32, height: 32, borderRadius: "50%",
      background: `radial-gradient(circle, #000E7A 0%, #5a3fd4 40%, ${color}88 70%, transparent 100%)`,
      filter: "blur(1px)",
      flexShrink: 0,
    }} />
  )
}

export function Panel({ state, results, interventionData, emotion, emotionLog, onClose }: any) {
  const showPanel = state === "processing" || state === "results" || state === "intervention"

  return (
    <AnimatePresence>
      {showPanel && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          style={{
            position: "fixed", top: 0, right: 0, width: 360, height: "100vh",
            background: "#080810", borderLeft: "1px solid #1a1a2e",
            padding: 20, overflowY: "auto" as const, zIndex: 999998,
            display: "flex", flexDirection: "column" as const,
          }}
        >
          {/* Header with mini orb and close button */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid #1a1a2e",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <MiniOrb emotion={emotion || "calm"} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e8e8f0", letterSpacing: "0.02em" }}>
                {state === "processing" ? "Reading your standup..." : "Inner State OS"}
              </span>
            </div>
            {state !== "processing" && (
              <div
                onClick={onClose}
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#555", fontSize: 16,
                  background: "#14141f", border: "1px solid #222",
                }}
              >
                ✕
              </div>
            )}
          </div>

          {/* Processing state */}
          {state === "processing" && (
            <div style={{ color: "#888", fontSize: 14, marginTop: 40, textAlign: "center" as const }}>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Synthesizing your emotional state...
              </motion.div>
            </div>
          )}

          {/* Results state — no data */}
          {state === "results" && !results && (
            <ArcCard summary={null} emotionLog={emotionLog} />
          )}

          {/* Results state — with data */}
          {state === "results" && results && (
            <>
              <ArcCard summary={results} emotionLog={emotionLog} />
              <div style={{ fontSize: 11, color: "#555", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 8, marginTop: 4 }}>
                Recommended task order
              </div>
              {results.recommendedTasks?.map((task: any) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </>
          )}

          {/* Intervention state */}
          {state === "intervention" && interventionData && (
            <div style={{ padding: 16, background: "#1a0010", border: "1px solid #f72585", borderRadius: 10 }}>
              <div style={{ fontSize: 14, color: "#f72585", marginBottom: 8 }}>{interventionData.message}</div>
              <div style={{ fontSize: 13, color: "#aaa" }}>{interventionData.question}</div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
