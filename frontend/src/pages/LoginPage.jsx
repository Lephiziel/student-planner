import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import { useTheme } from '../context/ThemeContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [btnHov, setBtnHov] = useState(false)

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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', position: 'relative', overflow: 'hidden', transition: 'background 0.25s' }}>
      <div style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '500px', background: 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '8%', width: '300px', height: '300px', background: 'radial-gradient(ellipse, rgba(167,139,250,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <button onClick={toggleTheme} style={{ position: 'absolute', top: '20px', right: '20px', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-1)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '15px', zIndex: 10 }}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      <div className="auth-card-wrap" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '18px', background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)', marginBottom: '22px', boxShadow: '0 12px 36px rgba(124,58,237,0.5)' }}>
            <svg width="26" height="26" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.95"/>
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.70"/>
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.70"/>
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.45"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.035em', marginBottom: '6px' }}>Добро пожаловать</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-3)' }}>Войдите в <strong style={{ color: 'var(--accent)', fontWeight: 700 }}>StudentPlanner</strong></p>
        </div>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', boxShadow: theme === 'dark' ? '0 12px 52px rgba(0,0,0,0.4)' : '0 8px 40px rgba(100,80,200,0.12)' }}>
          {error && <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '9px 13px', marginBottom: '16px', fontSize: '12px', color: 'var(--red)' }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[{ label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' }, { label: 'Пароль', name: 'password', type: 'password', placeholder: '••••••••' }].map(f => (
              <div key={f.name}>
                <label className="field-label">{f.label}</label>
                <input className="input" type={f.type} name={f.name} value={form[f.name]} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} required placeholder={f.placeholder} />
              </div>
            ))}
            <button type="submit" disabled={loading} onMouseEnter={() => setBtnHov(true)} onMouseLeave={() => setBtnHov(false)}
              style={{ width: '100%', padding: '11px 16px', borderRadius: '10px', border: 'none', background: loading ? 'var(--bg-3)' : 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)', color: loading ? 'var(--text-3)' : 'white', fontSize: '14px', fontWeight: 700, fontFamily: 'inherit', cursor: loading ? 'wait' : 'pointer', marginTop: '4px', boxShadow: loading ? 'none' : btnHov ? '0 8px 28px rgba(124,58,237,0.6)' : '0 6px 20px rgba(124,58,237,0.40)', transform: btnHov && !loading ? 'translateY(-1px)' : 'none', transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)' }}>
              {loading ? 'Входим…' : 'Войти в аккаунт →'}
            </button>
          </form>
        </div>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: 'var(--text-3)' }}>
          Нет аккаунта?{' '}<Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 700 }}>Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  )
}
