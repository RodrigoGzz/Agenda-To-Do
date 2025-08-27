import React from 'react'
import '@/css/components/Calendar.css'
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
    <div className="calendar">
      <div className="calendar__toolbar">
        <button className="calendar__toolbarBtn" onClick={onPrev}>
          ◀ Mes anterior
        </button>
        <h2 className="text-lg font-semibold capitalize">{month}</h2>
        <button className="calendar__toolbarBtn" onClick={onNext}>
          Mes siguiente ▶
        </button>
      </div>
      <div className="calendar__daynames">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
          <div key={d} className="calendar__dayname">
            {d}
          </div>
        ))}
      </div>

      <div className="calendar__grid">
        {matrix.map((d, i) => {
          const iso = formatISODate(d)
          const isOtherMonth = d.getMonth() !== thisMonth
          const dayTasks = tasksByDay[iso] || []
          return (
            <div key={i} className={`calendar__cell ${isOtherMonth ? 'calendar__cell--other' : ''}`}>
              <div className="calendar__cellHeader">
                <div className="text-xs font-semibold">{d.getDate()}</div>
                <button
                  className="calendar__addBtn"
                  onClick={() => onClickDayAddTask(iso)}
                >
                  + Tarea
                </button>
              </div>
              <div className="calendar__tasks">
                {dayTasks.map((t) => (
                  <button
                    key={t.id}
                    className={`calendar__taskBtn ${t.completed ? 'calendar__taskBtn--completed' : ''}`}
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
