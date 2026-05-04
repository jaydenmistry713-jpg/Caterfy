export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded-lg" />
      <div className="h-4 w-72 bg-gray-100 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-xl border border-gray-200" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 bg-white rounded-xl border border-gray-200" />
        ))}
      </div>
    </div>
  )
}
