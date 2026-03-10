import { useState, useEffect } from 'react'

interface DashboardStats {
  total_skills: number
  success_rate: number
  avg_duration_seconds: number
  active_tasks: any[]
  stats: {
    success_trend: Array<{ date: string; count: number }>
    duration_distribution: { min: number; max: number; avg: number }
    failure_reasons: Array<{ reason: string; count: number }>
  }
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch dashboard:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  }

  if (!stats) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Failed to load data</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>📊 Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#666' }}>Total Skills</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>{stats.total_skills}</p>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#666' }}>Success Rate</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>{(stats.success_rate * 100).toFixed(1)}%</p>
        </div>
        
        <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#666' }}>Avg Duration</h3>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>{stats.avg_duration_seconds}s</p>
        </div>
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0 }}>Active Tasks</h2>
        {stats.active_tasks.length === 0 ? (
          <p style={{ color: '#999' }}>No active tasks</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #eee' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Skill ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Stage</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Progress</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Started</th>
              </tr>
            </thead>
            <tbody>
              {stats.active_tasks.map(task => (
                <tr key={task.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{task.skill_id}</td>
                  <td style={{ padding: '12px' }}>{task.stage}</td>
                  <td style={{ padding: '12px' }}>{(task.progress * 100).toFixed(0)}%</td>
                  <td style={{ padding: '12px' }}>{new Date(task.started_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0 }}>Success Trend (7 days)</h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {stats.stats.success_trend.map(item => (
            <div key={item.date} style={{ padding: '12px', background: '#f0f8ff', borderRadius: '4px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#666' }}>{item.date}</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>{item.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
