import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
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
      <div className="anim" style={{ width: '100%', maxWidth: '380px' }}>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', marginBottom: '18px' }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="2" fill="#a78bfa"/>
              <rect x="10" y="2" width="6" height="6" rx="2" fill="#a78bfa" opacity="0.5"/>
              <rect x="2" y="10" width="6" height="6" rx="2" fill="#a78bfa" opacity="0.5"/>
              <rect x="10" y="10" width="6" height="6" rx="2" fill="#a78bfa" opacity="0.3"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.025em', marginBottom: '6px' }}>Добро пожаловать</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>Войдите в StudentPlanner</p>
        </div>

        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          {error && (
            <div className="anim-fade" style={{ background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '9px 13px', marginBottom: '16px', fontSize: '12px', color: 'var(--red)' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Пароль', name: 'password', type: 'password', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.name}>
                <label className="field-label">{f.label}</label>
                <input className="input" type={f.type} name={f.name} value={form[f.name]}
                  onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
                  required placeholder={f.placeholder} />
              </div>
            ))}
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '9px', marginTop: '2px' }}>
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '12px', color: 'var(--text-3)' }}>
          Нет аккаунта?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}