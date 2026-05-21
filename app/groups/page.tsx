import { auth } from '@/auth'
import { db } from '@/lib/supabase'
import { getLocale, t } from '@/lib/i18n'
import Navbar from '@/components/Navbar'
import GroupActions from '@/components/GroupActions'
import Link from 'next/link'

export const revalidate = 60

export default async function GroupsPage() {
  const [session, locale] = await Promise.all([auth(), getLocale()])
  const userId = session!.user!.email!
  const tr = t(locale)

  const { data: memberships } = await db()
    .from('group_members')
    .select('group_id')
    .eq('user_id', userId)

  const groupIds = (memberships ?? []).map((m: any) => m.group_id)

  const groups: any[] = groupIds.length
    ? (await db().from('groups').select('id, name, invite_code').in('id', groupIds)).data ?? []
    : []

  const memberCounts: Record<string, number> = {}
  if (groupIds.length) {
    const { data: rows } = await db()
      .from('group_members')
      .select('group_id')
      .in('group_id', groupIds)
    ;(rows ?? []).forEach((r: any) => {
      memberCounts[r.group_id] = (memberCounts[r.group_id] ?? 0) + 1
    })
  }

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-white">{tr.groups.title}</h1>
          <GroupActions tr={tr} />
        </div>

        {groups.length === 0 ? (
          <p className="text-gray-500 text-center mt-20">{tr.groups.noGroups}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-2xl border border-gray-700 hover:border-gray-500 transition-colors"
              >
                <div>
                  <p className="text-white font-semibold">{group.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {memberCounts[group.id] ?? 1} {tr.groups.members} · {tr.groups.code}: <span className="text-emerald-400 font-mono tracking-wide">{group.invite_code}</span>
                  </p>
                </div>
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-gray-600 shrink-0" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
