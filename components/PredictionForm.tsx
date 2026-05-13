'use client'

import { useState, useTransition } from 'react'
import { upsertPrediction } from '@/app/actions/predictions'

interface Props {
  matchId: string
  initialA?: number
  initialB?: number
}

export default function PredictionForm({ matchId, initialA, initialB }: Props) {
  const [a, setA] = useState(initialA ?? 0)
  const [b, setB] = useState(initialB ?? 0)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function submit() {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      try {
        await upsertPrediction(matchId, a, b)
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error saving prediction')
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <ScoreInput value={a} onChange={setA} />
      <span className="text-gray-500 text-sm font-medium">-</span>
      <ScoreInput value={b} onChange={setB} />
      <button
        onClick={submit}
        disabled={isPending}
        className="ml-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-medium transition-colors"
      >
        {isPending ? '...' : saved ? 'Saved!' : 'Save'}
      </button>
      {error && <span className="text-red-400 text-xs">{error}</span>}
    </div>
  )
}

function ScoreInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      min={0}
      max={99}
      value={value}
      onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
      className="w-12 h-9 bg-gray-700 border border-gray-600 rounded-lg text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
    />
  )
}
