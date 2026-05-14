import PredictionForm from './PredictionForm'
import type { MatchWithPrediction } from '@/types'
import type { T } from '@/lib/i18n'

const POINTS_COLORS: Record<number, string> = {
  5: 'text-yellow-400',
  4: 'text-emerald-400',
  3: 'text-blue-400',
  0: 'text-red-400',
}

interface Props {
  match: MatchWithPrediction
  canPredict: boolean
  tr: T
}

export default function MatchCard({ match, canPredict, tr }: Props) {
  const { prediction } = match
  const isFinished = match.status === 'finished'
  const stageLabel = tr.stages[match.stage as keyof T['stages']] ?? match.stage
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
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {stageLabel}{groupLabel}
        </span>
        <span className="text-xs text-gray-500">{kickoff}</span>
      </div>

      {/* Teams */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="h-10 flex items-center justify-center">
            <span className="text-3xl leading-none">{match.flag_a || '🏳️'}</span>
          </div>
          <span className="text-white text-xs font-semibold text-center leading-tight">{match.team_a}</span>
        </div>

        <div className="shrink-0 w-16 h-10 flex items-center justify-center">
          {isFinished && match.result_a != null && match.result_b != null ? (
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-white">{match.result_a}</span>
              <span className="text-gray-500">-</span>
              <span className="text-2xl font-bold text-white">{match.result_b}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-600 italic">vs</span>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="h-10 flex items-center justify-center">
            <span className="text-3xl leading-none">{match.flag_b || '🏳️'}</span>
          </div>
          <span className="text-white text-xs font-semibold text-center leading-tight">{match.team_b}</span>
        </div>
      </div>

      {/* Prediction / result row */}
      <div className="mt-3 flex justify-center">
        {isFinished && match.result_a != null && match.result_b != null ? (
          prediction && prediction.points != null ? (
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <span className="text-xs text-gray-500">{tr.matchCard.yourPick}</span>
              <span className="text-xs text-gray-400">{prediction.predicted_a}-{prediction.predicted_b}</span>
              <span className={`text-xs font-bold ${POINTS_COLORS[prediction.points] ?? 'text-gray-400'}`}>
                +{prediction.points}pts
              </span>
            </div>
          ) : (
            <span className="text-xs text-gray-600">{tr.matchCard.noPrediction}</span>
          )
        ) : canPredict ? (
          <PredictionForm
            matchId={match.id}
            initialA={prediction?.predicted_a}
            initialB={prediction?.predicted_b}
            labels={tr.predictionForm}
          />
        ) : prediction ? (
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-300">{prediction.predicted_a}</span>
            <span className="text-gray-500">-</span>
            <span className="text-xl font-bold text-gray-300">{prediction.predicted_b}</span>
          </div>
        ) : null}
      </div>
    </div>
  )
}
