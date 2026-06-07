'use client'

import { useState, useEffect, useRef } from 'react'
import MatchCard from './MatchCard'
import LocalTime from './LocalTime'
import TimezoneNote from './TimezoneNote'
import type { MatchWithPrediction } from '@/types'
import type { T } from '@/lib/i18n'

type StageKey = 'group' | 'round_of_16' | 'quarterfinal' | 'semifinal' | 'final'
type ViewMode = 'date' | 'group'

const KNOCKOUT_ORDER: StageKey[] = ['round_of_16', 'quarterfinal', 'semifinal', 'final']

// en-CA gives YYYY-MM-DD in the browser's local timezone — sortable and correct
function localDateKey(scheduledAt: string): string {
  return new Date(scheduledAt).toLocaleDateString('en-CA')
}

function uniqueLocalDates(matches: MatchWithPrediction[]): string[] {
  return Array.from(new Set(matches.map((m) => localDateKey(m.scheduled_at)))).sort()
}

function nearestDate(dates: string[]): string {
  if (!dates.length) return ''
  const today = new Date().toLocaleDateString('en-CA')
  return dates.find((d) => d >= today) ?? dates[dates.length - 1]
}

function stageGroups(matches: MatchWithPrediction[], stages: T['stages']): { key: string; label: string }[] {
  const seen = new Map<string, string>()
  for (const m of matches) {
    const key = m.stage === 'group' ? `group:${m.group_name}` : m.stage
    if (!seen.has(key)) {
      seen.set(key, m.stage === 'group' ? `Group ${m.group_name}` : stages[m.stage as StageKey])
    }
  }
  const result: { key: string; label: string }[] = []
  Array.from(seen.entries())
    .filter(([k]) => k.startsWith('group:'))
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, label]) => result.push({ key, label }))
  for (const s of KNOCKOUT_ORDER) {
    if (seen.has(s)) result.push({ key: s, label: seen.get(s)! })
  }
  return result
}

function filterByGroup(matches: MatchWithPrediction[], groupKey: string): MatchWithPrediction[] {
  if (groupKey.startsWith('group:')) {
    const letter = groupKey.slice(6)
    return matches.filter((m) => m.stage === 'group' && m.group_name === letter)
  }
  return matches.filter((m) => m.stage === groupKey)
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
  const [viewMode, setViewMode] = useState<ViewMode>('date')
  // selectedDate uses empty string until mounted so server/client HTML matches
  const [selectedDate, setSelectedDate] = useState('')
  const [mounted, setMounted] = useState(false)
  const dateInputRef = useRef<HTMLInputElement>(null)

  const activeList = tab === 'pending' ? pending : predicted

  // After mount, compute correct local-timezone dates and set initial selection
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const dates = uniqueLocalDates(activeList)
    setSelectedDate((prev) => dates.includes(prev) ? prev : nearestDate(dates))
  }, [mounted, tab, pending, predicted])

  const now = new Date()
  const d = tr.dashboard
  const groups = stageGroups(allMatches, tr.stages)
  const [selectedGroup, setSelectedGroup] = useState(() => groups[0]?.key ?? '')

  // Derive dates and visible matches using local timezone (only after mount)
  const dates = mounted ? uniqueLocalDates(activeList) : []
  const dateIdx = dates.indexOf(selectedDate)
  const prevDate = dateIdx > 0 ? dates[dateIdx - 1] : null
  const nextDate = dateIdx < dates.length - 1 ? dates[dateIdx + 1] : null
  const matchesOnDate = mounted
    ? activeList.filter((m) => localDateKey(m.scheduled_at) === selectedDate)
    : []

  const matchesInGroup = selectedGroup ? filterByGroup(activeList, selectedGroup) : activeList

  // Representative scheduled_at for the selected date (for LocalTime display)
  const dateRepresentative = matchesOnDate[0]?.scheduled_at ?? `${selectedDate}T12:00:00Z`

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

      {/* View mode toggle */}
      <div className="flex justify-end mb-3">
        <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('date')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'date' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {d.viewByDate}
          </button>
          <button
            onClick={() => setViewMode('group')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              viewMode === 'group' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {d.viewByGroup}
          </button>
        </div>
      </div>

      {viewMode === 'date' ? (
        <>
          {/* Date navigator */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => prevDate && setSelectedDate(prevDate)}
              disabled={!prevDate}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
            >
              ‹
            </button>

            {/* Date display button — showPicker() opens native calendar on all browsers */}
            <div className="relative flex-1 flex items-center justify-center">
              <button
                onClick={() => {
                  try { dateInputRef.current?.showPicker() } catch { dateInputRef.current?.click() }
                }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-700 transition-colors"
              >
                <span className="text-white font-semibold text-sm">
                  {mounted && selectedDate ? (
                    <LocalTime
                      date={dateRepresentative}
                      options={{ weekday: 'long', month: 'short', day: 'numeric' }}
                    />
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </span>
                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={selectedDate}
                min={dates[0]}
                max={dates[dates.length - 1]}
                onChange={(e) => {
                  const val = e.target.value
                  if (!val) return
                  const nearest = dates.find((d) => d >= val) ?? dates[dates.length - 1]
                  setSelectedDate(nearest)
                }}
                className="absolute opacity-0 pointer-events-none w-px h-px"
              />
            </div>

            <button
              onClick={() => nextDate && setSelectedDate(nextDate)}
              disabled={!nextDate}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-800 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-lg"
            >
              ›
            </button>
          </div>

          <TimezoneNote className="text-xs text-gray-600 text-center mb-3" prefix={d.allTimesIn} />

          {!mounted ? null : matchesOnDate.length === 0 ? (
            <p className="text-gray-500 text-center mt-20">
              {activeList.length === 0
                ? tab === 'pending' ? d.noPending : d.noPredicted
                : d.noMatchesInGroup}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {matchesOnDate.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  canPredict={tab === 'pending' && new Date(match.scheduled_at) > now}
                  tr={tr}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Group / stage dropdown */}
          <div className="mb-4">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {groups.map((g) => (
                <option key={g.key} value={g.key}>{g.label}</option>
              ))}
            </select>
          </div>

          {matchesInGroup.length === 0 ? (
            <p className="text-gray-500 text-center mt-20">
              {activeList.length === 0
                ? tab === 'pending' ? d.noPending : d.noPredicted
                : d.noMatchesInGroup}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {matchesInGroup.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  canPredict={tab === 'pending' && new Date(match.scheduled_at) > now}
                  tr={tr}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
