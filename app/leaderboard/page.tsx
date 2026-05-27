import { auth } from '@/auth'
import { db } from '@/lib/supabase'
import { getLocale, t } from '@/lib/i18n'
import Navbar from '@/components/Navbar'
import GroupSelector from '@/components/GroupSelector'
import Image from 'next/image'
import Link from 'next/link'
import Avatar from '@/components/Avatar'

export const revalidate = 0

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ group?: string }> }) {
  const [session, locale, sp] = await Promise.all([auth(), getLocale(), searchParams])
  const currentUserId = session!.user!.email!
  const tr = t(locale)

  // User's groups
  const { data: memberships } = await db()
    .from('group_members')
    .select('group_id')
    .eq('user_id', currentUserId)

  const groupIds = (memberships ?? []).map((m: any) => m.group_id)

  const groups: { id: string; name: string; invite_code: string; image_url?: string | null }[] = groupIds.length
    ? (await db().from('groups').select('id, name, invite_code, image_url').in('id', groupIds)).data ?? []
    : []

  // Active group from URL param (validate membership)
  const activeGroup = groups.find((g) => g.id === sp.group) ?? null

  // Determine the set of user IDs to show (null = everyone)
  let filterUserIds: string[] | null = null
  if (activeGroup) {
    const { data: members } = await db()
      .from('group_members')
      .select('user_id')
      .eq('group_id', activeGroup.id)
    filterUserIds = (members ?? []).map((m: any) => m.user_id)
  }

  const now = new Date()

  const [predictionsRes, usersRes, liveMatchesRes] = await Promise.all([
    filterUserIds
      ? db().from('predictions').select('user_id, points').in('user_id', filterUserIds)
      : db().from('predictions').select('user_id, points'),
    filterUserIds
      ? db().from('users').select('id, name, image').in('id', filterUserIds)
      : db().from('users').select('id, name, image'),
    db()
      .from('matches')
      .select('id, team_a, team_b, flag_a, flag_b, stage, group_name, scheduled_at')
      .neq('status', 'finished')
      .lte('scheduled_at', now.toISOString())
      .order('scheduled_at', { ascending: true }),
  ])

  const liveMatches = liveMatchesRes.data ?? []
  const liveMatchIds = liveMatches.map((m: any) => m.id)

  const { data: livePredRows } = liveMatchIds.length
    ? await (filterUserIds
        ? db().from('predictions').select('user_id, match_id, predicted_a, predicted_b').in('match_id', liveMatchIds).in('user_id', filterUserIds)
        : db().from('predictions').select('user_id, match_id, predicted_a, predicted_b').in('match_id', liveMatchIds))
    : { data: [] }

  const users = new Map(
    (usersRes.data ?? []).map((u: any) => [u.id, u])
  )

  // Build picks map for live matches (reuse users map — already scoped to group if active)
  type PickRow = { user_id: string; name: string; image: string | null; predicted_a: number; predicted_b: number }
  const predsByMatch = new Map<string, PickRow[]>()
  for (const p of livePredRows ?? []) {
    const user = users.get(p.user_id)
    if (!user) continue
    const arr = predsByMatch.get(p.match_id) ?? []
    arr.push({ user_id: p.user_id, name: user.name, image: user.image, predicted_a: p.predicted_a, predicted_b: p.predicted_b })
    predsByMatch.set(p.match_id, arr)
  }

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

  // When viewing a group, show all members even if they have no predictions yet
  if (filterUserIds) {
    for (const id of filterUserIds) {
      if (!entryMap.has(id)) {
        const user = users.get(id)
        if (user) entryMap.set(id, { user_id: id, name: user.name, image: user.image, total_points: 0, predictions_count: 0, exact_scores: 0 })
      }
    }
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

        {/* Live matches */}
        {liveMatches.length > 0 && (
          <section className="mb-6 flex flex-col gap-3">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
              {lb.liveNow}
            </h2>
            {liveMatches.map((match: any) => {
              const picks = (predsByMatch.get(match.id) ?? []).sort(
                (a, b) => a.user_id === currentUserId ? -1 : b.user_id === currentUserId ? 1 : a.name.localeCompare(b.name)
              )
              const stageLabel = tr.stages[match.stage as keyof typeof tr.stages]
              const groupLabel = match.group_name ? ` ${match.group_name}` : ''
              return (
                <div key={match.id} className="bg-gray-800 rounded-2xl border border-red-900/50 overflow-hidden">
                  {/* Match header */}
                  <div className="px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stageLabel}{groupLabel}</span>
                      <span className="flex items-center gap-1.5 text-xs text-red-400 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        LIVE
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 flex items-center justify-end gap-1.5 min-w-0">
                        <span className="text-white text-sm font-semibold text-right leading-tight">{match.team_a}</span>
                        <span className="text-2xl leading-none shrink-0">{match.flag_a}</span>
                      </div>
                      <span className="text-gray-600 text-sm italic shrink-0 w-8 text-center">vs</span>
                      <div className="flex-1 flex items-center gap-1.5 min-w-0">
                        <span className="text-2xl leading-none shrink-0">{match.flag_b}</span>
                        <span className="text-white text-sm font-semibold leading-tight">{match.team_b}</span>
                      </div>
                    </div>
                  </div>

                  {/* Picks */}
                  <div className="border-t border-gray-700/60 px-4 py-3">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">
                      {lb.allPicks} ({picks.length})
                    </p>
                    {picks.length === 0 ? (
                      <p className="text-gray-600 text-sm">{lb.noPicks}</p>
                    ) : (
                      <div className="flex flex-col divide-y divide-gray-700/40">
                        {picks.map((pick) => {
                          const isMe = pick.user_id === currentUserId
                          return (
                            <div key={pick.user_id} className={`flex items-center gap-3 py-2 ${isMe ? '-mx-4 px-4 bg-emerald-950/40' : ''}`}>
                              <Avatar src={pick.image} name={pick.name} size={28} />
                              <span className={`flex-1 text-sm truncate ${isMe ? 'text-white font-medium' : 'text-gray-300'}`}>
                                {pick.name}
                                {isMe && <span className="ml-1.5 text-xs text-emerald-400 font-normal">({lb.you})</span>}
                              </span>
                              <span className={`text-base font-bold tabular-nums shrink-0 ${isMe ? 'text-white' : 'text-gray-200'}`}>
                                {pick.predicted_a} – {pick.predicted_b}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </section>
        )}

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
