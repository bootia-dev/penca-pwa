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

export default function AdminLoading() {
  return (
    <>
      <NavbarSkeleton />
      <div className="max-w-3xl mx-auto px-4 py-6 pb-24 animate-pulse">
      {/* Title */}
      <div className="h-7 w-32 bg-gray-700 rounded mb-6" />

      {/* Tab bar */}
      <div className="flex bg-gray-800 rounded-xl p-1 mb-6 gap-1">
        <div className="flex-1 h-9 bg-gray-700 rounded-lg" />
        <div className="flex-1 h-9 bg-gray-700/50 rounded-lg" />
      </div>

      {/* Add match form skeleton */}
      <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700 mb-6">
        <div className="h-5 w-28 bg-gray-700 rounded mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`${i === 4 || i === 5 ? 'col-span-2' : ''}`}>
              <div className="h-3 w-16 bg-gray-700 rounded mb-1" />
              <div className="h-10 bg-gray-700 rounded-lg" />
            </div>
          ))}
          <div className="col-span-2 h-10 bg-gray-700 rounded-lg" />
        </div>
      </div>

      {/* Match list skeletons */}
      <div className="h-5 w-28 bg-gray-700 rounded mb-3" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-xl p-3 border border-gray-700">
            <div className="flex items-center justify-between mb-1">
              <div className="h-4 w-48 bg-gray-700 rounded" />
              <div className="h-5 w-16 bg-gray-700 rounded-full" />
            </div>
            <div className="h-3 w-36 bg-gray-700 rounded mb-2" />
            <div className="flex gap-2">
              <div className="h-9 w-14 bg-gray-700 rounded-lg" />
              <div className="h-9 w-14 bg-gray-700 rounded-lg" />
              <div className="h-9 w-20 bg-gray-700 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
    </>
  )
}
