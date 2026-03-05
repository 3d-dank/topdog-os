export default function FinancialsPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Financials</h1>
      <p style={{ color: '#94A3B8' }} className="text-sm mb-8">
        MRR, revenue, and financial metrics across your app portfolio
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'MRR', value: '$0', sub: 'Connect Stripe' },
          { label: 'ARR', value: '$0', sub: 'Annualized' },
          { label: 'Churn Rate', value: '—', sub: 'Last 30 days' },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-5"
            style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
          >
            <div className="text-3xl font-bold mb-1" style={{ color: '#4CAF50' }}>{card.value}</div>
            <div className="text-white font-medium text-sm">{card.label}</div>
            <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>{card.sub}</div>
          </div>
        ))}
      </div>
      <div
        className="rounded-xl p-12 text-center"
        style={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
      >
        <div className="text-5xl mb-4">💰</div>
        <div className="text-white font-semibold text-lg mb-2">Stripe Integration — Phase 2</div>
        <div className="text-sm max-w-sm mx-auto" style={{ color: '#64748B' }}>
          Add your STRIPE_SECRET_KEY to pull live revenue, subscription metrics, and payout data.
        </div>
      </div>
    </div>
  )
}
