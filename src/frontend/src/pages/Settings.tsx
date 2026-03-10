import { useState, useEffect } from 'react'

interface Settings {
  max_retries: number
  timeout_seconds: number
  sandbox_enabled: boolean
  agent_selection: string
}

export default function Settings() {
  const [settings, setSettings] = useState<Settings>({
    max_retries: 3,
    timeout_seconds: 600,
    sandbox_enabled: true,
    agent_selection: 'auto'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setSettings(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch settings:', err)
        setLoading(false)
      })
  }, [])

  const handleSave = () => {
    setSaving(true)
    fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    })
      .then(res => res.json())
      .then(data => {
        setSettings(data)
        setSaving(false)
        alert('Settings saved!')
      })
      .catch(err => {
        console.error('Failed to save settings:', err)
        setSaving(false)
        alert('Failed to save settings')
      })
  }

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
  }

  return (
    <div>
      <h1 style={{ marginBottom: '24px' }}>⚙️ Settings</h1>
      
      <div style={{ background: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Max Retries</label>
          <input
            type="number"
            value={settings.max_retries}
            onChange={e => setSettings({ ...settings, max_retries: parseInt(e.target.value) })}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Timeout (seconds)</label>
          <input
            type="number"
            value={settings.timeout_seconds}
            onChange={e => setSettings({ ...settings, timeout_seconds: parseInt(e.target.value) })}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Sandbox Enabled</label>
          <input
            type="checkbox"
            checked={settings.sandbox_enabled}
            onChange={e => setSettings({ ...settings, sandbox_enabled: e.target.checked })}
            style={{ marginRight: '8px' }}
          />
          <span>{settings.sandbox_enabled ? 'Yes' : 'No'}</span>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Agent Selection</label>
          <select
            value={settings.agent_selection}
            onChange={e => setSettings({ ...settings, agent_selection: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #d9d9d9' }}
          >
            <option value="auto">Auto</option>
            <option value="manual">Manual</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: '#1890ff',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '4px',
            cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
