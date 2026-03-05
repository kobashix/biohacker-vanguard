export default function LoginPage() {
  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
      <div className="card" style={{ width: '400px' }}>
        <div className="card-header">
          <h1 className="card-title">Vanguard Pro Login</h1>
          <p className="card-description">Please sign in to access your bio-tracking dashboard.</p>
        </div>
        <div className="card-content">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="email@example.com" disabled />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" disabled />
          </div>
          <button className="btn btn-primary" style={{ width: '100%' }}>Sign In (Demo Only)</button>
        </div>
      </div>
    </div>
  )
}
