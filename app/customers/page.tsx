export default function CustomersPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Customers</h1>
      <p style={{ color: '#94A3B8' }} className="text-sm mb-8">
        Unified customer view across all apps — coming in Phase 2
      </p>
      <div
        className="rounded-xl p-12 text-center"
        style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
      >
        <div className="text-5xl mb-4">👥</div>
        <div className="text-white font-semibold text-lg mb-2">Customer Directory</div>
        <div className="text-sm max-w-sm mx-auto" style={{ color: '#64748B' }}>
          Connect your Stripe account and app databases to populate customer records here.
        </div>
      </div>
    </div>
  )
}
