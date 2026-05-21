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

export default function DashboardLoading() {
  return (
    <>
      <NavbarSkeleton />
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24 animate-pulse">
      {/* Stats bar */}
      <div className="mb-6 bg-gray-800 rounded-2xl p-4 border border-gray-700 flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-700 rounded" />
          <div className="h-8 w-12 bg-gray-700 rounded" />
        </div>
        <div className="space-y-2 items-end flex flex-col">
          <div className="h-3 w-20 bg-gray-700 rounded" />
          <div className="h-8 w-8 bg-gray-700 rounded" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex bg-gray-800 rounded-xl p-1 mb-3 gap-1">
        <div className="flex-1 h-9 bg-gray-700 rounded-lg" />
        <div className="flex-1 h-9 bg-gray-700/50 rounded-lg" />
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 mb-4">
        {[40, 28, 32, 28, 36].map((w, i) => (
          <div key={i} className={`h-7 w-${w} bg-gray-800 border border-gray-700 rounded-full shrink-0`} style={{ width: `${w * 4}px` }} />
        ))}
      </div>

      {/* Match cards */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 flex items-center justify-end gap-1.5">
                <div className="h-3 w-16 bg-gray-700 rounded" />
                <div className="h-7 w-7 bg-gray-700 rounded" />
              </div>
              <div className="w-14 h-8 bg-gray-700 rounded-lg mx-1" />
              <div className="flex-1 flex items-center gap-1.5">
                <div className="h-7 w-7 bg-gray-700 rounded" />
                <div className="h-3 w-16 bg-gray-700 rounded" />
              </div>
            </div>
            <div className="flex justify-center">
              <div className="h-3 w-32 bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  )
}
