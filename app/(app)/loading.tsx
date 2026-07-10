export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-64 rounded-md bg-muted" />
      <div className="h-4 w-96 rounded-md bg-muted" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-xl border border-border bg-card p-6">
            <div className="h-11 w-11 rounded-xl bg-muted" />
            <div className="h-4 w-24 rounded-md bg-muted mt-4" />
            <div className="h-6 w-16 rounded-md bg-muted mt-2" />
          </div>
        ))}
      </div>
      <div className="h-64 rounded-xl border border-border bg-card" />
    </div>
  )
}
