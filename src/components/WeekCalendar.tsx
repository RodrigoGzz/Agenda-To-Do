import React from 'react'
import { addDays, formatISODate, getWeekDays } from '@/utils/date'
import type { Task } from '@/types'

export type CalendarTask = Task & { color: string; categoryName: string }

type Props = {
  weekDate: Date
  onPrev: () => void
  onNext: () => void
  tasks: CalendarTask[]
  onClickDayAddTask: (isoDate: string) => void
  onClickTask: (task: CalendarTask) => void
}

export default function WeekCalendar({ weekDate, onPrev, onNext, tasks, onClickDayAddTask, onClickTask }: Props) {
  const days = getWeekDays(weekDate)
  const title = `${days[0].toLocaleDateString('es-ES')} - ${days[6].toLocaleDateString('es-ES')}`

  const tasksByDay = tasks.reduce<Record<string, CalendarTask[]>>((acc, t) => {
    (acc[t.date] ||= []).push(t)
    return acc
  }, {})

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" onClick={onPrev}>
          ◀ Semana anterior
        </button>
        <h2 className="text-lg font-semibold">{title}</h2>
        <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" onClick={onNext}>
          Semana siguiente ▶
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d, i) => {
          const iso = formatISODate(d)
          const dayTasks = tasksByDay[iso] || []
          return (
            <div key={i} className="min-h-[140px] rounded border bg-white p-2">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold">
                  {d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                </div>
                <button
                  className="rounded bg-gray-100 px-2 text-[11px] text-gray-700 hover:bg-gray-200"
                  onClick={() => onClickDayAddTask(iso)}
                >
                  + Tarea
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {dayTasks.map((t) => (
                  <button
                    key={t.id}
                    className={`truncate rounded px-2 py-1 text-left text-xs text-white ${t.completed ? 'opacity-70 line-through' : ''}`}
                    style={{ backgroundColor: t.color }}
                    onClick={() => onClickTask(t)}
                    title={`${t.title} — ${t.categoryName}`}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
