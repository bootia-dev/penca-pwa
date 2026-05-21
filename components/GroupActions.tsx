'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createGroup, joinGroup } from '@/app/actions/groups'
import type { T } from '@/lib/i18n'

type Mode = 'none' | 'create' | 'join'

export default function GroupActions({ tr }: { tr: T }) {
  const [mode, setMode] = useState<Mode>('none')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [createdCode, setCreatedCode] = useState('')
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function reset() {
    setMode('none')
    setName('')
    setCode('')
    setPassword('')
    setError('')
    setCreatedCode('')
  }

  function handleCreate() {
    if (!name.trim() || !password.trim()) return
    setError('')
    startTransition(async () => {
      try {
        const result = await createGroup(name, password)
        setCreatedCode(result.inviteCode)
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
        setError(tr.groups[result.error as keyof T['groups']] as string)
      } else {
        reset()
        router.refresh()
      }
    })
  }

  if (createdCode) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm border border-gray-700">
          <p className="text-white font-semibold mb-2">{tr.groups.created}</p>
          <p className="text-gray-400 text-sm mb-4">{tr.groups.shareCode}</p>
          <div className="bg-gray-900 rounded-xl py-4 text-center mb-4">
            <span className="text-3xl font-bold tracking-widest text-emerald-400">{createdCode}</span>
          </div>
          <button onClick={reset} className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors">
            {tr.groups.done}
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'none') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setMode('join')}
          className="px-3 py-1.5 rounded-lg border border-gray-600 text-gray-300 text-sm hover:border-gray-400 transition-colors"
        >
          {tr.groups.join}
        </button>
        <button
          onClick={() => setMode('create')}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
        >
          {tr.groups.create}
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm border border-gray-700">
        <h2 className="text-white font-semibold mb-4">
          {mode === 'create' ? tr.groups.createTitle : tr.groups.joinTitle}
        </h2>

        <div className="flex flex-col gap-3">
          {mode === 'create' && (
            <input
              type="text"
              placeholder={tr.groups.groupName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          )}
          {mode === 'join' && (
            <input
              type="text"
              placeholder={tr.groups.inviteCode}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 tracking-widest uppercase"
            />
          )}
          <input
            type="password"
            placeholder={tr.groups.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={reset}
            className="flex-1 py-2 rounded-xl border border-gray-600 text-gray-300 text-sm hover:border-gray-400 transition-colors"
          >
            {tr.groups.cancel}
          </button>
          <button
            onClick={mode === 'create' ? handleCreate : handleJoin}
            disabled={isPending}
            className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
          >
            {isPending ? '...' : mode === 'create' ? tr.groups.create : tr.groups.join}
          </button>
        </div>
      </div>
    </div>
  )
}
