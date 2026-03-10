import { useState, useEffect } from 'react'

interface Record {
  id: number
  skill_id: string
  intent: string
  status: string
  stage: string
  progress: number
  started_at: string
  completed_at: string
  duration_seconds: number
}

export default function History() {
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/history?limit=20&offset=0')
      .then(res => res.json())
      .then(data => {
        setRecords(data.results || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch history:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>📜 History</h1>
      
      <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {records.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>No records yet</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Skill ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Duration</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Started</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{record.id}</td>
                  <td style={{ padding: '12px' }}>{record.skill_id}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: record.status === 'success' ? '#52c41a' : record.status === 'failed' ? '#ff4d4f' : '#1890ff',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {record.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>{record.duration_seconds || '-'}s</td>
                  <td style={{ padding: '12px' }}>{new Date(record.started_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
