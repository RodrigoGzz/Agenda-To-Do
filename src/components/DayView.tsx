import React from 'react'
import { addDays, formatISODate } from '@/utils/date'
import type { Task } from '@/types'

export type CalendarTask = Task & { color: string; categoryName: string }

type Props = {
  dayDate: Date
  onPrev: () => void
  onNext: () => void
  tasks: CalendarTask[]
  onClickDayAddTask: (isoDate: string) => void
  onClickTask: (task: CalendarTask) => void
}

export default function DayView({ dayDate, onPrev, onNext, tasks, onClickDayAddTask, onClickTask }: Props) {
  const iso = formatISODate(dayDate)
  const dayTasks = tasks.filter((t) => t.date === iso)
  const title = dayDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" onClick={onPrev}>
          ◀ Día anterior
        </button>
        <h2 className="text-lg font-semibold capitalize">{title}</h2>
        <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" onClick={onNext}>
          Día siguiente ▶
        </button>
      </div>

      <div className="mb-3 flex justify-end">
        <button
          className="rounded bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200"
          onClick={() => onClickDayAddTask(iso)}
        >
          + Tarea
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {dayTasks.length === 0 && (
          <div className="rounded border border-dashed p-4 text-center text-sm text-gray-500">
            No hay tareas para este día.
          </div>
        )}
        {dayTasks.map((t) => (
          <button
            key={t.id}
            className="flex items-center justify-between rounded border px-3 py-2 text-left text-sm"
            onClick={() => onClickTask(t)}
            title={`${t.title} — ${t.categoryName}`}
          >
            <span className="truncate font-medium">{t.title}</span>
            <span className="ml-2 h-3 w-3 rounded" style={{ backgroundColor: t.color }} />
          </button>
        ))}
      </div>
    </div>
  )
}
