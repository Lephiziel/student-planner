import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

const COLORS = ['#a78bfa','#34d399','#fbbf24','#f87171','#60a5fa','#f472b6','#fb923c','#2dd4bf','#818cf8','#a3e635']

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([])
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', color: COLORS[0] })
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  const fetch = () => Promise.all([
    api.get('/subjects/'),
    api.get('/subjects/stats'),
  ]).then(([subRes, statsRes]) => {
    setSubjects(subRes.data.success || [])
    const statsMap = {}
    ;(statsRes.data.success || []).forEach(s => { statsMap[s.subject_id] = s })
    setStats(statsMap)
    setLoading(false)
  }).catch(console.error)
  useEffect(() => { fetch() }, [])

  const openCreate = () => { setForm({ name: '', color: COLORS[0] }); setEditId(null); setShowForm(true); setError('') }
  const openEdit = s => { setForm({ name: s.name, color: s.color || COLORS[0] }); setEditId(s.ID); setShowForm(true); setError('') }

  const handleSubmit = async e => {
    e.preventDefault(); setError('')
    try {
      editId ? await api.put(`/subjects/${editId}`, form) : await api.post('/subjects/', form)
      setShowForm(false); fetch()
    } catch (err) { setError(err.response?.data?.error || 'Ошибка') }
  }

  const handleDelete = async id => { if (!confirm('Удалить предмет?')) return; await api.delete(`/subjects/${id}`); fetch() }

  return (
    <Layout>
      <div className="anim" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <p className="section-label">Учёба</p>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-1)', letterSpacing: '-0.025em' }}>Предметы</h1>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Добавить</button>
      </div>

      {showForm && (
        <div className="anim-scale" style={{ background: 'var(--bg-1)', border: '1px solid var(--border-accent)', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-1)' }}>{editId ? 'Редактировать' : 'Новый предмет'}</span>
            <button className="icon-btn" onClick={() => setShowForm(false)}>✕</button>
          </div>
          {error && <p style={{ fontSize: '12px', color: 'var(--red)', marginBottom: '12px' }}>{error}</p>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label className="field-label">Название</label>
              <input className="input" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Математика" />
            </div>
            <div>
              <label className="field-label">Цвет</label>
              <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginTop: '4px' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} style={{
                    width: '24px', height: '24px', borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                    outline: form.color === c ? `2px solid ${c}` : '2px solid transparent',
                    outlineOffset: '2px',
                    transform: form.color === c ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.15s',
                  }} />
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" type="submit">{editId ? 'Сохранить' : 'Создать'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-3)', fontSize: '13px' }}>Загрузка...</p>
      ) : subjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)', fontSize: '13px' }}>Предметов пока нет</div>
      ) : (
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          {subjects.map((s, i) => (
            <div key={s.ID} className={`anim d${Math.min(i+1,4)}`} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px',
              borderTop: i > 0 ? '1px solid var(--border)' : 'none', transition: 'background 0.1s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color || 'var(--accent)', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--text-1)', fontWeight: 500, flex: 1 }}>{s.name}</span>
              {(() => {
                const st = stats[s.ID]
                if (!st || st.total_tasks === 0) {
                  return <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>Нет задач</span>
                }
                const pct = Math.round((st.done_tasks / st.total_tasks) * 100)
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                      {st.done_tasks}/{st.total_tasks} задач
                    </span>
                    <div style={{ width: '60px', height: '4px', background: 'var(--bg-3)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: s.color || 'var(--accent)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-2)', fontWeight: 600, minWidth: '28px', textAlign: 'right' }}>{pct}%</span>
                  </div>
                )
              })()}
              <div style={{ display: 'flex', gap: '2px' }}>
                <button className="icon-btn" onClick={() => openEdit(s)}>✏</button>
                <button className="icon-btn" onClick={() => handleDelete(s.ID)}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}