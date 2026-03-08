// Option 3: Both Combined — layered blobs + rotating highlight + pulse. Most alive-looking.
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
          "0 0 40px #7547FF40, 0 0 90px #D499FF20",
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
      {/* Blob A — slow clockwise */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", inset: -12, borderRadius: "50%",
          background: "radial-gradient(ellipse at 25% 35%, #5a3fd4 0%, transparent 55%)",
          opacity: 0.9,
          filter: "blur(5px)",
        }}
      />
      {/* Blob B — medium counter-clockwise */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", inset: -12, borderRadius: "50%",
          background: "radial-gradient(ellipse at 70% 55%, #D499FF 0%, transparent 50%)",
          opacity: 0.75,
          filter: "blur(7px)",
        }}
      />
      {/* Blob C — fast, light accent */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", inset: -8, borderRadius: "50%",
          background: "radial-gradient(ellipse at 45% 25%, #FFEBFF 0%, transparent 40%)",
          opacity: 0.45,
          filter: "blur(8px)",
        }}
      />
      {/* Center dark core */}
      <div style={{
        position: "absolute", inset: 12, borderRadius: "50%",
        background: "radial-gradient(circle, #000E7A 0%, #1a1a8a 60%, transparent 100%)",
        filter: "blur(2px)",
      }} />
      {/* Rotating specular highlight */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.2) 0%, transparent 40%)",
        }}
      />
    </motion.div>
  )
}
