function NavbarSkeleton() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between animate-pulse">
        <div className="h-5 w-14 bg-gray-700 rounded" />
        <div className="flex items-center gap-3">
          <div className="h-7 w-10 bg-gray-800 rounded-lg" />
          <div className="w-8 h-8 rounded-full bg-gray-700" />
        </div>
      </div>
    </nav>
  )
}

export default function LeaderboardLoading() {
  return (
    <>
      <NavbarSkeleton />
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-40 bg-gray-700 rounded" />
        <div className="h-9 w-28 bg-gray-800 border border-gray-700 rounded-xl" />
      </div>

      {/* Ranking rows */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-800 border border-gray-700">
            <div className="w-8 flex justify-center shrink-0">
              <div className="h-5 w-5 bg-gray-700 rounded" />
            </div>
            <div className="w-9 h-9 rounded-full bg-gray-700 shrink-0" />
            <div className="flex-1 space-y-1.5 min-w-0">
              <div className="h-4 w-32 bg-gray-700 rounded" />
              <div className="h-3 w-20 bg-gray-700 rounded" />
            </div>
            <div className="text-right space-y-1.5 shrink-0">
              <div className="h-5 w-8 bg-gray-700 rounded ml-auto" />
              <div className="h-3 w-6 bg-gray-700 rounded ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  )
}
