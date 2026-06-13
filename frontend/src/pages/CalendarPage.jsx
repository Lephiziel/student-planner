import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import Layout from '../components/Layout'
import api from '../api/axios'

const STATUS_L   = { todo: 'К выполнению', in_progress: 'В работе', done: 'Готово' }
const PRIORITY_L = { low: 'Низкий', medium: 'Средний', high: 'Высокий' }
const PRIORITY_C = { low: 'var(--green)', medium: 'var(--yellow)', high: 'var(--red)' }

export default function CalendarPage() {
  const [events, setEvents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => { api.get('/subjects/').then(r => setSubjects(r.data.success || [])).catch(console.error) }, [])

  const fetchTasks = async (start, end) => {
    const res = await api.get('/tasks/', { params: { due_from: start.toISOString().split('T')[0], due_to: end.toISOString().split('T')[0] } })
    const tasks = res.data.success || []; const now = new Date()
    setEvents(tasks.filter(t => t.due_date).map(t => {
      const due = new Date(t.due_date); let color = '#a78bfa'
      if (t.status === 'done') color = '#3d3550'
      else if (due < now) color = '#f87171'
      else { const s = subjects.find(s => s.ID === t.subject_id); if (s?.color) color = s.color }
      return { id: String(t.ID), title: t.title, date: t.due_date.split('T')[0], backgroundColor: color, borderColor: color, extendedProps: { task: t } }
    }))
  }

  return (
    <Layout>
      <div style={{ marginBottom: '20px' }}>
        <p className="section-label">Расписание</p>
        <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.03em' }}>Календарь</h1>
      </div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '14px', flexWrap: 'wrap' }}>
        {[['#a78bfa','Активные'],['#f87171','Просрочено'],['#3d3550','Выполнено']].map(([c,l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '3px', background: c }}/><span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 500 }}>{l}</span>
          </div>
        ))}
      </div>
      <div className="calendar-card" style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px' }}>
        <FullCalendar plugins={[dayGridPlugin, interactionPlugin]} initialView="dayGridMonth" events={events} datesSet={i => fetchTasks(i.start, i.end)} eventClick={i => setSelected(i.event.extendedProps.task)} locale="ru" headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }} height="auto"/>
      </div>
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--scrim)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }} onClick={() => setSelected(null)}>
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border-accent)', borderRadius: '18px', padding: '24px', width: '100%', maxWidth: '380px', boxShadow: 'var(--shadow-overlay)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ flex: 1, paddingRight: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: PRIORITY_C[selected.priority], boxShadow: `0 0 8px ${PRIORITY_C[selected.priority]}90` }}/>
                  <span style={{ fontSize: '10px', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{PRIORITY_L[selected.priority]}</span>
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-1)', letterSpacing: '-0.02em', lineHeight: 1.3 }}>{selected.title}</h2>
              </div>
              <button className="icon-btn" onClick={() => setSelected(null)}>✕</button>
            </div>
            {selected.description && <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '16px', lineHeight: 1.6 }}>{selected.description}</p>}
            <div style={{ background: 'var(--bg-2)', borderRadius: '10px', overflow: 'hidden' }}>
              {[{ label: 'Статус', value: STATUS_L[selected.status] }, selected.due_date ? { label: 'Дедлайн', value: new Date(selected.due_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) } : null].filter(Boolean).map((item, i, arr) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-3)', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-1)', fontWeight: 600 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
