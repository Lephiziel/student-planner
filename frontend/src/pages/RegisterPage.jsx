import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await api.post('/auth/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="anim" style={{ width: '100%', maxWidth: '360px' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', marginBottom: '16px' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="5" height="5" rx="1.5" fill="#818cf8"/><rect x="9" y="2" width="5" height="5" rx="1.5" fill="#818cf8" opacity="0.5"/><rect x="2" y="9" width="5" height="5" rx="1.5" fill="#818cf8" opacity="0.5"/><rect x="9" y="9" width="5" height="5" rx="1.5" fill="#818cf8" opacity="0.3"/></svg>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.02em', marginBottom: '4px' }}>Создать аккаунт</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)' }}>Начните управлять учёбой</p>
        </div>

        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
          {error && (
            <div className="anim-fade" style={{ background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '8px 12px', marginBottom: '16px', fontSize: '12px', color: 'var(--red)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Имя', name: 'name', type: 'text', placeholder: 'Иван Иванов' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'you@example.com' },
              { label: 'Пароль', name: 'password', type: 'password', placeholder: 'Минимум 8 символов' },
            ].map(f => (
              <div key={f.name}>
                <label className="field-label">{f.label}</label>
                <input className="input" type={f.type} name={f.name} value={form[f.name]} onChange={e => setForm({ ...form, [e.target.name]: e.target.value })} required placeholder={f.placeholder} />
              </div>
            ))}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginTop: '4px', padding: '8px' }}>
              {loading ? 'Создаём...' : 'Зарегистрироваться'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-3)' }}>
          Уже есть аккаунт?{' '}
          <Link to="/login" style={{ color: 'var(--accent-2)', textDecoration: 'none' }}>Войти</Link>
        </p>
      </div>
    </div>
  )
}