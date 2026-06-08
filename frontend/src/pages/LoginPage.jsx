import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      localStorage.setItem('token', res.data.success.access_token)
      localStorage.setItem('refresh_token', res.data.success.refresh_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="anim" style={{ width: '100%', maxWidth: '360px' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', marginBottom: '16px' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1.5" fill="#818cf8"/><rect x="9" y="2" width="5" height="5" rx="1.5" fill="#818cf8" opacity="0.5"/><rect x="2" y="9" width="5" height="5" rx="1.5" fill="#818cf8" opacity="0.5"/><rect x="9" y="9" width="5" height="5" rx="1.5" fill="#818cf8" opacity="0.3"/></svg>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Вход в StudentPlanner</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>Введите данные вашего аккаунта</p>
        </div>

        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          {error && (
            <div className="anim-fade" style={{ background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '8px 12px', marginBottom: '16px', fontSize: '12px', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Пароль', name: 'password', type: 'password', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.name}>
                <label className="field-label">{f.label}</label>
                <input className="input" type={f.type} name={f.name} value={form[f.name]} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} required placeholder={f.placeholder} />
              </div>
            ))}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '4px', padding: '8px' }}>
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-3)' }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: 'var(--accent-2)', textDecoration: 'none' }}>Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}