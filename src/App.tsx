import React, { useMemo, useState } from 'react'
import { addMonths, formatISODate } from './utils/date'
import type { AppState, Category, Task } from './types'
import { loadState, saveState } from './storage'
import Calendar from './components/Calendar'
import WeekCalendar from './components/WeekCalendar'
import DayView from './components/DayView'
import AgendaView from './components/AgendaView'
import Modal from './components/Modal'
import CategoryForm from './components/CategoryForm'
import CategoriesManager from './components/CategoriesManager'
import TaskForm from './components/TaskForm'

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

const initialState: AppState = loadState() ?? {
  categories: [
  ],
  tasks: [],
}

export default function App() {
  const [state, setState] = useState<AppState>(initialState)
  const [monthDate, setMonthDate] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [weekDate, setWeekDate] = useState(new Date())
  const [dayDate, setDayDate] = useState(new Date())
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month')
  const [agendaStart, setAgendaStart] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [agendaDays, setAgendaDays] = useState(7)

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState<{ open: boolean; date?: string }>({ open: false })
  const [showTaskDetail, setShowTaskDetail] = useState<Task | null>(null)
  const [editTask, setEditTask] = useState<Task | null>(null)

  React.useEffect(() => {
    saveState(state)
  }, [state])

  const calendarTasks = useMemo(() => {
    const catMap = new Map(state.categories.map((c) => [c.id, c]))
    return state.tasks.map((t) => {
      const cat = catMap.get(t.categoryId)
      const color = t.customColor || cat?.color || '#64748b'
      const categoryName = cat?.name || 'Sin categoría'
      return { ...t, color, categoryName }
    })
  }, [state])

  const handleAddCategory = (data: Omit<Category, 'id'>) => {
    setState((s) => ({ ...s, categories: [...s.categories, { ...data, id: uid() }] }))
    setShowCategoryModal(false)
  }

  const handleAddTask = (data: Omit<Task, 'id'>) => {
    setState((s) => ({ ...s, tasks: [...s.tasks, { ...data, id: uid() }] }))
    setShowTaskModal({ open: false })
  }

  const handleUpdateTask = (id: string, data: Omit<Task, 'id'>) => {
    setState((s) => ({
      ...s,
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
    }))
    setEditTask(null)
  }

  const handleDeleteTask = (id: string) => {
    setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }))
    setShowTaskDetail(null)
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">To-Do Calendar</h1>
        <div className="flex items-center gap-2">
          <div className="mr-2 inline-flex overflow-hidden rounded-md border">
            <button
              className={`px-3 py-2 text-sm ${view === 'month' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'}`}
              onClick={() => setView('month')}
            >
              Mes
            </button>
            <button
              className={`px-3 py-2 text-sm ${view === 'week' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'}`}
              onClick={() => setView('week')}
            >
              Semana
            </button>
            <button
              className={`px-3 py-2 text-sm ${view === 'day' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'}`}
              onClick={() => setView('day')}
            >
              Día
            </button>
            <button
              className={`px-3 py-2 text-sm ${view === 'agenda' ? 'bg-gray-900 text-white' : 'bg-white hover:bg-gray-50'}`}
              onClick={() => setView('agenda')}
            >
              Agenda
            </button>
          </div>
          <button
            className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            onClick={() => setShowCategoryModal(true)}
          >
            Categorías
          </button>
          <button
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            onClick={() => setShowTaskModal({ open: true, date: formatISODate(new Date()) })}
          >
            + Agregar tarea
          </button>
        </div>
      </header>

      {view === 'month' && (
        <Calendar
          monthDate={monthDate}
          onPrev={() => setMonthDate((d) => addMonths(d, -1))}
          onNext={() => setMonthDate((d) => addMonths(d, 1))}
          tasks={calendarTasks}
          onClickDayAddTask={(date) => setShowTaskModal({ open: true, date })}
          onClickTask={(task) => {
            setShowTaskDetail(task)
            setDayDate(new Date(task.date))
          }}
        />
      )}
      {view === 'agenda' && (
        <AgendaView
          startDate={agendaStart}
          days={agendaDays}
          tasks={calendarTasks}
          onPrev={() => setAgendaStart((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - agendaDays))}
          onNext={() => setAgendaStart((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + agendaDays))}
          onToday={() => setAgendaStart(() => {
            const t = new Date()
            t.setHours(0, 0, 0, 0)
            return t
          })}
          onChangeDays={(n) => {
            setAgendaDays(n)
          }}
          onClickDayAddTask={(date) => setShowTaskModal({ open: true, date })}
          onClickTask={(task) => {
            setShowTaskDetail(task)
            setDayDate(new Date(task.date))
          }}
        />
      )}
      {view === 'week' && (
        <WeekCalendar
          weekDate={weekDate}
          onPrev={() => setWeekDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7))}
          onNext={() => setWeekDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7))}
          tasks={calendarTasks}
          onClickDayAddTask={(date) => setShowTaskModal({ open: true, date })}
          onClickTask={(task) => {
            setShowTaskDetail(task)
            setDayDate(new Date(task.date))
          }}
        />
      )}
      {view === 'day' && (
        <DayView
          dayDate={dayDate}
          onPrev={() => setDayDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1))}
          onNext={() => setDayDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))}
          tasks={calendarTasks}
          onClickDayAddTask={(date) => setShowTaskModal({ open: true, date })}
          onClickTask={(task) => setShowTaskDetail(task)}
        />
      )}

      <Modal open={showCategoryModal} title="Categorías" onClose={() => setShowCategoryModal(false)}>
        <CategoriesManager
          categories={state.categories}
          tasks={state.tasks}
          onCreate={handleAddCategory}
          onDelete={(id) => {
            // bloquear si hay tareas asociadas (también está en UI)
            const hasTasks = state.tasks.some((t) => t.categoryId === id)
            if (hasTasks) {
              alert('No se puede eliminar: hay tareas asignadas a esta categoría.')
              return
            }
            setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }))
          }}
        />
      </Modal>

      <Modal open={showTaskModal.open} title="Nueva tarea" onClose={() => setShowTaskModal({ open: false })}>
        <TaskForm categories={state.categories} defaultDate={showTaskModal.date} onSubmit={handleAddTask} />
        {state.categories.length === 0 && (
          <p className="mt-2 text-xs text-amber-600">
            No hay categorías todavía. Crea una primero para poder agregar tareas.
          </p>
        )}
      </Modal>

      <Modal open={!!showTaskDetail} title="Detalle de tarea" onClose={() => setShowTaskDetail(null)}>
        {showTaskDetail && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{showTaskDetail.title}</h3>
              <span
                className="badge text-white"
                style={{ backgroundColor: calendarTasks.find((t) => t.id === showTaskDetail.id)?.color }}
              >
                {calendarTasks.find((t) => t.id === showTaskDetail.id)?.categoryName}
              </span>
            </div>
            <div className="text-sm text-gray-600">Fecha: {showTaskDetail.date}</div>
            {showTaskDetail.description && (
              <p className="whitespace-pre-wrap text-sm">{showTaskDetail.description}</p>
            )}
            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                onClick={() => {
                  setEditTask(showTaskDetail)
                  setShowTaskDetail(null)
                }}
              >
                Editar
              </button>
              <button
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                onClick={() => {
                  const ok = window.confirm('¿Eliminar esta tarea? Esta acción no se puede deshacer.')
                  if (ok) handleDeleteTask(showTaskDetail.id)
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!editTask} title="Editar tarea" onClose={() => setEditTask(null)}>
        {editTask && (
          <TaskForm
            categories={state.categories}
            initial={{
              title: editTask.title,
              date: editTask.date,
              categoryId: editTask.categoryId,
              description: editTask.description,
              customColor: editTask.customColor,
            }}
            submitLabel="Guardar cambios"
            onSubmit={(data) => handleUpdateTask(editTask.id, data)}
          />
        )}
      </Modal>
    </div>
  )
}
