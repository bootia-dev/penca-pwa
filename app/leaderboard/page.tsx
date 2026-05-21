import { auth } from '@/auth'
import { db } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { getLocale, t } from '@/lib/i18n'
import Navbar from '@/components/Navbar'
import GroupSelector from '@/components/GroupSelector'
import Image from 'next/image'
import Link from 'next/link'

export const revalidate = 60

export default async function LeaderboardPage() {
  const [session, locale, cookieStore] = await Promise.all([auth(), getLocale(), cookies()])
  const currentUserId = session!.user!.email!
  const tr = t(locale)

  // User's groups
  const { data: memberships } = await db()
    .from('group_members')
    .select('group_id')
    .eq('user_id', currentUserId)

  const groupIds = (memberships ?? []).map((m: any) => m.group_id)

  const groups: { id: string; name: string; invite_code: string }[] = groupIds.length
    ? (await db().from('groups').select('id, name, invite_code').in('id', groupIds)).data ?? []
    : []

  // Active group from cookie (validate membership)
  const cookieGroupId = cookieStore.get('active_group')?.value ?? null
  const activeGroup = groups.find((g) => g.id === cookieGroupId) ?? null

  // Determine the set of user IDs to show (null = everyone)
  let filterUserIds: string[] | null = null
  if (activeGroup) {
    const { data: members } = await db()
      .from('group_members')
      .select('user_id')
      .eq('group_id', activeGroup.id)
    filterUserIds = (members ?? []).map((m: any) => m.user_id)
  }

  const [predictionsRes, usersRes] = await Promise.all([
    filterUserIds
      ? db().from('predictions').select('user_id, points').in('user_id', filterUserIds)
      : db().from('predictions').select('user_id, points'),
    filterUserIds
      ? db().from('users').select('id, name, image').in('id', filterUserIds)
      : db().from('users').select('id, name, image'),
  ])

  const users = new Map(
    (usersRes.data ?? []).map((u: any) => [u.id, u])
  )

  type Entry = {
    user_id: string; name: string; image: string | null
    total_points: number; predictions_count: number; exact_scores: number
  }

  const entryMap = new Map<string, Entry>()
  for (const p of predictionsRes.data ?? []) {
    const user = users.get(p.user_id)
    if (!user) continue
    const entry = entryMap.get(p.user_id) ?? {
      user_id: p.user_id, name: user.name, image: user.image,
      total_points: 0, predictions_count: 0, exact_scores: 0,
    }
    entry.predictions_count++
    if (p.points != null) {
      entry.total_points += p.points
      if (p.points === 5) entry.exact_scores++
    }
    entryMap.set(p.user_id, entry)
  }

  const rankings = Array.from(entryMap.values()).sort(
    (a, b) => b.total_points - a.total_points || b.exact_scores - a.exact_scores
  )

  const lb = tr.leaderboard

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">{lb.title}</h1>
          <GroupSelector groups={groups} activeGroup={activeGroup} tr={tr} />
        </div>

        {rankings.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">{lb.noPredictions}</p>
        ) : (
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
                      {isMe && <span className="text-emerald-400 text-xs">({lb.you})</span>}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {entry.predictions_count} {lb.picks} · {entry.exact_scores} {lb.exact}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white font-bold text-lg">{entry.total_points}</p>
                    <p className="text-gray-500 text-xs">{lb.pts}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
