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

  const fetchData = () => Promise.all([api.get('/subjects/'), api.get('/subjects/stats')])
    .then(([subRes, statsRes]) => {
      setSubjects(subRes.data.success || [])
      const map = {}; (statsRes.data.success || []).forEach(s => { map[s.subject_id] = s }); setStats(map); setLoading(false)
    }).catch(console.error)

  useEffect(() => { fetchData() }, [])

  const openCreate = () => { setForm({ name: '', color: COLORS[0] }); setEditId(null); setShowForm(true); setError('') }
  const openEdit = s => { setForm({ name: s.name, color: s.color || COLORS[0] }); setEditId(s.ID); setShowForm(true); setError('') }
  const handleSubmit = async e => {
    e.preventDefault(); setError('')
    try { editId ? await api.put(`/subjects/${editId}`, form) : await api.post('/subjects/', form); setShowForm(false); fetchData() }
    catch (err) { setError(err.response?.data?.error || 'Ошибка') }
  }
  const handleDelete = async id => { if (!confirm('Удалить предмет?')) return; await api.delete(`/subjects/${id}`); fetchData() }

  return (
    <Layout>
      <div className="page-header">
        <div><p className="section-label">Учёба</p><h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>Предметы</h1></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Добавить</button>
      </div>

      {showForm && (
        <div className="anim-scale" style={{ background: 'var(--bg-1)', border: '1px solid var(--border-accent)', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-1)' }}>{editId ? 'Редактировать предмет' : 'Новый предмет'}</span>
            <button className="icon-btn" onClick={() => setShowForm(false)}>✕</button>
          </div>
          {error && <p style={{ fontSize: '12px', color: 'var(--red)', marginBottom: '12px' }}>{error}</p>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div><label className="field-label">Название</label><input className="input" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Математика"/></div>
            <div>
              <label className="field-label">Цвет</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                {COLORS.map(c => <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} style={{ width: '26px', height: '26px', borderRadius: '50%', background: c, border: 'none', cursor: 'pointer', outline: form.color === c ? `2.5px solid ${c}` : '2.5px solid transparent', outlineOffset: '3px', transform: form.color === c ? 'scale(1.2)' : 'scale(1)', boxShadow: form.color === c ? `0 0 12px ${c}90` : 'none', transition: 'all 0.15s' }}/>)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}><button className="btn btn-primary" type="submit">{editId ? 'Сохранить' : 'Создать'}</button><button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Отмена</button></div>
          </form>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-3)', fontSize: '13px' }}>Загрузка...</p>
      : subjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: '26px' }}>✦</div>
          <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-2)', marginBottom: '6px' }}>Предметов пока нет</p>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', marginBottom: '20px' }}>Добавьте первый предмет</p>
          <button className="btn btn-primary" onClick={openCreate}>+ Добавить предмет</button>
        </div>
      ) : (
        <div className="subjects-grid anim d1">
          {subjects.map(s => {
            const st = stats[s.ID]; const tot = st?.total_tasks || 0; const done = st?.done_tasks || 0; const pct = tot > 0 ? Math.round((done/tot)*100) : 0
            return (
              <div key={s.ID} style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', transition: 'box-shadow 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 24px ${s.color||'#a78bfa'}28`; e.currentTarget.style.borderColor = (s.color||'#a78bfa')+'55' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'var(--border)' }}>
                <div style={{ height: '3px', background: `linear-gradient(90deg, ${s.color||'var(--accent)'}, ${s.color||'var(--accent)'}55)` }}/>
                <div style={{ padding: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: s.color||'var(--accent)', flexShrink: 0, boxShadow: `0 0 8px ${s.color||'#a78bfa'}99` }}/>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', flexShrink: 0, marginLeft: '6px' }}>
                      <button className="icon-btn" onClick={() => openEdit(s)}>✏</button>
                      <button className="icon-btn" onClick={() => handleDelete(s.ID)} onMouseEnter={e => e.currentTarget.style.color='var(--red)'} onMouseLeave={e => e.currentTarget.style.color='var(--text-3)'}>✕</button>
                    </div>
                  </div>
                  {tot === 0 ? <p style={{ fontSize: '11px', color: 'var(--text-3)' }}>Нет задач</p> : <>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: s.color||'var(--accent)', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '3px' }}>{pct}%</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', marginBottom: '10px' }}>{done} из {tot} задач</div>
                    <div style={{ height: '4px', borderRadius: '99px', background: 'var(--bg-3)', overflow: 'hidden' }}><div style={{ width: `${pct}%`, height: '100%', background: s.color||'var(--accent)', borderRadius: '99px', transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)' }}/></div>
                  </>}
                </div>
              </div>
            )
          })}
          <button onClick={openCreate} style={{ background: 'transparent', border: '1.5px dashed var(--border-2)', borderRadius: '14px', padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-3)', fontSize: '13px', fontFamily: 'inherit', fontWeight: 600, transition: 'all 0.2s', minHeight: '130px' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent-border)'; e.currentTarget.style.color='var(--accent)'; e.currentTarget.style.background='var(--accent-bg)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border-2)'; e.currentTarget.style.color='var(--text-3)'; e.currentTarget.style.background='transparent' }}>
            <span style={{ fontSize: '26px', lineHeight: 1 }}>+</span><span>Добавить предмет</span>
          </button>
        </div>
      )}
    </Layout>
  )
}
