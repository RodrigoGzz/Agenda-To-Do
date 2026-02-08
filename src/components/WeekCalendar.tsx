import React from 'react'
import '@/css/components/WeekCalendar.css'
import { addDays, formatISODate, getWeekDays } from '@/utils/date'
import type { Task } from '@/types'

export type CalendarTask = Task & { color: string; categoryName: string }

type Props = {
  weekDate: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  tasks: CalendarTask[]
  onClickDayAddTask: (isoDate: string) => void
  onClickTask: (task: CalendarTask) => void
}

export default function WeekCalendar({ weekDate, onPrev, onNext, onToday, tasks, onClickDayAddTask, onClickTask }: Props) {
  const days = getWeekDays(weekDate)
  const title = `${days[0].toLocaleDateString('es-ES')} - ${days[6].toLocaleDateString('es-ES')}`
  const todayISO = formatISODate(new Date())

  const tasksByDay = tasks.reduce<Record<string, CalendarTask[]>>((acc, t) => {
    (acc[t.date] ||= []).push(t)
    return acc
  }, {})

  return (
    <div className="weekcal">
      <div className="weekcal__toolbar">
        <button className="weekcal__toolbarBtn" onClick={onPrev}>
          ◀ Semana anterior
        </button>
        <div className="weekcal__toolbarCenter">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="weekcal__todayBtn" onClick={onToday}>
            Hoy
          </button>
        </div>
        <button className="weekcal__toolbarBtn" onClick={onNext}>
          Semana siguiente ▶
        </button>
      </div>
      <div className="weekcal__grid">
        {days.map((d, i) => {
          const iso = formatISODate(d)
          const isToday = iso === todayISO
          const dayTasks = tasksByDay[iso] || []
          return (
            <div key={i} className={`weekcal__cell ${isToday ? 'weekcal__cell--today' : ''}`}>
              <div className="weekcal__cellHeader">
                <div className="text-sm font-semibold">
                  {d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                </div>
                <button
                  className="weekcal__addBtn"
                  onClick={() => onClickDayAddTask(iso)}
                >
                  + Tarea
                </button>
              </div>
              <div className="weekcal__tasks">
                {dayTasks.map((t) => (
                  <button
                    key={t.id}
                    className={`weekcal__taskBtn ${t.completed ? 'weekcal__taskBtn--completed' : ''}`}
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
