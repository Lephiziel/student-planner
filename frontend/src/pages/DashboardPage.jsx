import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, done: 0, inProgress: 0, overdue: 0 })
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/tasks/').then(res => {
      const tasks = res.data.success || []
      const now = new Date()
      setStats({
        total: tasks.length,
        done: tasks.filter(t => t.status === 'done').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'done').length,
      })
      setRecent(tasks.filter(t => t.status !== 'done').slice(0, 6))
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0

  const statCards = [
    { label: 'Всего', value: stats.total, color: 'var(--text-2)' },
    { label: 'Выполнено', value: stats.done, color: 'var(--green)' },
    { label: 'В работе', value: stats.inProgress, color: 'var(--yellow)' },
    { label: 'Просрочено', value: stats.overdue, color: 'var(--red)' },
  ]

  const priorityDot = { low: 'var(--green)', medium: 'var(--yellow)', high: 'var(--red)' }
  const statusLabel = { todo: 'К выполнению', in_progress: 'В работе', done: 'Готово' }
  const statusBadge = { todo: 'badge-gray', in_progress: 'badge-yellow', done: 'badge-green' }

  return (
    <Layout>
      <div className="anim" style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Обзор</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '2px' }}>Прогресс по задачам</p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-3)', fontSize: '13px' }}>Загрузка...</p>
      ) : (
        <>
          {/* Stat row */}
          <div className="anim d1" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
            {statCards.map(c => (
              <div key={c.label} style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px' }}>
                <p style={{ fontSize: '22px', fontWeight: 600, color: c.color, letterSpacing: '-0.02em' }}>{c.value}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-3)', marginTop: '2px' }}>{c.label}</p>
              </div>
            ))}
          </div>

          {/* Progress */}
          {stats.total > 0 && (
            <div className="anim d2" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-2)', fontWeight: 500 }}>Выполнение</span>
                <span style={{ fontSize: '13px', color: 'var(--text-1)', fontWeight: 600 }}>{pct}%</span>
              </div>
              <div style={{ height: '4px', background: 'var(--bg-3)', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: '99px', transition: 'width 0.6s cubic-bezier(0.16,1,0.3,1)' }} />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '8px' }}>{stats.done} из {stats.total} задач</p>
            </div>
          )}

          {/* Recent */}
          {recent.length > 0 && (
            <div className="anim d3">
              <p style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Активные задачи</p>
              <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                {recent.map((t, i) => (
                  <div key={t.ID} style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                    borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: priorityDot[t.priority], flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: 'var(--text-1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                    {t.due_date && (
                      <span style={{ fontSize: '11px', color: 'var(--text-3)', flexShrink: 0 }}>
                        {new Date(t.due_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    <span className={`badge ${statusBadge[t.status]}`}>{statusLabel[t.status]}</span>
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
        </>
      )}
    </Layout>
  )
}