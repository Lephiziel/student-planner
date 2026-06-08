import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#a855f7']

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', color: COLORS[0] })
  const [editId, setEditId] = useState(null)
  const [error, setError] = useState('')

  const fetch = () => api.get('/subjects/').then(r => { setSubjects(r.data.success || []); setLoading(false) }).catch(console.error)
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

  const handleDelete = async id => { if (!confirm('Удалить?')) return; await api.delete(`/subjects/${id}`); fetch() }

  return (
    <Layout>
      <div className="anim" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Предметы</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '2px' }}>Учебные дисциплины</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Добавить</button>
      </div>

      {showForm && (
        <div className="anim-scale" style={{ background: 'var(--bg-1)', border: '1px solid var(--border-2)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{editId ? 'Редактировать' : 'Новый предмет'}</span>
            <button className="icon-btn" onClick={() => setShowForm(false)}>✕</button>
          </div>
          {error && <p style={{ fontSize: '12px', color: 'var(--red)', marginBottom: '10px' }}>{error}</p>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label className="field-label">Название</label>
              <input className="input" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Математика" />
            </div>
            <div>
              <label className="field-label">Цвет</label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                {COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} style={{
                    width: '22px', height: '22px', borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
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
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          {subjects.map((s, i) => (
            <div key={s.ID} className={`anim d${Math.min(i + 1, 4)}`} style={{
              display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
              borderTop: i > 0 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.1s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color || '#6366f1', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: 'var(--text-1)', fontWeight: 500, flex: 1 }}>{s.name}</span>
              <div style={{ display: 'flex', gap: '2px' }}>
                <button className="icon-btn" onClick={() => openEdit(s)}>✏</button>
                <button className="icon-btn" onClick={() => handleDelete(s.ID)} onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  )
}