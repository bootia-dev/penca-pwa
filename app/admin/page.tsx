import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/supabase'
import { getLocale, t } from '@/lib/i18n'
import { createMatch, setMatchResult, deleteMatch, removeGroupMember, deleteGroup, setGroupImage, updateGroup } from '@/app/actions/admin'
import Navbar from '@/components/Navbar'
import type { Match } from '@/types'

export const revalidate = 0

export default async function AdminPage() {
  const [session, locale] = await Promise.all([auth(), getLocale()])
  const adminEmails = (process.env.ADMIN_EMAILS ?? '').split(',').map((e) => e.trim())
  if (!adminEmails.includes(session?.user?.email ?? '')) redirect('/dashboard')

  const tr = t(locale).admin
  const stages = t(locale).stages

  const [matchesRes, groupsRes, membersRes, usersRes] = await Promise.all([
    db().from('matches').select('*').order('scheduled_at', { ascending: true }),
    db().from('groups').select('id, name, invite_code, image_url, created_at').order('created_at', { ascending: true }),
    db().from('group_members').select('group_id, user_id'),
    db().from('users').select('id, name'),
  ])

  const matches = matchesRes.data
  const groups = groupsRes.data ?? []
  const memberRows: { group_id: string; user_id: string }[] = membersRes.data ?? []
  const userMap = new Map((usersRes.data ?? []).map((u: any) => [u.id, u.name as string]))

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        <h1 className="text-xl font-bold text-white mb-6">{tr.title}</h1>

        <section className="mb-8 bg-gray-800 rounded-2xl p-5 border border-gray-700">
          <h2 className="text-white font-semibold mb-4">{tr.addMatch}</h2>
          <form action={createMatch} className="grid grid-cols-2 gap-3">
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">{tr.teamA}</label>
                <input name="team_a" required placeholder="Brazil" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{tr.teamB}</label>
                <input name="team_b" required placeholder="Argentina" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">{tr.flagA}</label>
              <input name="flag_a" required placeholder="🇧🇷" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">{tr.flagB}</label>
              <input name="flag_b" required placeholder="🇦🇷" className={inputClass} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">{tr.stage}</label>
              <select name="stage" required className={inputClass}>
                <option value="group">{stages.group}</option>
                <option value="round_of_16">{stages.round_of_16}</option>
                <option value="quarterfinal">{stages.quarterfinal}</option>
                <option value="semifinal">{stages.semifinal}</option>
                <option value="final">{stages.final}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">{tr.group}</label>
              <input name="group_name" placeholder="A" className={inputClass} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1">{tr.kickoff}</label>
              <input name="scheduled_at" type="datetime-local" required className={inputClass} />
            </div>
            <button
              type="submit"
              className="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {tr.addMatch}
            </button>
          </form>
        </section>

        <section className="mb-8">
          <h2 className="text-white font-semibold mb-4">{tr.allMatches}</h2>
          {!matches || matches.length === 0 ? (
            <p className="text-gray-500">{tr.noMatches}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {(matches as Match[]).map((match) => (
                <MatchAdminCard key={match.id} match={match} tr={tr} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-white font-semibold mb-4">{tr.allGroups}</h2>
          {groups.length === 0 ? (
            <p className="text-gray-500">{tr.noGroups}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {groups.map((group: any) => {
                const members = memberRows.filter((m) => m.group_id === group.id)
                return (
                  <div key={group.id} className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      {group.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={group.image_url} alt={group.name} className="w-12 h-12 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl shrink-0">👥</div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold">{group.name}</p>
                        <p className="text-gray-500 text-xs">{members.length} members</p>
                      </div>
                      <form action={async () => { 'use server'; await deleteGroup(group.id) }}>
                        <button type="submit" className="text-xs text-red-500 hover:text-red-400 transition-colors">
                          {tr.deleteGroup}
                        </button>
                      </form>
                    </div>

                    {/* Edit name + invite code */}
                    <form
                      action={async (fd: FormData) => {
                        'use server'
                        await updateGroup(group.id, fd.get('name') as string, fd.get('invite_code') as string)
                      }}
                      className="grid grid-cols-2 gap-2 mb-2"
                    >
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Name</label>
                        <input name="name" defaultValue={group.name} required className={`${inputClass} text-xs`} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Invite code</label>
                        <input name="invite_code" defaultValue={group.invite_code} required className={`${inputClass} text-xs font-mono uppercase`} />
                      </div>
                      <button type="submit" className="col-span-2 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors">
                        Save name / code
                      </button>
                    </form>

                    {/* Image URL */}
                    <form
                      action={async (fd: FormData) => {
                        'use server'
                        await setGroupImage(group.id, fd.get('image_url') as string)
                      }}
                      className="flex gap-2 mb-4"
                    >
                      <input
                        name="image_url"
                        defaultValue={group.image_url ?? ''}
                        placeholder="https://... image URL"
                        className={`${inputClass} flex-1 text-xs`}
                      />
                      <button type="submit" className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg transition-colors shrink-0">
                        Set image
                      </button>
                    </form>

                    {/* Members */}
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Members</p>
                    <div className="flex flex-col gap-1">
                      {members.map((m) => (
                        <div key={m.user_id} className="flex items-center justify-between py-1 border-t border-gray-700/50">
                          <span className="text-gray-300 text-sm truncate">{userMap.get(m.user_id) ?? m.user_id}</span>
                          <form action={async () => { 'use server'; await removeGroupMember(group.id, m.user_id) }}>
                            <button type="submit" className="text-xs text-gray-500 hover:text-red-400 transition-colors ml-4 shrink-0">
                              {tr.removeMember}
                            </button>
                          </form>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </>
  )
}

function MatchAdminCard({ match, tr }: { match: Match; tr: ReturnType<typeof t>['admin'] }) {
  const kickoff = new Date(match.scheduled_at).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <span className="text-white font-semibold">
          {match.flag_a} {match.team_a} vs {match.team_b} {match.flag_b}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          match.status === 'finished' ? 'bg-gray-700 text-gray-400'
          : match.status === 'live' ? 'bg-red-900 text-red-400'
          : 'bg-emerald-900 text-emerald-400'
        }`}>
          {match.status}
        </span>
      </div>
      <p className="text-gray-500 text-xs mb-3">{kickoff}</p>

      {match.status === 'finished' ? (
        <p className="text-gray-400 text-sm">Result: {match.result_a} - {match.result_b}</p>
      ) : (
        <form
          action={async (formData: FormData) => {
            'use server'
            await setMatchResult(match.id, parseInt(formData.get('result_a') as string), parseInt(formData.get('result_b') as string))
          }}
          className="flex items-end gap-2"
        >
          <div>
            <label className="block text-xs text-gray-400 mb-1">{match.team_a}</label>
            <input name="result_a" type="number" min={0} max={99} defaultValue={0} required className={`${inputClass} w-16 text-center`} />
          </div>
          <span className="text-gray-500 mb-2">-</span>
          <div>
            <label className="block text-xs text-gray-400 mb-1">{match.team_b}</label>
            <input name="result_b" type="number" min={0} max={99} defaultValue={0} required className={`${inputClass} w-16 text-center`} />
          </div>
          <button type="submit" className="mb-0.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
            {tr.setResult}
          </button>
        </form>
      )}

      <form action={async () => { 'use server'; await deleteMatch(match.id) }} className="mt-3">
        <button type="submit" className="text-xs text-red-500 hover:text-red-400 transition-colors">
          {tr.deleteMatch}
        </button>
      </form>
    </div>
  )
}

const inputClass = 'w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-500'
