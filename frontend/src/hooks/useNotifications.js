import { useEffect } from 'react'
import api from '../api/axios'

const STORAGE_KEY = 'notified_tasks'
const CHECK_INTERVAL = 60 * 1000 // каждую минуту
const NOTIFY_BEFORE_MS = 24 * 60 * 60 * 1000 // за 24 часа

function getNotifiedIds() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function addNotifiedId(id) {
  const ids = getNotifiedIds()
  if (!ids.includes(id)) {
    ids.push(id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  }
}

async function checkAndNotify() {
  const token = localStorage.getItem('token')
  if (!token) return
  if (Notification.permission !== 'granted') return

  try {
    const res = await api.get('/tasks/')
    const tasks = res.data.success || []
    const now = new Date()
    const notifiedIds = getNotifiedIds()

    tasks.forEach(task => {
      if (!task.due_date) return
      if (task.status === 'done') return
      if (notifiedIds.includes(task.ID)) return

      const due = new Date(task.due_date)
      const diff = due - now

      if (diff > 0 && diff <= NOTIFY_BEFORE_MS) {
        const hoursLeft = Math.round(diff / (1000 * 60 * 60))
        const timeLabel = hoursLeft < 1 ? 'меньше часа' : `${hoursLeft} ч`

        new Notification(`Дедлайн скоро: ${task.title}`, {
          body: `до ${due.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} — осталось ${timeLabel}`,
          icon: '/favicon.svg',
        })

        addNotifiedId(task.ID)
      }
    })
  } catch {
    // тихо игнорируем ошибки
  }
}

export default function useNotifications() {
  useEffect(() => {
    if (!('Notification' in window)) return

    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        // первая проверка сразу
        checkAndNotify()
        // потом каждую минуту
        const interval = setInterval(checkAndNotify, CHECK_INTERVAL)
        return () => clearInterval(interval)
      }
    })
  }, [])
}