'use client'

import { useState, useRef } from 'react'
import MatchCard from './MatchCard'
import type { MatchWithPrediction } from '@/types'
import type { T } from '@/lib/i18n'

type StageKey = 'group' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'final'
type FilterValue = 'all' | string  // 'all' | group letter (A-H) | stage key for knockouts

const KNOCKOUT_ORDER: StageKey[] = ['round_of_16', 'quarterfinal', 'semifinal', 'final']

function buildFilters(matches: MatchWithPrediction[], stages: T['stages']): { value: FilterValue; label: string }[] {
  const groupLetters = new Set<string>()
  const knockoutStages = new Set<StageKey>()

  for (const m of matches) {
    if (m.stage === 'group' && m.group_name) groupLetters.add(m.group_name)
    else if (m.stage !== 'group') knockoutStages.add(m.stage as StageKey)
  }

  const filters: { value: FilterValue; label: string }[] = [{ value: 'all', label: 'All' }]
  const letters = Array.from(groupLetters).sort()
  for (const l of letters) filters.push({ value: `group:${l}`, label: `Group ${l}` })
  for (const s of KNOCKOUT_ORDER) {
    if (knockoutStages.has(s)) filters.push({ value: `stage:${s}`, label: stages[s] })
  }
  return filters
}

function applyFilter(matches: MatchWithPrediction[], filter: FilterValue): MatchWithPrediction[] {
  if (filter === 'all') return matches
  if (filter.startsWith('group:')) {
    const letter = filter.slice(6)
    return matches.filter((m) => m.stage === 'group' && m.group_name === letter)
  }
  if (filter.startsWith('stage:')) {
    const stage = filter.slice(6)
    return matches.filter((m) => m.stage === stage)
  }
  return matches
}

export default function DashboardTabs({
  predicted,
  pending,
  tr,
  allMatches,
}: {
  predicted: MatchWithPrediction[]
  pending: MatchWithPrediction[]
  tr: T
  allMatches: MatchWithPrediction[]
}) {
  const [tab, setTab] = useState<'pending' | 'predicted'>(
    pending.length > 0 ? 'pending' : 'predicted'
  )
  const [filter, setFilter] = useState<FilterValue>('all')
  const scrollRef = useRef<HTMLDivElement>(null)
  const now = new Date()
  const d = tr.dashboard

  const filters = buildFilters(allMatches, tr.stages)
  const activeList = tab === 'pending' ? pending : predicted
  const visible = applyFilter(activeList, filter)

  return (
    <div>
      {/* Pending / Predicted tab bar */}
      <div className="flex bg-gray-800 rounded-xl p-1 mb-3">
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

      {/* Group / stage filter pills */}
      {filters.length > 1 && (
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                filter === f.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-500'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">
          {activeList.length === 0
            ? tab === 'pending' ? d.noPending : d.noPredicted
            : d.noMatchesInGroup}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {visible.map((match) => (
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
