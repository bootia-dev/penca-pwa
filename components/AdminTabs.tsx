'use client'

import { useState, type ReactNode } from 'react'

export default function AdminTabs({
  matchesContent,
  groupsContent,
}: {
  matchesContent: ReactNode
  groupsContent: ReactNode
}) {
  const [tab, setTab] = useState<'matches' | 'groups'>('matches')

  return (
    <div>
      <div className="flex bg-gray-800 rounded-xl p-1 mb-6">
        {(['matches', 'groups'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab === t ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {t === 'matches' ? 'Matches' : 'Groups'}
          </button>
        ))}
      </div>

      {tab === 'matches' ? matchesContent : groupsContent}
    </div>
  )
}
