'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setActiveGroup, createGroup, joinGroup } from '@/app/actions/groups'
import type { T } from '@/lib/i18n'

type Group = { id: string; name: string; invite_code: string }
type Mode = 'list' | 'create' | 'join'

export default function GroupSelector({
  groups,
  activeGroup,
  tr,
}: {
  groups: Group[]
  activeGroup: Group | null
  tr: T
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('list')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const g = tr.groups

  function close() {
    setIsOpen(false)
    setMode('list')
    setName('')
    setCode('')
    setPassword('')
    setError('')
    setCreatedCode('')
  }

  function switchGroup(groupId: string | null) {
    startTransition(async () => {
      await setActiveGroup(groupId)
      router.refresh()
      setIsOpen(false)
    })
  }

  function handleCreate() {
    if (!name.trim() || !password.trim()) return
    setError('')
    startTransition(async () => {
      try {
        const result = await createGroup(name, password)
        setCreatedCode(result.inviteCode)
        await setActiveGroup(result.groupId)
        router.refresh()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error')
      }
    })
  }

  function handleJoin() {
    if (!code.trim() || !password.trim()) return
    setError('')
    startTransition(async () => {
      const result = await joinGroup(code, password)
      if ('error' in result) {
        setError(g[result.error as keyof T['groups']] as string)
      } else {
        await setActiveGroup(result.groupId)
        router.refresh()
        close()
      }
    })
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 border border-gray-700 text-sm text-white hover:border-gray-500 transition-colors max-w-[160px]"
      >
        <span className="truncate">{activeGroup ? activeGroup.name : g.global}</span>
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0 text-gray-400" stroke="currentColor" strokeWidth={2}>
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Backdrop + bottom sheet */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-end justify-center z-50" onClick={close}>
          <div
            className="bg-gray-900 border border-gray-700 rounded-t-2xl w-full max-w-lg pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Created-code success screen */}
            {createdCode ? (
              <div className="p-6">
                <p className="text-white font-semibold mb-1">{g.created}</p>
                <p className="text-gray-400 text-sm mb-4">{g.shareCode}</p>
                <div className="bg-gray-800 rounded-xl py-4 text-center mb-4">
                  <span className="text-3xl font-bold tracking-widest text-emerald-400">{createdCode}</span>
                </div>
                <button onClick={close} className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors">
                  {g.done}
                </button>
              </div>
            ) : mode === 'list' ? (
              <div className="p-4">
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wide mb-3 px-1">{g.switchGroup}</p>

                {/* Global option */}
                <button
                  onClick={() => switchGroup(null)}
                  disabled={isPending}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors ${
                    !activeGroup ? 'bg-emerald-900/40 text-emerald-400' : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="text-lg">🌍</span>
                  <span className="font-medium">{g.global}</span>
                  {!activeGroup && <span className="ml-auto text-emerald-400">✓</span>}
                </button>

                {/* User's groups */}
                {groups.map((grp) => (
                  <button
                    key={grp.id}
                    onClick={() => switchGroup(grp.id)}
                    disabled={isPending}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 transition-colors text-left ${
                      activeGroup?.id === grp.id ? 'bg-emerald-900/40 text-emerald-400' : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-lg">👥</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{grp.name}</p>
                      <p className="text-xs text-gray-500 font-mono">{grp.invite_code}</p>
                    </div>
                    {activeGroup?.id === grp.id && <span className="ml-auto text-emerald-400 shrink-0">✓</span>}
                  </button>
                ))}

                <div className="border-t border-gray-800 mt-3 pt-3 flex gap-2">
                  <button
                    onClick={() => setMode('join')}
                    className="flex-1 py-2 rounded-xl border border-gray-700 text-gray-300 text-sm hover:border-gray-500 transition-colors"
                  >
                    {g.join}
                  </button>
                  <button
                    onClick={() => setMode('create')}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
                  >
                    {g.create}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <button onClick={() => { setMode('list'); setError('') }} className="text-gray-400 text-sm mb-4 hover:text-white transition-colors">
                  ← {g.back}
                </button>
                <h2 className="text-white font-semibold mb-4">
                  {mode === 'create' ? g.createTitle : g.joinTitle}
                </h2>
                <div className="flex flex-col gap-3">
                  {mode === 'create' && (
                    <input
                      type="text"
                      placeholder={g.groupName}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  )}
                  {mode === 'join' && (
                    <input
                      type="text"
                      placeholder={g.inviteCode}
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-widest uppercase"
                    />
                  )}
                  <input
                    type="password"
                    placeholder={g.password}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <button
                    onClick={mode === 'create' ? handleCreate : handleJoin}
                    disabled={isPending}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium transition-colors"
                  >
                    {isPending ? '...' : mode === 'create' ? g.create : g.join}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
