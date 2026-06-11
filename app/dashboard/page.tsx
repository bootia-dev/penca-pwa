import { auth } from '@/auth'
import { db } from '@/lib/supabase'
import { getLocale, t } from '@/lib/i18n'
import Navbar from '@/components/Navbar'
import DashboardTabs from '@/components/DashboardTabs'
import type { Match, Prediction, MatchWithPrediction } from '@/types'

export const revalidate = 0

export default async function DashboardPage() {
  const [session, locale] = await Promise.all([auth(), getLocale()])
  const userId = session!.user!.email!
  const tr = t(locale)
  const d = tr.dashboard

  const [matchesRes, predictionsRes] = await Promise.all([
    db().from('matches').select('*').order('scheduled_at', { ascending: true }),
    db().from('predictions').select('*').eq('user_id', userId),
  ])

  const matches: Match[] = matchesRes.data ?? []
  const predictions: Prediction[] = predictionsRes.data ?? []
  const predMap = new Map(predictions.map((p) => [p.match_id, p]))
  const now = new Date()

  const withPredictions: MatchWithPrediction[] = matches.map((m) => ({
    ...m,
    prediction: predMap.get(m.id) ?? null,
  }))

  const pending = withPredictions.filter(
    (m) => m.status !== 'finished' && new Date(m.scheduled_at) > now && !m.prediction
  )
  // Include matches that have started or finished even without a prediction,
  // so users can see they missed predicting them
  const predicted = withPredictions.filter(
    (m) => m.prediction || m.status === 'finished' || new Date(m.scheduled_at) <= now
  )

  const totalPoints = predictions.reduce((sum, p) => sum + (p.points ?? 0), 0)

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <div className="mb-6 bg-gray-800 rounded-2xl p-4 border border-gray-700 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{d.totalPoints}</p>
            <p className="text-3xl font-bold text-white">{totalPoints}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">{d.predictions}</p>
            <p className="text-3xl font-bold text-white">{predictions.length}</p>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="text-center text-gray-600 mt-20">
            <div className="text-4xl mb-3">📅</div>
            <p>{d.noMatches}</p>
          </div>
        ) : (
          <DashboardTabs predicted={predicted} pending={pending} tr={tr} allMatches={withPredictions} />
        )}
      </main>
    </>
  )
}
