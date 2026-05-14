export function calculatePoints(
  predictedA: number,
  predictedB: number,
  resultA: number,
  resultB: number
): number {
  const predictedDiff = predictedA - predictedB
  const actualDiff = resultA - resultB
  const predictedWinner = Math.sign(predictedDiff)
  const actualWinner = Math.sign(actualDiff)

  // Wrong winner → 0 points
  if (predictedWinner !== actualWinner) return 0

  // Correct winner or draw: 3 base points
  let points = 3
  const isDraw = actualWinner === 0

  // +1 for correct goal difference (non-draws only)
  if (!isDraw && predictedDiff === actualDiff) points += 1

  // +1 for exact score
  if (predictedA === resultA && predictedB === resultB) points += 1

  return points
}
