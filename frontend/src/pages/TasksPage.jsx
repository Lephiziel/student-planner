import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import api from '../api/axios'

const EMPTY = { title: '', description: '', priority: 'medium', status: 'todo', due_date: '', subject_id: null }
const PRIORITY = { low: { label: 'Низкий', cls: 'badge-green', dot: 'var(--green)' }, medium: { label: 'Средний', cls: 'badge-yellow', dot: 'var(--yellow)' }, high: { label: 'Высокий', cls: 'badge-red', dot: 'var(--red)' } }
const STATUS = { todo: { label: 'К выполнению', cls: 'badge-gray' }, in_progress: { label: 'В работе', cls: 'badge-yellow' }, done: { label: 'Готово', cls: 'badge-green' } }
const selSt = { background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text-2)', fontSize: '12px', padding: '5px 8px', borderRadius: '7px', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', WebkitAppearance: 'none', appearance: 'none' }

export default function TasksPage() {
  const [tasks, setTasks] = useState([])
  const [subjects, setSubjects] = useState([])
  const [grades, setGrades] = useState({})
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ status: '', priority: '', subject_id: '' })
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' })
  const [gradeTaskId, setGradeTaskId] = useState(null)
  const [gradeEditId, setGradeEditId] = useState(null)
  const [gradeError, setGradeError] = useState('')

  const fetchTasks = async () => {
    const params = {}
    if (filters.status) params.status = filters.status
    if (filters.priority) params.priority = filters.priority
    if (filters.subject_id) params.subject_id = filters.subject_id
    if (search) params.search = search
    const res = await api.get('/tasks/', { params })
    const tl = res.data.success || []
    setTasks(tl); setLoading(false)
    const gm = {}
    await Promise.all(tl.map(async t => { try { const r = await api.get(`/grades/?task_id=${t.ID}`); gm[t.ID] = r.data.success || [] } catch { gm[t.ID] = [] } }))
    setGrades(gm)
  }

  useEffect(() => { api.get('/subjects/').then(r => setSubjects(r.data.success || [])) }, [])
  useEffect(() => { const t = setTimeout(() => setSearch(searchInput), 400); return () => clearTimeout(t) }, [searchInput])
  useEffect(() => { fetchTasks().catch(console.error) }, [filters, search])

  const openCreate = () => { setForm(EMPTY); setEditId(null); setShowForm(true); setError('') }
  const openEdit = t => { setForm({ title: t.title, description: t.description || '', priority: t.priority, status: t.status, due_date: t.due_date ? t.due_date.split('T')[0] : '', subject_id: t.subject_id || null }); setEditId(t.ID); setShowForm(true); setError('') }
  const handleSubmit = async e => {
    e.preventDefault(); setError('')
    const payload = { ...form, due_date: form.due_date ? new Date(form.due_date).toISOString() : null, subject_id: form.subject_id ? Number(form.subject_id) : null }
    try { editId ? await api.put(`/tasks/${editId}`, payload) : await api.post('/tasks/', payload); setShowForm(false); fetchTasks() }
    catch (err) { setError(err.response?.data?.error || 'Ошибка') }
  }
  const handleDelete = async id => { if (!confirm('Удалить задачу?')) return; await api.delete(`/tasks/${id}`); fetchTasks() }
  const handleStatus = async (t, s) => { await api.patch(`/tasks/${t.ID}/status`, { status: s }); fetchTasks() }
  const getSubject = id => subjects.find(s => s.ID === id)
  const isOverdue = t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
  const openGradeForm = tid => { const ex = grades[tid]?.[0]; if (ex) { setGradeForm({ score: ex.score, feedback: ex.feedback || '' }); setGradeEditId(ex.ID) } else { setGradeForm({ score: '', feedback: '' }); setGradeEditId(null) }; setGradeTaskId(tid); setGradeError('') }
  const closeGradeForm = () => { setGradeTaskId(null); setGradeEditId(null); setGradeForm({ score: '', feedback: '' }); setGradeError('') }
  const handleGradeSubmit = async e => { e.preventDefault(); setGradeError(''); try { const p = { task_id: gradeTaskId, score: Number(gradeForm.score), feedback: gradeForm.feedback }; gradeEditId ? await api.put(`/grades/${gradeEditId}`, p) : await api.post('/grades/', p); closeGradeForm(); fetchTasks() } catch (err) { setGradeError(err.response?.data?.error || 'Ошибка') } }
  const handleGradeDelete = async gid => { if (!confirm('Удалить самооценку?')) return; await api.delete(`/grades/${gid}`); closeGradeForm(); fetchTasks() }
  const renderStars = s => <span style={{ fontSize: '12px', color: 'var(--yellow)' }}>{'★'.repeat(Math.floor(s))}{s%1>=0.5?'½':''}<span style={{ color: 'var(--text-3)', marginLeft: '3px', fontSize: '11px' }}>{s}</span></span>
  const hasFilters = !!(filters.status || filters.priority || filters.subject_id || search)

  return (
    <Layout>
      <div className="page-header">
        <div><p className="section-label">Планирование</p><h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>Задачи <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-3)' }}>{tasks.length}</span></h1></div>
        <button className="btn btn-primary" onClick={openCreate}>+ Новая задача</button>
      </div>

      <div style={{ marginBottom: '10px' }}><input className="input" type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Поиск задач…" style={{ maxWidth: '320px' }}/></div>

      <div className="filters-row">
        <select style={selSt} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><option value="">Статус</option><option value="todo">К выполнению</option><option value="in_progress">В работе</option><option value="done">Готово</option></select>
        <select style={selSt} value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}><option value="">Приоритет</option><option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option></select>
        <select style={selSt} value={filters.subject_id} onChange={e => setFilters({ ...filters, subject_id: e.target.value })}><option value="">Предмет</option>{subjects.map(s => <option key={s.ID} value={s.ID}>{s.name}</option>)}</select>
        {hasFilters && <button onClick={() => { setFilters({ status: '', priority: '', subject_id: '' }); setSearchInput('') }} style={{ ...selSt, color: 'var(--text-3)' }}>✕ Сброс</button>}
      </div>

      {showForm && (
        <div className="anim-scale" style={{ background: 'var(--bg-1)', border: '1px solid var(--border-accent)', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}><span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-1)' }}>{editId ? 'Редактировать задачу' : 'Новая задача'}</span><button className="icon-btn" onClick={() => setShowForm(false)}>✕</button></div>
          {error && <p style={{ fontSize: '12px', color: 'var(--red)', marginBottom: '12px' }}>{error}</p>}
          <form onSubmit={handleSubmit}><div className="form-grid" style={{ marginBottom: '12px' }}>
            <div style={{ gridColumn: '1/-1' }}><label className="field-label">Название</label><input className="input" type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Название задачи"/></div>
            <div style={{ gridColumn: '1/-1' }}><label className="field-label">Описание</label><textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Необязательно" rows={2}/></div>
            <div><label className="field-label">Приоритет</label><select className="input" value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="low">Низкий</option><option value="medium">Средний</option><option value="high">Высокий</option></select></div>
            <div><label className="field-label">Статус</label><select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="todo">К выполнению</option><option value="in_progress">В работе</option><option value="done">Готово</option></select></div>
            <div><label className="field-label">Дедлайн</label><input className="input" type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}/></div>
            <div><label className="field-label">Предмет</label><select className="input" value={form.subject_id || ''} onChange={e => setForm({ ...form, subject_id: e.target.value || null })}><option value="">Без предмета</option>{subjects.map(s => <option key={s.ID} value={s.ID}>{s.name}</option>)}</select></div>
          </div><div style={{ display: 'flex', gap: '8px' }}><button className="btn btn-primary" type="submit">{editId ? 'Сохранить' : 'Создать'}</button><button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>Отмена</button></div></form>
        </div>
      )}

      {loading ? <p style={{ color: 'var(--text-3)', fontSize: '13px' }}>Загрузка...</p>
      : tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', fontSize: '26px' }}>{hasFilters ? '🔍' : '✦'}</div>
          <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-2)', marginBottom: '6px' }}>{hasFilters ? 'Ничего не найдено' : 'Пока нет задач'}</p>
          <p style={{ fontSize: '13px', color: 'var(--text-3)', lineHeight: 1.6, maxWidth: '260px', margin: '0 auto 20px' }}>{hasFilters ? 'Попробуйте изменить фильтры' : 'Создайте первую задачу, чтобы начать'}</p>
          {!hasFilters && <button className="btn btn-primary" onClick={openCreate}>+ Создать задачу</button>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {tasks.map((t, i) => {
            const subj = getSubject(t.subject_id); const ov = isOverdue(t); const tg = grades[t.ID] || []; const hg = tg.length > 0; const go = gradeTaskId === t.ID
            return (
              <div key={t.ID} className={`anim d${Math.min(i+1,4)}`}>
                <div className="task-row" style={{ background: 'var(--bg-1)', border: `1px solid ${go?'var(--border-accent)':'var(--border)'}`, borderLeft: `3px solid ${ov?'var(--red)':PRIORITY[t.priority].dot}`, borderRadius: go?'12px 12px 0 0':'12px', transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (!go) e.currentTarget.style.background='var(--bg-2)' }}
                  onMouseLeave={e => { if (!go) e.currentTarget.style.background='var(--bg-1)' }}>
                  <div className="task-row-info">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                      {subj && <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: '99px', background: (subj.color||'#a78bfa')+'1a', color: subj.color||'var(--accent)', border: `1px solid ${subj.color||'#a78bfa'}33` }}>{subj.name}</span>}
                      {ov && <span style={{ fontSize: '10px', color: 'var(--red)', fontWeight: 700 }}>Просрочено</span>}
                      {hg && renderStars(tg[0].score)}
                    </div>
                    <p style={{ fontSize: '13px', color: t.status==='done'?'var(--text-3)':'var(--text-1)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: t.status==='done'?'line-through':'none' }}>{t.title}</p>
                    {t.due_date && <p style={{ fontSize: '11px', color: ov?'var(--red)':'var(--text-3)', marginTop: '2px', fontWeight: ov?700:400 }}>до {new Date(t.due_date).toLocaleDateString('ru-RU',{day:'numeric',month:'short'})}</p>}
                  </div>
                  <div className="task-row-actions">
                    <span className={`badge ${STATUS[t.status].cls}`}>{STATUS[t.status].label}</span>
                    <select value={t.status} onChange={e => handleStatus(t, e.target.value)} style={{ ...selSt, fontSize: '11px', padding: '4px 7px' }}><option value="todo">К выполнению</option><option value="in_progress">В работе</option><option value="done">Готово</option></select>
                    <button className="icon-btn" onClick={() => go?closeGradeForm():openGradeForm(t.ID)} style={{ color: hg?'var(--yellow)':'var(--text-3)', fontSize: '14px' }} onMouseEnter={e=>e.currentTarget.style.color='var(--yellow)'} onMouseLeave={e=>e.currentTarget.style.color=hg?'var(--yellow)':'var(--text-3)'}>★</button>
                    <button className="icon-btn" onClick={() => openEdit(t)}>✏</button>
                    <button className="icon-btn" onClick={() => handleDelete(t.ID)} onMouseEnter={e=>e.currentTarget.style.color='var(--red)'} onMouseLeave={e=>e.currentTarget.style.color='var(--text-3)'}>✕</button>
                  </div>
                </div>
                {go && (
                  <div className="anim-scale" style={{ background: 'var(--bg-2)', border: '1px solid var(--border-accent)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}><span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-2)' }}>{gradeEditId?'Редактировать самооценку':'Добавить самооценку'}</span>{hg&&<button onClick={() => handleGradeDelete(tg[0].ID)} style={{ fontSize: '11px', color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Удалить</button>}</div>
                    {gradeError && <p style={{ fontSize: '12px', color: 'var(--red)', marginBottom: '10px' }}>{gradeError}</p>}
                    <form onSubmit={handleGradeSubmit}><div className="grade-form-grid" style={{ gap: '10px', marginBottom: '12px' }}><div><label className="field-label">Оценка (1–5)</label><input className="input" type="number" min="1" max="5" step="0.5" value={gradeForm.score} onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })} required placeholder="4.5"/></div><div><label className="field-label">Комментарий</label><input className="input" type="text" value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} placeholder="Необязательно"/></div></div>
                    <div style={{ display: 'flex', gap: '8px' }}><button className="btn btn-primary" type="submit" style={{ fontSize: '12px', padding: '6px 14px' }}>{gradeEditId?'Сохранить':'Добавить'}</button><button className="btn btn-secondary" type="button" onClick={closeGradeForm} style={{ fontSize: '12px', padding: '6px 14px' }}>Отмена</button></div></form>
                    {hg&&tg[0].feedback&&<div style={{ marginTop: '12px', padding: '8px 12px', background: 'var(--bg-3)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-2)', borderLeft: '2px solid var(--accent)' }}>💬 {tg[0].feedback}</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
