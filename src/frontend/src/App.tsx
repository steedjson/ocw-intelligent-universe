import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Settings from './pages/Settings'

function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <nav style={{ background: '#1890ff', padding: '16px', marginBottom: '24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Link to="/" style={{ color: 'white', marginRight: '24px', textDecoration: 'none' }}>Dashboard</Link>
            <Link to="/history" style={{ color: 'white', marginRight: '24px', textDecoration: 'none' }}>History</Link>
            <Link to="/settings" style={{ color: 'white', textDecoration: 'none' }}>Settings</Link>
          </div>
        </nav>
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
