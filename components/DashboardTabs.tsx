'use client'

import { useState, useRef } from 'react'
import MatchCard from './MatchCard'
import LocalTime from './LocalTime'
import type { MatchWithPrediction } from '@/types'
import type { T } from '@/lib/i18n'

type StageKey = 'group' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'final'
type FilterValue = 'all' | string
type ViewMode = 'date' | 'group'

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

function groupByDate(matches: MatchWithPrediction[]): { key: string; matches: MatchWithPrediction[] }[] {
  const map = new Map<string, MatchWithPrediction[]>()
  for (const m of matches) {
    const key = m.scheduled_at.slice(0, 10)
    const arr = map.get(key) ?? []
    arr.push(m)
    map.set(key, arr)
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, ms]) => ({ key, matches: ms }))
}

function groupByStage(matches: MatchWithPrediction[], stages: T['stages']): { key: string; label: string; matches: MatchWithPrediction[] }[] {
  const map = new Map<string, { label: string; matches: MatchWithPrediction[] }>()
  for (const m of matches) {
    const key = m.stage === 'group' ? `group:${m.group_name}` : m.stage
    if (!map.has(key)) {
      const label = m.stage === 'group' ? `Group ${m.group_name}` : stages[m.stage as StageKey]
      map.set(key, { label, matches: [] })
    }
    map.get(key)!.matches.push(m)
  }
  const result: { key: string; label: string; matches: MatchWithPrediction[] }[] = []
  Array.from(map.entries())
    .filter(([k]) => k.startsWith('group:'))
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, val]) => result.push({ key, ...val }))
  for (const s of KNOCKOUT_ORDER) {
    if (map.has(s)) result.push({ key: s, ...map.get(s)! })
  }
  return result
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
  const [viewMode, setViewMode] = useState<ViewMode>('date')
  const scrollRef = useRef<HTMLDivElement>(null)
  const now = new Date()
  const d = tr.dashboard

  const filters = buildFilters(allMatches, tr.stages)
  const activeList = tab === 'pending' ? pending : predicted
  const visible = applyFilter(activeList, filter)

  const dateSections = groupByDate(visible)
  const stageSections = groupByStage(visible, tr.stages)

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

      {/* Filter pills + view mode toggle */}
      <div className="flex items-center gap-2 mb-4">
        {filters.length > 1 && (
          <div
            ref={scrollRef}
            className="flex gap-2 overflow-x-auto flex-1 scrollbar-none"
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

        {/* View mode toggle */}
        <div className="flex shrink-0 bg-gray-800 border border-gray-700 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('date')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'date' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {d.viewByDate}
          </button>
          <button
            onClick={() => setViewMode('group')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'group' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {d.viewByGroup}
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">
          {activeList.length === 0
            ? tab === 'pending' ? d.noPending : d.noPredicted
            : d.noMatchesInGroup}
        </p>
      ) : viewMode === 'date' ? (
        <div className="flex flex-col gap-6">
          {dateSections.map(({ key, matches: sMatches }) => (
            <div key={key}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                <LocalTime
                  date={`${key}T12:00:00Z`}
                  options={{ weekday: 'long', month: 'short', day: 'numeric' }}
                />
              </p>
              <div className="flex flex-col gap-3">
                {sMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    canPredict={tab === 'pending' && new Date(match.scheduled_at) > now}
                    tr={tr}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {stageSections.map(({ key, label, matches: sMatches }) => (
            <div key={key}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {label}
              </p>
              <div className="flex flex-col gap-3">
                {sMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    canPredict={tab === 'pending' && new Date(match.scheduled_at) > now}
                    tr={tr}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
