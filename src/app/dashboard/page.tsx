export default function DashboardPage() {
  return (
    <div className="app-container">
      <div className="header">
        <h1 className="header-title">Vanguard Pro Dashboard</h1>
      </div>
      <main className="main-content">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Welcome</h2>
            <p className="card-description">Authenticated View</p>
          </div>
          <div className="card-content">
            <p>If you see this, you have an active session (or the middleware is bypassed).</p>
          </div>
        </div>
      </main>
    </div>
  )
}
