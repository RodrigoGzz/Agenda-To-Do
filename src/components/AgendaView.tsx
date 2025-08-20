import React from 'react'
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
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" onClick={onPrev}>
            ◀ Anterior
          </button>
          <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" onClick={onToday}>
            Hoy
          </button>
          <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" onClick={onNext}>
            Siguiente ▶
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <label htmlFor="agenda-days" className="whitespace-nowrap">Mostrar:</label>
          <select
            id="agenda-days"
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div key={idx} className="border-t first:border-t-0">
              <div className="flex items-center justify-between gap-2 py-3">
                <h3 className="text-base font-semibold capitalize">{label}</h3>
                <button
                  className="rounded bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200"
                  onClick={() => onClickDayAddTask(iso)}
                >
                  + Nueva tarea
                </button>
              </div>
              {dayTasks.length === 0 ? (
                <div className="mb-4 rounded border border-dashed p-4 text-center text-sm text-gray-500">
                  Nada planificado todavía
                </div>
              ) : (
                <ul className="mb-4 space-y-2">
                  {dayTasks.map((t) => (
                    <li key={t.id}>
                      <button
                        className="flex w-full items-center justify-between rounded border px-3 py-2 text-left text-sm hover:bg-gray-50"
                        onClick={() => onClickTask(t)}
                        title={`${t.title} — ${t.categoryName}`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">{t.title}</div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-600">
                            <span className="inline-flex items-center gap-1">
                              <span className="inline-block h-2 w-2 rounded" style={{ backgroundColor: t.color }} />
                              {t.categoryName}
                            </span>
                          </div>
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
