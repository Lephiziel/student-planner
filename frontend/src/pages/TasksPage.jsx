import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

const EMPTY = { title: '', description: '', priority: 'medium', status: 'todo', due_date: '', subject_id: null }
const PRIORITY = { low: { label: 'Низкий', cls: 'badge-green' }, medium: { label: 'Средний', cls: 'badge-yellow' }, high: { label: 'Высокий', cls: 'badge-red' } }
const STATUS = { todo: { label: 'К выполнению', cls: 'badge-gray' }, in_progress: { label: 'В работе', cls: 'badge-yellow' }, done: { label: 'Готово', cls: 'badge-green' } }

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ status: '', priority: '', subject_id: '' })

  const fetchTasks = async () => {
    const params = {}
    if (filters.status) params.status = filters.status
    if (filters.priority) params.priority = filters.priority
    if (filters.subject_id) params.subject_id = filters.subject_id
    const res = await api.get('/tasks/', { params })
    setTasks(res.data.success || [])
    setLoading(false)
  }

  useEffect(() => { api.get('/subjects/').then(r => setSubjects(r.data.success || [])).catch(console.error) }, [])
  useEffect(() => { fetchTasks().catch(console.error) }, [filters])

  const openCreate = () => { setForm(EMPTY); setEditId(null); setShowForm(true); setError('') }
  const openEdit = t => {
    setForm({ title: t.title, description: t.description || '', priority: t.priority, status: t.status, due_date: t.due_date ? t.due_date.split('T')[0] : '', subject_id: t.subject_id || null })
    setEditId(t.ID); setShowForm(true); setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault(); setError('')
    const payload = { ...form, due_date: form.due_date ? new Date(form.due_date).toISOString() : null, subject_id: form.subject_id ? Number(form.subject_id) : null }
    try {
      editId ? await api.put(`/tasks/${editId}`, payload) : await api.post('/tasks/', payload)
      setShowForm(false); fetchTasks()
    } catch (err) { setError(err.response?.data?.error || 'Ошибка') }
  }

  const handleDelete = async id => { if (!confirm('Удалить?')) return; await api.delete(`/tasks/${id}`); fetchTasks() }
  const handleStatus = async (t, s) => { await api.patch(`/tasks/${t.ID}/status`, { status: s }); fetchTasks() }

  const getSubject = id => subjects.find(s => s.ID === id)
  const isOverdue = t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'

  const selStyle = { background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '12px', padding: '5px 8px', borderRadius: '6px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }

  return (
    <Layout>
      {/* Header */}
      <div className="anim" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>Задачи</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '2px' }}>{tasks.length} задач</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ Новая задача</button>
      </div>

      {/* Filters */}
      <div className="anim d1" style={{ display: 'flex', gap: '6px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        {[
          { key: 'status', opts: [['', 'Статус'], ['todo', 'К выполнению'], ['in_progress', 'В работе'], ['done', 'Готово']] },
          { key: 'priority', opts: [['', 'Приоритет'], ['low', 'Низкий'], ['medium', 'Средний'], ['high', 'Высокий']] },
        ].map(({ key, opts }) => (
          <select key={key} value={filters[key]} onChange={e => setFilters({ ...filters, [key]: e.target.value })} style={selStyle}>
            {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <select value={filters.subject_id} onChange={e => setFilters({ ...filters, subject_id: e.target.value })} style={selStyle}>
          <option value="">Предмет</option>
          {subjects.map(s => <option key={s.ID} value={s.ID}>{s.name}</option>)}
        </select>
        {(filters.status || filters.priority || filters.subject_id) && (
          <button onClick={() => setFilters({ status: '', priority: '', subject_id: '' })} style={{ ...selStyle, color: 'var(--text-3)', cursor: 'pointer' }}>✕ Сброс</button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="anim-scale" style={{ background: 'var(--bg-1)', border: '1px solid var(--border-2)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>{editId ? 'Редактировать' : 'Новая задача'}</span>
            <button className="icon-btn" onClick={() => setShowForm(false)}>✕</button>
          </div>
          {error && <p style={{ fontSize: '12px', color: 'var(--red)', marginBottom: '10px' }}>{error}</p>}
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="field-label">Название</label>
                <input className="input" type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Название задачи" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="field-label">Описание</label>
                <textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Необязательно" rows={2} />
              </div>
              {[
                { label: 'Приоритет', key: 'priority', opts: [['low','Низкий'],['medium','Средний'],['high','Высокий']] },
                { label: 'Статус', key: 'status', opts: [['todo','К выполнению'],['in_progress','В работе'],['done','Готово']] },
                { label: 'Дедлайн', key: 'due_date', type: 'date' },
                { label: 'Предмет', key: 'subject_id', subjects: true },
              ].map(f => (
                <div key={f.key}>
                  <label className="field-label">{f.label}</label>
                  {f.subjects ? (
                    <select className="input" value={form.subject_id || ''} onChange={e => setForm({ ...form, subject_id: e.target.value || null })}>
                      <option value="">Без предмета</option>
                      {subjects.map(s => <option key={s.ID} value={s.ID}>{s.name}</option>)}
                    </select>
                  ) : f.opts ? (
                    <select className="input" value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}>
                      {f.opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  ) : (
                    <input className="input" type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-primary" type="submit">{editId ? 'Сохранить' : 'Создать'}</button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </form>
        </div>
      )}

      {/* Task list */}
      {loading ? (
        <p style={{ color: 'var(--text-3)', fontSize: '13px' }}>Загрузка...</p>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-3)', fontSize: '13px' }}>Задач нет</div>
      ) : (
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
          {tasks.map((t, i) => {
            const subj = getSubject(t.subject_id)
            const overdue = isOverdue(t)
            return (
              <div key={t.ID} className={`anim d${Math.min(i + 1, 4)}`} style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                borderTop: i > 0 ? '1px solid var(--border)' : 'none',
                borderLeft: `2px solid ${overdue ? 'var(--red)' : t.priority === 'high' ? 'var(--red)' : t.priority === 'medium' ? 'var(--yellow)' : 'var(--green)'}`,
                transition: 'background 0.1s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {/* Left */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                    {subj && (
                      <span style={{ fontSize: '10px', fontWeight: 500, padding: '1px 6px', borderRadius: '99px', background: (subj.color || '#6366f1') + '18', color: subj.color || '#818cf8', border: `1px solid ${subj.color || '#6366f1'}30` }}>
                        {subj.name}
                      </span>
                    )}
                    {overdue && <span style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 600 }}>Просрочено</span>}
                  </div>
                  <p style={{ fontSize: '13px', color: t.status === 'done' ? 'var(--text-3)' : 'var(--text-1)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: t.status === 'done' ? 'line-through' : 'none' }}>
                    {t.title}
                  </p>
                  {t.due_date && <p style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '1px' }}>до {new Date(t.due_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</p>}
                </div>

                {/* Right */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <span className={`badge ${STATUS[t.status].cls}`}>{STATUS[t.status].label}</span>
                  <select value={t.status} onChange={e => handleStatus(t, e.target.value)} style={{ ...selStyle, fontSize: '11px', padding: '3px 6px' }}>
                    <option value="todo">К выполнению</option>
                    <option value="in_progress">В работе</option>
                    <option value="done">Готово</option>
                  </select>
                  <button className="icon-btn" onClick={() => openEdit(t)} title="Редактировать">✏</button>
                  <button className="icon-btn" onClick={() => handleDelete(t.ID)} title="Удалить" onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}>✕</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}