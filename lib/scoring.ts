export function calculatePoints(
  predictedA: number,
  predictedB: number,
  resultA: number,
  resultB: number
): number {
  if (predictedA === resultA && predictedB === resultB) return 3

  const predictedDiff = predictedA - predictedB
  const actualDiff = resultA - resultB

  // Correct winner AND correct goal difference
  if (predictedDiff === actualDiff) return 2

  // Correct winner only (or both predicted draw)
  if (Math.sign(predictedDiff) === Math.sign(actualDiff)) return 1

  return 0
}
