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
        background: "radial-gradient(circle at 50% 50%, #000E7A 0%, #2a2aaa 10%, #5a3fd4 30%, #8b6cef 45%, #c4a8ff 60%, #e8d5ff 75%, #f0e8ff 85%, #D6E3FF 95%, #FFEBFF 100%)",
        filter: "blur(3px)",
        cursor: "pointer",
      }}
    />
  )
}
