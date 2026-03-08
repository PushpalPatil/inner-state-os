import { motion, AnimatePresence } from "framer-motion"
import { ArcCard } from "./ArcCard"
import { TaskCard } from "./TaskCard"

export function Panel({ state, results, interventionData }: any) {
  return (
    <AnimatePresence>
      {state !== "idle" && state !== "listening" && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          style={{ position: "fixed", top: 0, right: 0, width: 360, height: "100vh", background: "#080810", borderLeft: "1px solid #1a1a2e", padding: 20, overflowY: "auto" as const, zIndex: 999998 }}
        >
          {state === "processing" && (
            <div style={{ color: "#888", fontSize: 14, marginTop: 40, textAlign: "center" as const }}>
              Reading your standup...
            </div>
          )}
          {state === "results" && results && (
            <>
              <ArcCard summary={results} />
              {results.recommendedTasks?.map((task: any) => <TaskCard key={task.id} task={task} />)}
            </>
          )}
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
