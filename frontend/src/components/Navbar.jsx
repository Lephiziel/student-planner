import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const nav = [
  { path: '/dashboard', label: 'Обзор' },
  { path: '/tasks',     label: 'Задачи' },
  { path: '/subjects',  label: 'Предметы' },
  { path: '/calendar',  label: 'Календарь' },
]

function getUserName() {
  try {
    const p = JSON.parse(atob(localStorage.getItem('token').split('.')[1]))
    return p.name || p.email?.split('@')[0] || null
  } catch { return null }
}

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const userName = getUserName()
  const initials = userName ? userName.charAt(0).toUpperCase() : 'U'

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: isDark ? 'rgba(22,19,31,0.92)' : 'rgba(242,240,251,0.92)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)', height: '52px',
      display: 'flex', alignItems: 'center', transition: 'background 0.25s',
    }}>
      <div className="navbar-inner">
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px', flexShrink: 0, textDecoration: 'none' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(124,58,237,0.45)', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.95"/>
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity="0.65"/>
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.65"/>
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity="0.40"/>
            </svg>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.025em' }}>
            Student<span style={{ color: 'var(--accent)' }} className="navbar-brand-full">Planner</span>
          </span>
        </Link>

        <nav className="navbar-links">
          {nav.map(({ path, label }) => {
            const active = pathname === path
            return (
              <Link key={path} to={path} style={{
                fontSize: '13px', fontWeight: active ? 600 : 400,
                padding: '5px 13px', borderRadius: '8px', textDecoration: 'none',
                color: active ? 'var(--accent)' : 'var(--text-3)',
                background: active ? 'var(--accent-bg)' : 'transparent',
                border: active ? '1px solid var(--accent-border)' : '1px solid transparent',
                letterSpacing: '-0.01em', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'transparent' } }}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, marginLeft: '8px' }}>
          <button onClick={toggleTheme} title={isDark ? 'Светлая тема' : 'Тёмная тема'}
            style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          {userName && (
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: 'white', flexShrink: 0, userSelect: 'none' }} title={userName}>
              {initials}
            </div>
          )}
          <button onClick={handleLogout}
            style={{ fontSize: '12px', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 8px', borderRadius: '6px', transition: 'color 0.15s', fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  )
}
