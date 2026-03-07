export function getTargetIntensity(emotion: string, intensity: number): number {
  if (emotion === "calm" || emotion === "grounded") return 5
  if (emotion === "reactive" || intensity >= 4) return 1
  if (emotion === "scattered" || emotion === "frustrated") return 2
  return 3
}

export function rankTasksByState(emotion: string, intensity: number, tasks: any[]) {
  const target = getTargetIntensity(emotion, intensity)
  return [...tasks]
    .sort((a, b) => Math.abs(a.intensity - target) - Math.abs(b.intensity - target))
    .map((task, i) => ({ ...task, rank: i + 1 }))
}
