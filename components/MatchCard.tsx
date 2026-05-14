import PredictionForm from './PredictionForm'
import type { MatchWithPrediction } from '@/types'

const STAGE_LABELS: Record<string, string> = {
  group: 'Group',
  round_of_16: 'Round of 16',
  quarterfinal: 'Quarterfinal',
  semifinal: 'Semifinal',
  final: 'Final',
}

const POINTS_COLORS: Record<number, string> = {
  5: 'text-yellow-400',
  4: 'text-emerald-400',
  3: 'text-blue-400',
  0: 'text-red-400',
}

interface Props {
  match: MatchWithPrediction
  canPredict: boolean
}

export default function MatchCard({ match, canPredict }: Props) {
  const { prediction } = match
  const isFinished = match.status === 'finished'
  const stageLabel = STAGE_LABELS[match.stage] ?? match.stage
  const groupLabel = match.group_name ? ` ${match.group_name}` : ''

  const kickoff = new Date(match.scheduled_at).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {stageLabel}{groupLabel}
        </span>
        <span className="text-xs text-gray-500">{kickoff}</span>
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Team A */}
        <div className="flex flex-col items-center gap-1 w-24">
          <span className="text-3xl">{match.flag_a || '🏳️'}</span>
          <span className="text-white text-sm font-semibold text-center leading-tight">{match.team_a}</span>
        </div>

        {/* Score / Prediction */}
        <div className="flex flex-col items-center gap-2 flex-1">
          {isFinished && match.result_a != null && match.result_b != null ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">{match.result_a}</span>
                <span className="text-gray-500">-</span>
                <span className="text-2xl font-bold text-white">{match.result_b}</span>
              </div>

              {prediction && prediction.points != null && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">Your pick:</span>
                  <span className="text-xs text-gray-400">
                    {prediction.predicted_a}-{prediction.predicted_b}
                  </span>
                  <span className={`text-xs font-bold ml-1 ${POINTS_COLORS[prediction.points] ?? 'text-gray-400'}`}>
                    +{prediction.points}pts
                  </span>
                </div>
              )}

              {!prediction && (
                <span className="text-xs text-gray-600">No prediction</span>
              )}
            </>
          ) : canPredict ? (
            <PredictionForm
              matchId={match.id}
              initialA={prediction?.predicted_a}
              initialB={prediction?.predicted_b}
            />
          ) : prediction ? (
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-300">{prediction.predicted_a}</span>
              <span className="text-gray-500">-</span>
              <span className="text-xl font-bold text-gray-300">{prediction.predicted_b}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-600 italic">vs</span>
          )}
        </div>

        {/* Team B */}
        <div className="flex flex-col items-center gap-1 w-24">
          <span className="text-3xl">{match.flag_b || '🏳️'}</span>
          <span className="text-white text-sm font-semibold text-center leading-tight">{match.team_b}</span>
        </div>
      </div>
    </div>
  )
}
