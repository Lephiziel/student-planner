import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

function getUserName() {
  try { const p = JSON.parse(atob(localStorage.getItem('token').split('.')[1])); return p.name || p.email?.split('@')[0] || null } catch { return null }
}

function DonutChart({ pct, done, total }) {
  const size = 104, stroke = 10, r = (size - stroke) / 2, circ = 2 * Math.PI * r, dash = Math.max(0, pct / 100) * circ
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <defs><linearGradient id="donut-grad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#7c3aed"/><stop offset="100%" stopColor="#a78bfa"/></linearGradient></defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-3)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#donut-grad)" strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1)' }}/>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.04em', lineHeight: 1 }}>{pct}%</div>
        <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '3px', fontWeight: 500 }}>{done}/{total}</div>
      </div>
    </div>
  )
}

const pDot = { low: 'var(--green)', medium: 'var(--yellow)', high: 'var(--red)' }
const sLbl = { todo: 'К выполнению', in_progress: 'В работе', done: 'Готово' }
const sBadge = { todo: 'badge-gray', in_progress: 'badge-yellow', done: 'badge-green' }

export default function DashboardPage() {
  const [stats, setStats] = useState({ total: 0, done: 0, in_progress: 0, overdue: 0 })
  const [recent, setRecent] = useState([])
  const [subjects, setSubjects] = useState([])
  const [subStats, setSubStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/tasks/stats'), api.get('/tasks/'), api.get('/subjects/'), api.get('/subjects/stats')])
      .then(([s, t, sub, ss]) => {
        setStats(s.data.success)
        setRecent((t.data.success || []).filter(t => t.status !== 'done').slice(0, 6))
        setSubjects(sub.data.success || [])
        const map = {}; (ss.data.success || []).forEach(x => { map[x.subject_id] = x }); setSubStats(map)
      }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
  const name = getUserName()
  const greeting = (() => { const h = new Date().getHours(); if (h < 6) return 'Доброй ночи'; if (h < 12) return 'Доброе утро'; if (h < 17) return 'Добрый день'; return 'Добрый вечер' })()

  return (
    <Layout>
      <div style={{ marginBottom: '24px' }}>
        <p className="section-label">{new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.035em', lineHeight: 1.1 }}>{greeting}{name ? `, ${name}` : ''} ✦</h1>
        {stats.overdue > 0 && (
          <p style={{ fontSize: '12px', color: 'var(--red)', marginTop: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--red)', boxShadow: '0 0 6px var(--red)', flexShrink: 0 }}/>
            {stats.overdue} {stats.overdue === 1 ? 'задача просрочена' : stats.overdue < 5 ? 'задачи просрочены' : 'задач просрочено'}
          </p>
        )}
      </div>

      {loading ? <p style={{ color: 'var(--text-3)', fontSize: '13px' }}>Загрузка...</p> : <>
        <div className="stat-grid anim d1" style={{ marginBottom: '14px' }}>
          {[{ label: 'Всего', value: stats.total, color: 'var(--accent)' }, { label: 'Выполнено', value: stats.done, color: 'var(--green)' }, { label: 'В работе', value: stats.in_progress, color: 'var(--yellow)' }, { label: 'Просрочено', value: stats.overdue, color: 'var(--red)' }].map(c => (
            <div key={c.label} style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderTop: `2.5px solid ${c.color}`, borderRadius: '12px', padding: '14px 16px', transition: 'box-shadow 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 20px ${c.color}22`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <p style={{ fontSize: '28px', fontWeight: 800, color: c.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{c.value}</p>
              <p style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{c.label}</p>
            </div>
          ))}
        </div>

        <div className="dash-layout">
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {stats.total > 0 && (
              <div className="anim d2" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', display: 'flex', gap: '22px', alignItems: 'center' }}>
                <DonutChart pct={pct} done={stats.done} total={stats.total}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '12px' }}>Прогресс по предметам</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {subjects.slice(0, 5).map(s => {
                      const st = subStats[s.ID]; const sp = st?.total_tasks > 0 ? Math.round((st.done_tasks / st.total_tasks) * 100) : 0
                      return (
                        <div key={s.ID} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color || 'var(--accent)', flexShrink: 0 }}/>
                          <span style={{ fontSize: '11px', color: 'var(--text-3)', width: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>{s.name}</span>
                          <div style={{ flex: 1, height: '4px', borderRadius: '99px', background: 'var(--bg-3)', overflow: 'hidden' }}>
                            <div style={{ width: `${sp}%`, height: '100%', background: s.color || 'var(--accent)', borderRadius: '99px', transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)' }}/>
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--text-3)', width: '28px', textAlign: 'right', flexShrink: 0 }}>{sp}%</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
            <div className="anim d3">
              <p className="section-label">Активные задачи</p>
              {recent.length === 0 ? (
                <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '14px', padding: '48px 20px', textAlign: 'center' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: '22px' }}>✓</div>
                  <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-2)', marginBottom: '4px' }}>Всё выполнено!</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-3)' }}>Нет активных задач — отличная работа</p>
                </div>
              ) : (
                <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  {recent.map((t, i) => (
                    <div key={t.ID} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: pDot[t.priority], flexShrink: 0, boxShadow: `0 0 7px ${pDot[t.priority]}99` }}/>
                      <span style={{ fontSize: '13px', color: 'var(--text-1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{t.title}</span>
                      {t.due_date && <span style={{ fontSize: '11px', color: 'var(--text-3)', flexShrink: 0 }}>{new Date(t.due_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>}
                      <span className={`badge ${sBadge[t.status]}`}>{sLbl[t.status]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {subjects.length > 0 && (
            <div className="anim d2 dash-sidebar">
              <p className="section-label">Предметы</p>
              <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                {subjects.map((s, i) => {
                  const st = subStats[s.ID]; const sd = st?.done_tasks || 0; const tot = st?.total_tasks || 0
                  return (
                    <div key={s.ID} style={{ padding: '10px 12px', borderTop: i > 0 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: tot > 0 ? '5px' : 0 }}>
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.color || 'var(--accent)', flexShrink: 0 }}/>
                        <span style={{ fontSize: '12px', color: 'var(--text-2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>{s.name}</span>
                        {tot > 0 && <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>{sd}/{tot}</span>}
                      </div>
                      {tot > 0 && <div style={{ height: '2px', borderRadius: '99px', background: 'var(--bg-3)', overflow: 'hidden', marginLeft: '14px' }}><div style={{ width: `${Math.round((sd/tot)*100)}%`, height: '100%', background: s.color || 'var(--accent)', borderRadius: '99px', transition: 'width 0.7s cubic-bezier(0.16,1,0.3,1)' }}/></div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </>}
    </Layout>
  )
}
