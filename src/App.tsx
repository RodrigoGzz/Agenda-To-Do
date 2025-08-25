import React, { useMemo, useState, useEffect } from 'react'
import { useAuth } from './auth/AuthContext'
import { addMonths, formatISODate } from './utils/date'
import type { AppState, Category, Task } from './types'
import { loadState, saveState } from './storage'
import { listCategories, createCategory, deleteCategory, listTasks, createTask, updateTask, deleteTask } from '../backend/firestore'
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
  const { logout, user } = useAuth()
  const [state, setState] = useState<AppState>(initialState)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [tasksLoading, setTasksLoading] = useState(false)
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
  const [hideCompleted, setHideCompleted] = useState(false)

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState<{ open: boolean; date?: string }>({ open: false })
  const [showTaskDetail, setShowTaskDetail] = useState<Task | null>(null)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Load categories from Firebase when user is available
  useEffect(() => {
    if (user?.id) {
      loadCategories()
      loadTasks()
    }
  }, [user?.id])

  const loadCategories = async () => {
    if (!user?.id) return
    setCategoriesLoading(true)
    try {
      const categories = await listCategories(user.id)
      setState(s => ({ ...s, categories }))
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setCategoriesLoading(false)
    }
  }

  const loadTasks = async () => {
    if (!user?.id) return
    setTasksLoading(true)
    try {
      const tasks = await listTasks(user.id)
      setState(s => ({ ...s, tasks }))
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setTasksLoading(false)
    }
  }

  React.useEffect(() => {
    saveState(state)
  }, [state])

  // Close user menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showUserMenu])

  const calendarTasks = useMemo(() => {
    const catMap = new Map(state.categories.map((c) => [c.id, c]))
    return state.tasks.map((t) => {
      const cat = catMap.get(t.categoryId)
  const color = cat?.color || '#64748b'
      const categoryName = cat?.name || 'Sin categoría'
      return { ...t, color, categoryName }
    })
  }, [state])

  const tasksForViews = useMemo(() => {
    return hideCompleted ? calendarTasks.filter((t) => !t.completed) : calendarTasks
  }, [calendarTasks, hideCompleted])

  const handleAddCategory = async (data: Omit<Category, 'id'>) => {
    if (!user?.id) return
    try {
      const newCategory = await createCategory(user.id, data)
      setState((s) => ({ ...s, categories: [...s.categories, newCategory] }))
      setShowCategoryModal(false)
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Error al crear la categoría')
    }
  }

  const handleAddTask = async (data: Omit<Task, 'id'>) => {
    if (!user?.id) return
    try {
      const newTask = await createTask(user.id, { ...data, completed: false })
      setState((s) => ({ ...s, tasks: [...s.tasks, newTask] }))
      setShowTaskModal({ open: false })
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Error al crear la tarea')
    }
  }

  const handleUpdateTask = async (id: string, data: Omit<Task, 'id'>) => {
    if (!user?.id) return
    try {
      await updateTask(user.id, id, data)
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...data } : t)),
      }))
      setEditTask(null)
    } catch (error) {
      console.error('Error updating task:', error)
      alert('Error al actualizar la tarea')
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!user?.id) return
    try {
      await deleteTask(user.id, id)
      setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }))
      setShowTaskDetail(null)
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Error al eliminar la tarea')
    }
  }

  const toggleTaskCompleted = async (id: string) => {
    if (!user?.id) return
    const task = state.tasks.find(t => t.id === id)
    if (!task) return
    
    try {
      // Only update the completed field, not the entire task
      await updateTask(user.id, id, { completed: !task.completed })
      setState((s) => ({
        ...s,
        tasks: s.tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
      }))
    } catch (error) {
      console.error('Error toggling task completion:', error)
      alert('Error al actualizar el estado de la tarea')
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">To-Do Calendar</h1>
          
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">Ocultar completadas</span>
            <button
              type="button"
              onClick={() => setHideCompleted((v) => !v)}
              className={`${hideCompleted ? 'bg-emerald-600' : 'bg-gray-300'} relative inline-flex h-5 w-9 items-center rounded-full transition-colors`}
              aria-pressed={hideCompleted}
              aria-label="Ocultar tareas completadas"
            >
              <span
                className={`${hideCompleted ? 'translate-x-4' : 'translate-x-1'} inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform`}
              />
            </button>
          </div>
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
          <div className="relative">
            <button
              className="rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
              onClick={(e) => {
                e.stopPropagation()
                setShowUserMenu(!showUserMenu)
              }}
            >
              {user?.name} ▼
            </button>
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg z-10">
                <button
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                      logout()
                    }
                    setShowUserMenu(false)
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {(categoriesLoading || tasksLoading) && (
        <div className="mb-4 rounded-md bg-blue-50 p-3 text-center text-sm text-blue-700">
          Cargando datos...
        </div>
      )}

      {view === 'month' && (
        <Calendar
          monthDate={monthDate}
          onPrev={() => setMonthDate((d) => addMonths(d, -1))}
          onNext={() => setMonthDate((d) => addMonths(d, 1))}
          tasks={tasksForViews}
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
          tasks={tasksForViews}
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
          tasks={tasksForViews}
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
          tasks={tasksForViews}
          onClickDayAddTask={(date) => setShowTaskModal({ open: true, date })}
          onClickTask={(task) => setShowTaskDetail(task)}
        />
      )}

      <Modal open={showCategoryModal} title="Categorías" onClose={() => setShowCategoryModal(false)}>
        {categoriesLoading ? (
          <div className="py-4 text-center text-sm text-gray-600">
            Cargando categorías...
          </div>
        ) : (
          <CategoriesManager
            categories={state.categories}
            tasks={state.tasks}
            onCreate={handleAddCategory}
            onDelete={async (id) => {
              // bloquear si hay tareas asociadas (también está en UI)
              const hasTasks = state.tasks.some((t) => t.categoryId === id)
              if (hasTasks) {
                alert('No se puede eliminar: hay tareas asignadas a esta categoría.')
                return
              }
              if (!user?.id) return
              try {
                await deleteCategory(user.id, id)
                setState((s) => ({ ...s, categories: s.categories.filter((c) => c.id !== id) }))
              } catch (error) {
                console.error('Error deleting category:', error)
                alert('Error al eliminar la categoría')
              }
            }}
          />
        )}
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
              <h3 className="text-lg font-semibold">
                <span className={showTaskDetail.completed ? 'line-through opacity-70' : ''}>{showTaskDetail.title}</span>
              </h3>
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
            <div className="pt-1">
              <button
                className={
                  showTaskDetail.completed
                    ? 'inline-flex items-center gap-2 rounded-md border border-emerald-600 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50'
                    : 'inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700'
                }
                onClick={() => {
                  toggleTaskCompleted(showTaskDetail.id)
                  setShowTaskDetail((prev) => (prev ? { ...prev, completed: !prev.completed } : prev))
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L8.75 11.836l6.543-6.543a1 1 0 0 1 1.414 0Z"
                    clipRule="evenodd"
                  />
                </svg>
                {showTaskDetail.completed ? 'Marcar como pendiente' : 'Marcar como completada'}
              </button>
            </div>
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
            }}
            submitLabel="Guardar cambios"
            onSubmit={(data) => handleUpdateTask(editTask.id, data)}
          />
        )}
      </Modal>
    </div>
  )
}
