import React from 'react'
import '@/css/components/DayView.css'
import { addDays, formatISODate } from '@/utils/date'
import type { Task } from '@/types'

export type CalendarTask = Task & { color: string; categoryName: string }

type Props = {
  dayDate: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  tasks: CalendarTask[]
  onClickDayAddTask: (isoDate: string) => void
  onClickTask: (task: CalendarTask) => void
}

export default function DayView({ dayDate, onPrev, onNext, onToday, tasks, onClickDayAddTask, onClickTask }: Props) {
  const iso = formatISODate(dayDate)
  const dayTasks = tasks.filter((t) => t.date === iso)
  const title = dayDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="dayview">
      <div className="dayview__toolbar">
        <button className="dayview__toolbarBtn" onClick={onPrev}>
          ◀ Día anterior
        </button>
        <div className="dayview__toolbarCenter">
          <h2 className="text-lg font-semibold capitalize">{title}</h2>
          <button className="dayview__todayBtn" onClick={onToday}>
            Hoy
          </button>
        </div>
        <button className="dayview__toolbarBtn" onClick={onNext}>
          Día siguiente ▶
        </button>
      </div>

      <div className="dayview__addBtnWrap">
        <button
          className="dayview__addBtn"
          onClick={() => onClickDayAddTask(iso)}
        >
          + Tarea
        </button>
      </div>

      <div className="dayview__tasks">
        {dayTasks.length === 0 && (
          <div className="dayview__empty">
            No hay tareas para este día.
          </div>
        )}
        {dayTasks.map((t) => (
          <button
            key={t.id}
            className={`dayview__taskBtn ${t.completed ? 'dayview__taskBtn--completed' : ''}`}
            style={{ backgroundColor: t.color }}
            onClick={() => onClickTask(t)}
            title={`${t.title} — ${t.categoryName}`}
          >
            <span className="truncate font-medium">{t.title}</span>
            <span className="mt-0.5 text-xs text-white/80">{t.categoryName}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
