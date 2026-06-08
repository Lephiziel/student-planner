import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, done: 0, in_progress: 0, todo: 0, overdue: 0 })
  const [recent, setRecent] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/tasks/stats'),
      api.get('/tasks/'),
      api.get('/subjects/'),
    ]).then(([s, t, sub]) => {
      setStats(s.data.success)
      setRecent((t.data.success || []).filter(t => t.status !== 'done').slice(0, 6))
      setSubjects(sub.data.success || [])
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  const statCards = [
    { label: 'Всего', value: stats.total, color: 'var(--accent)' },
    { label: 'Выполнено', value: stats.done, color: 'var(--green)' },
    { label: 'В работе', value: stats.in_progress, color: 'var(--yellow)' },
    { label: 'Просрочено', value: stats.overdue, color: 'var(--red)' },
  ]

  const priorityDot = { low: 'var(--green)', medium: 'var(--yellow)', high: 'var(--red)' }
  const statusLabel = { todo: 'К выполнению', in_progress: 'В работе', done: 'Готово' }
  const statusCls = { todo: 'badge-gray', in_progress: 'badge-yellow', done: 'badge-green' }

  return (
    <Layout>
      <div className="anim" style={{ marginBottom: '24px' }}>
        <p className="section-label">Обзор</p>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.025em' }}>Дашборд</h1>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-3)', fontSize: '13px' }}>Загрузка...</p>
      ) : (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

          {/* Main */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="anim d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px', marginBottom: '14px' }}>
              {statCards.map(c => (
                <div key={c.label} style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
                  <p style={{ fontSize: '24px', fontWeight: 700, color: c.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{c.value}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '4px' }}>{c.label}</p>
                </div>
              ))}
            </div>

            {stats.total > 0 && (
              <div className="anim d2" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 500 }}>Выполнение</span>
                  <span style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: 700 }}>{pct}%</span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg-3)', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: '99px', transition: 'width 0.7s cubic-bezier(0.16,1,0.3,1)' }} />
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '8px' }}>{stats.done} из {stats.total} задач</p>
              </div>
            )}

            {recent.length > 0 && (
              <div className="anim d3">
                <p className="section-label">Активные задачи</p>
                <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  {recent.map((t, i) => (
                    <div key={t.ID} style={{
                      display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                      borderTop: i > 0 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: priorityDot[t.priority], flexShrink: 0 }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                      {t.due_date && <span style={{ fontSize: '11px', color: 'var(--text-3)', flexShrink: 0 }}>{new Date(t.due_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>}
                      <span className={`badge ${statusCls[t.status]}`}>{statusLabel[t.status]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {stats.total === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)', fontSize: '13px' }}>
                Задач пока нет. Перейдите в раздел Задачи и создайте первую.
              </div>
            )}
          </div>

          {/* Sidebar */}
          {subjects.length > 0 && (
            <div className="anim d2" style={{ width: '200px', flexShrink: 0 }}>
              <p className="section-label">Предметы</p>
              <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                {subjects.map((s, i) => (
                  <div key={s.ID} style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px',
                    borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.color || 'var(--accent)', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  )
}