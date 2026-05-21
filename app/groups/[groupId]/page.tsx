import { auth } from '@/auth'
import { db } from '@/lib/supabase'
import { getLocale, t } from '@/lib/i18n'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import Image from 'next/image'

export const revalidate = 60

export default async function GroupLeaderboardPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  const [session, locale] = await Promise.all([auth(), getLocale()])
  const currentUserId = session!.user!.email!
  const tr = t(locale)

  const [groupRes, membersRes] = await Promise.all([
    db().from('groups').select('id, name, invite_code').eq('id', groupId).single(),
    db().from('group_members').select('user_id').eq('group_id', groupId),
  ])

  const group = groupRes.data
  const memberIds: string[] = (membersRes.data ?? []).map((m: any) => m.user_id)

  const [predictionsRes, usersRes] = await Promise.all(
    memberIds.length
      ? [
          db().from('predictions').select('user_id, points').in('user_id', memberIds),
          db().from('users').select('id, name, image').in('id', memberIds),
        ]
      : [{ data: [] }, { data: [] }]
  )

  const users = new Map(
    (usersRes.data ?? []).map((u: any) => [u.id, u])
  )

  type Entry = { user_id: string; name: string; image: string | null; total_points: number; exact_scores: number; predictions_count: number }
  const entryMap = new Map<string, Entry>()

  for (const p of predictionsRes.data ?? []) {
    const user = users.get(p.user_id)
    if (!user) continue
    const entry = entryMap.get(p.user_id) ?? {
      user_id: p.user_id, name: user.name, image: user.image,
      total_points: 0, exact_scores: 0, predictions_count: 0,
    }
    entry.predictions_count++
    if (p.points != null) {
      entry.total_points += p.points
      if (p.points === 5) entry.exact_scores++
    }
    entryMap.set(p.user_id, entry)
  }

  // Include members with zero predictions
  for (const id of memberIds) {
    if (!entryMap.has(id)) {
      const user = users.get(id)
      if (user) entryMap.set(id, { user_id: id, name: user.name, image: user.image, total_points: 0, exact_scores: 0, predictions_count: 0 })
    }
  }

  const rankings = Array.from(entryMap.values()).sort(
    (a, b) => b.total_points - a.total_points || b.exact_scores - a.exact_scores
  )

  const leaderboard = tr.leaderboard

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <Link href="/groups" className="text-gray-400 hover:text-white text-sm inline-block mb-4">
          ← {tr.groups.back}
        </Link>

        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">{group?.name}</h1>
          <p className="text-gray-500 text-xs mt-1">
            {tr.groups.code}: <span className="text-emerald-400 font-mono tracking-wide">{group?.invite_code}</span>
            {' · '}{memberIds.length} {tr.groups.members}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {rankings.map((entry, i) => {
            const isMe = entry.user_id === currentUserId
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null
            return (
              <Link
                key={entry.user_id}
                href={`/leaderboard/${encodeURIComponent(entry.user_id)}`}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors ${
                  isMe ? 'bg-emerald-900/30 border-emerald-700' : 'bg-gray-800 border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="w-8 text-center shrink-0">
                  {medal ? <span className="text-xl">{medal}</span> : <span className="text-gray-500 font-bold">{i + 1}</span>}
                </div>
                <div className="shrink-0">
                  {entry.image ? (
                    <Image src={entry.image} alt={entry.name} width={36} height={36} className="rounded-full" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold">
                      {entry.name[0]}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold truncate">
                    {entry.name}{' '}
                    {isMe && <span className="text-emerald-400 text-xs">({leaderboard.you})</span>}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {entry.predictions_count} {leaderboard.picks} · {entry.exact_scores} {leaderboard.exact}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-bold text-lg">{entry.total_points}</p>
                  <p className="text-gray-500 text-xs">{leaderboard.pts}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </main>
    </>
  )
}
