import React from 'react'
import '@/css/components/AgendaView.css'
import { addDays, formatISODate } from '@/utils/date'
import type { Task } from '@/types'

export type CalendarTask = Task & { color: string; categoryName: string }

type Props = {
  startDate: Date
  days?: number
  tasks: CalendarTask[]
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onChangeDays?: (days: number) => void
  onClickDayAddTask: (isoDate: string) => void
  onClickTask: (task: CalendarTask) => void
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function dayLabel(d: Date, today = new Date()) {
  const tomorrow = addDays(today, 1)
  if (isSameDay(d, today)) return `Hoy, ${d.toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })}`
  if (isSameDay(d, tomorrow)) return `Mañana, ${d.toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })}`
  return d.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function AgendaView({ startDate, days = 7, tasks, onPrev, onNext, onToday, onChangeDays, onClickDayAddTask, onClickTask }: Props) {
  const today = new Date()
  const listDays = Array.from({ length: days }, (_, i) => {
    const d = addDays(startDate, i)
    d.setHours(0, 0, 0, 0)
    return d
  })

  const tasksByDay = tasks.reduce<Record<string, CalendarTask[]>>((acc, t) => {
    (acc[t.date] ||= []).push(t)
    return acc
  }, {})

  return (
    <div className="agenda">
      <div className="agenda__toolbar">
        <div className="flex items-center gap-2">
          <button className="agenda__toolbarBtn" onClick={onPrev}>
            ◀ Anterior
          </button>
          <button className="agenda__toolbarBtn" onClick={onToday}>
            Hoy
          </button>
          <button className="agenda__toolbarBtn" onClick={onNext}>
            Siguiente ▶
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <label htmlFor="agenda-days" className="whitespace-nowrap">Mostrar:</label>
          <select
            id="agenda-days"
            className="agenda__select"
            value={days}
            onChange={(e) => onChangeDays?.(parseInt(e.target.value))}
          >
            <option value={3}>3 días</option>
            <option value={7}>7 días</option>
            <option value={14}>14 días</option>
            <option value={30}>30 días</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col">
        {listDays.map((d, idx) => {
          const iso = formatISODate(d)
          const dayTasks = (tasksByDay[iso] || []).slice().sort((a, b) => a.title.localeCompare(b.title))
          const label = dayLabel(d, today)
          return (
            <div key={idx} className="agenda__section">
              <div className="agenda__sectionHeader">
                <h3 className="text-base font-semibold capitalize">{label}</h3>
                <button
                  className="agenda__addBtn"
                  onClick={() => onClickDayAddTask(iso)}
                >
                  + Nueva tarea
                </button>
              </div>
              {dayTasks.length === 0 ? (
                <div className="agenda__empty">
                  Nada planificado todavía
                </div>
              ) : (
                <ul className="agenda__list">
                  {dayTasks.map((t) => (
                    <li key={t.id}>
                      <button
                        className={`agenda__taskBtn ${t.completed ? 'agenda__taskBtn--completed' : ''}`}
                        style={{ backgroundColor: t.color }}
                        onClick={() => onClickTask(t)}
                        title={`${t.title} — ${t.categoryName}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{t.title}</div>
                          <div className="mt-0.5 text-xs text-white/80">{t.categoryName}</div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
