// Option 1: Rotating Highlight — gradient center orbits around the sphere
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
      }}
    >
      {/* Base sphere */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "radial-gradient(circle at 50% 50%, #000E7A 0%, #2a2aaa 10%, #5a3fd4 30%, #8b6cef 45%, #c4a8ff 60%, #e8d5ff 75%, #f0e8ff 85%, #D6E3FF 95%, #FFEBFF 100%)",
        filter: "blur(2px)",
      }} />
      {/* Rotating highlight */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.3) 0%, transparent 50%)",
        }}
      />
    </motion.div>
  )
}
