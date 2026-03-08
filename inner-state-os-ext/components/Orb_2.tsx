// Option 2: Layered Blobs — overlapping gradients rotating at different speeds, organic/liquid feel
import { motion } from "framer-motion"

export function Orb({ emotion, intensity, isListening, onClick }: any) {
  const pulseScale = 1 + (intensity * 0.20)
  return (
    <motion.div
      onClick={onClick}
      animate={{
        scale: [1, pulseScale, 1],
        boxShadow: [
          "0 0 20px #7547FF20, 0 0 60px #D499FF10",
          "0 0 35px #7547FF35, 0 0 80px #D499FF18",
          "0 0 20px #7547FF20, 0 0 60px #D499FF10"
        ]
      }}
      transition={{ duration: isListening ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" }}
      style={{
        width: 80,
        height: 80,
        borderRadius: "50%",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        background: "#000E7A",
      }}
    >
      {/* Blob A — slow rotation */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", inset: -10, borderRadius: "50%",
          background: "radial-gradient(ellipse at 30% 40%, #7547FF 0%, transparent 60%)",
          opacity: 0.9,
          filter: "blur(6px)",
        }}
      />
      {/* Blob B — medium speed, opposite direction */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", inset: -10, borderRadius: "50%",
          background: "radial-gradient(ellipse at 65% 60%, #D499FF 0%, transparent 55%)",
          opacity: 0.8,
          filter: "blur(8px)",
        }}
      />
      {/* Blob C — fast rotation, lighter accent */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", inset: -5, borderRadius: "50%",
          background: "radial-gradient(ellipse at 50% 30%, #FFEBFF 0%, transparent 45%)",
          opacity: 0.5,
          filter: "blur(10px)",
        }}
      />
      {/* Center core */}
      <div style={{
        position: "absolute", inset: 15, borderRadius: "50%",
        background: "radial-gradient(circle, #000E7A 0%, #2a2aaa 50%, transparent 100%)",
        filter: "blur(2px)",
      }} />
    </motion.div>
  )
}
