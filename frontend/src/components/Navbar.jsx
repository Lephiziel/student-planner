import { Link, useLocation, useNavigate } from 'react-router-dom'

const nav = [
  { path: '/dashboard', label: 'Обзор' },
  { path: '/tasks', label: 'Задачи' },
  { path: '/subjects', label: 'Предметы' },
  { path: '/calendar', label: 'Календарь' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(10,10,11,0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      height: '48px',
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px', width: '100%', display: 'flex', alignItems: 'center', gap: '0' }}>

        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginRight: '32px', letterSpacing: '-0.01em' }}>
          StudentPlanner
        </span>

        <nav style={{ display: 'flex', gap: '2px', flex: 1 }}>
          {nav.map(({ path, label }) => {
            const active = pathname === path
            return (
              <Link key={path} to={path} style={{
                fontSize: '13px',
                fontWeight: active ? 500 : 400,
                padding: '5px 10px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: active ? 'var(--text-1)' : 'var(--text-3)',
                background: active ? 'var(--bg-2)' : 'transparent',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text-2)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--text-3)' }}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        <button
          onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('refresh_token'); navigate('/login') }}
          style={{ fontSize: '12px', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px 8px', borderRadius: '5px', transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-2)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
        >
          Выйти
        </button>
      </div>
    </header>
  )
}