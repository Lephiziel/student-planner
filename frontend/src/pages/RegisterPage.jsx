import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      await api.post('/auth/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации')
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
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.025em', marginBottom: '6px' }}>Создать аккаунт</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>Начните планировать учёбу</p>
        </div>

        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          {error && (
            <div className="anim-fade" style={{ background: 'var(--red-bg)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px', padding: '9px 13px', marginBottom: '16px', fontSize: '12px', color: 'var(--red)' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Имя', name: 'name', type: 'text', placeholder: 'Иван Иванов' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Пароль', name: 'password', type: 'password', placeholder: 'Минимум 8 символов' },
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
              {loading ? 'Создаём...' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '12px', color: 'var(--text-3)' }}>
          Уже есть аккаунт?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Войти</Link>
        </p>
      </div>
    </div>
  )
}