'use client'

import { useState } from 'react'
import MatchCard from './MatchCard'
import type { MatchWithPrediction } from '@/types'
import type { T } from '@/lib/i18n'

export default function DashboardTabs({
  predicted,
  pending,
  tr,
}: {
  predicted: MatchWithPrediction[]
  pending: MatchWithPrediction[]
  tr: T
}) {
  const [tab, setTab] = useState<'pending' | 'predicted'>(
    pending.length > 0 ? 'pending' : 'predicted'
  )
  const now = new Date()
  const d = tr.dashboard
  const active = tab === 'pending' ? pending : predicted

  return (
    <div>
      {/* Tab bar */}
      <div className="flex bg-gray-800 rounded-xl p-1 mb-4">
        {(['pending', 'predicted'] as const).map((t) => {
          const isActive = tab === t
          const label = t === 'pending' ? d.tabPending : d.tabPredicted
          const count = t === 'pending' ? pending.length : predicted.length
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {label}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {active.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">
          {tab === 'pending' ? d.noPending : d.noPredicted}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {active.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              canPredict={tab === 'pending' && new Date(match.scheduled_at) > now}
              tr={tr}
            />
          ))}
        </div>
      )}
    </div>
  )
}
