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

export function Panel({ state, results, interventionData, emotion, emotionLog, transcriptParts, errorMessage, onClose }: any) {
  const hasTranscript = transcriptParts && transcriptParts.length > 0
  const showPanel = state === "processing" || state === "results" || state === "intervention" || state === "error" || (state === "listening" && hasTranscript)

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
              <MiniOrb emotion={state === "error" ? "frustrated" : (emotion || "calm")} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e8e8f0", letterSpacing: "0.02em" }}>
                {state === "processing" ? "Reading your standup..." : state === "listening" ? "Listening..." : state === "error" ? "Something went wrong" : "Inner State OS"}
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

          {/* Error state */}
          {state === "error" && (
            <div style={{
              padding: 16, borderRadius: 10, background: "#1a0a0a",
              border: "1px solid #ff6b35", marginBottom: 16,
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#ff6b35", marginBottom: 8 }}>
                API Error
              </div>
              <div style={{ fontSize: 12, color: "#ccc", lineHeight: 1.6, marginBottom: 12 }}>
                {errorMessage || "An unknown error occurred."}
              </div>
              <div style={{ fontSize: 11, color: "#888", lineHeight: 1.5 }}>
                Check that your API keys are valid in <span style={{ color: "#aaa", fontFamily: "monospace" }}>.env.local</span> and the Next.js server is running.
              </div>
            </div>
          )}

          {/* Live transcript */}
          {transcriptParts && transcriptParts.length > 0 && (state === "listening" || state === "processing" || state === "results") && (
            <div style={{
              padding: 12, borderRadius: 8, background: "#0a0a18",
              border: "1px solid #1a1a2e", marginBottom: 16, maxHeight: 160,
              overflowY: "auto" as const,
            }}>
              <div style={{
                fontSize: 10, color: "#555", textTransform: "uppercase" as const,
                letterSpacing: "0.08em", marginBottom: 6,
              }}>
                Transcript
              </div>
              <div style={{ fontSize: 12, color: "#bbb", lineHeight: 1.6 }}>
                {transcriptParts.join(" ")}
              </div>
            </div>
          )}

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
