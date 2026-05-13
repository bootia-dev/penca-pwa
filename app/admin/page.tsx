import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/supabase'
import { createMatch, setMatchResult, deleteMatch } from '@/app/actions/admin'
import Navbar from '@/components/Navbar'
import type { Match } from '@/types'

export const revalidate = 0

export default async function AdminPage() {
  const session = await auth()
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
  if (!adminEmails.includes(session?.user?.email ?? '')) redirect('/dashboard')

  const { data: matches } = await db()
    .from('matches')
    .select('*')
    .order('scheduled_at', { ascending: true })

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <h1 className="text-xl font-bold text-white mb-6">Admin Panel</h1>

        <section className="mb-8 bg-gray-800 rounded-2xl p-5 border border-gray-700">
          <h2 className="text-white font-semibold mb-4">Add Match</h2>
          <form action={createMatch} className="grid grid-cols-2 gap-3">
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Team A</label>
                <input name="team_a" required placeholder="Brazil" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Team B</label>
                <input name="team_b" required placeholder="Argentina" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Flag A (emoji)</label>
              <input name="flag_a" required placeholder="🇧🇷" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Flag B (emoji)</label>
              <input name="flag_b" required placeholder="🇦🇷" className={inputClass} />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">Stage</label>
              <select name="stage" required className={inputClass}>
                <option value="group">Group</option>
                <option value="round_of_16">Round of 16</option>
                <option value="quarterfinal">Quarterfinal</option>
                <option value="semifinal">Semifinal</option>
                <option value="final">Final</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Group (optional)</label>
              <input name="group_name" placeholder="A" className={inputClass} />
            </div>

            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">Kickoff (local time)</label>
              <input name="scheduled_at" type="datetime-local" required className={inputClass} />
            </div>

            <button
              type="submit"
              className="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              Add Match
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-white font-semibold mb-4">All Matches</h2>
          {!matches || matches.length === 0 ? (
            <p className="text-gray-500">No matches yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {(matches as Match[]).map((match) => (
                <MatchAdminCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

function MatchAdminCard({ match }: { match: Match }) {
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
        <span className="text-white font-semibold">
          {match.flag_a} {match.team_a} vs {match.team_b} {match.flag_b}
        </span>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            match.status === 'finished'
              ? 'bg-gray-700 text-gray-400'
              : match.status === 'live'
                ? 'bg-red-900 text-red-400'
                : 'bg-emerald-900 text-emerald-400'
          }`}
        >
          {match.status}
        </span>
      </div>

      <p className="text-gray-500 text-xs mb-3">{kickoff}</p>

      {match.status === 'finished' ? (
        <p className="text-gray-400 text-sm">
          Result: {match.result_a} - {match.result_b}
        </p>
      ) : (
        <form
          action={async (formData: FormData) => {
            'use server'
            const a = parseInt(formData.get('result_a') as string)
            const b = parseInt(formData.get('result_b') as string)
            await setMatchResult(match.id, a, b)
          }}
          className="flex items-end gap-2"
        >
          <div>
            <label className="block text-xs text-gray-400 mb-1">{match.team_a}</label>
            <input
              name="result_a"
              type="number"
              min={0}
              max={99}
              defaultValue={0}
              required
              className={`${inputClass} w-16 text-center`}
            />
          </div>
          <span className="text-gray-500 mb-2">-</span>
          <div>
            <label className="block text-xs text-gray-400 mb-1">{match.team_b}</label>
            <input
              name="result_b"
              type="number"
              min={0}
              max={99}
              defaultValue={0}
              required
              className={`${inputClass} w-16 text-center`}
            />
          </div>
          <button
            type="submit"
            className="mb-0.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Set result
          </button>
        </form>
      )}

      <form
        action={async () => {
          'use server'
          await deleteMatch(match.id)
        }}
        className="mt-3"
      >
        <button type="submit" className="text-xs text-red-500 hover:text-red-400 transition-colors">
          Delete match
        </button>
      </form>
    </div>
  )
}

const inputClass =
  'w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500'
