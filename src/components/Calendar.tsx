import React from 'react'
import { getMonthMatrix, formatISODate, addMonths } from '@/utils/date'
import type { Category, Task } from '@/types'

export type CalendarTask = Task & { color: string; categoryName: string }

type Props = {
  monthDate: Date
  onPrev: () => void
  onNext: () => void
  tasks: CalendarTask[]
  onClickDayAddTask: (isoDate: string) => void
  onClickTask: (task: CalendarTask) => void
}

export default function Calendar({ monthDate, onPrev, onNext, tasks, onClickDayAddTask, onClickTask }: Props) {
  const matrix = getMonthMatrix(monthDate)
  const month = monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const thisMonth = monthDate.getMonth()

  const tasksByDay = tasks.reduce<Record<string, CalendarTask[]>>((acc, t) => {
    (acc[t.date] ||= []).push(t)
    return acc
  }, {})

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" onClick={onPrev}>
          ◀ Mes anterior
        </button>
        <h2 className="text-lg font-semibold capitalize">{month}</h2>
        <button className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50" onClick={onNext}>
          Mes siguiente ▶
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-600">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
          <div key={d} className="p-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px rounded-lg bg-gray-200">
        {matrix.map((d, i) => {
          const iso = formatISODate(d)
          const isOtherMonth = d.getMonth() !== thisMonth
          const dayTasks = tasksByDay[iso] || []
          return (
            <div key={i} className={`min-h-[100px] bg-white p-1 ${isOtherMonth ? 'opacity-40' : ''}`}>
              <div className="mb-1 flex items-center justify-between">
                <div className="text-xs font-semibold">{d.getDate()}</div>
                <button
                  className="rounded bg-gray-100 px-1 text-[10px] text-gray-600 hover:bg-gray-200"
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
