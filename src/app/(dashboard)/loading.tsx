export default function Loading() {
  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8 }} />
        <div className="skeleton" style={{ width: 200, height: 24, borderRadius: 4 }} />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
        <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
        <div className="skeleton" style={{ height: 300, borderRadius: 14 }} />
      </div>
    </div>
  );
}
