import React from 'react'
import '@/css/components/CategoriesManager.css'
import type { Category, Task } from '@/types'
import CategoryForm from './CategoryForm'

type Props = {
  categories: Category[]
  tasks: Task[]
  onCreate: (data: Omit<Category, 'id'>) => void
  onDelete: (id: string) => void
}

export default function CategoriesManager({ categories, tasks, onCreate, onDelete }: Props) {
  const taskCountByCat = React.useMemo(() => {
    const m = new Map<string, number>()
    for (const t of tasks) m.set(t.categoryId, (m.get(t.categoryId) || 0) + 1)
    return m
  }, [tasks])

  const taskStatusByCat = React.useMemo(() => {
    const m = new Map<string, { total: number, completed: number }>()
    for (const t of tasks) {
      const categoryId = t.categoryId
      const current = m.get(categoryId) || { total: 0, completed: 0 }
      m.set(categoryId, {
        total: current.total + 1,
        completed: current.completed + (t.completed ? 1 : 0)
      })
    }
    return m
  }, [tasks])

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold">Tus categorías</h3>
        {categories.length === 0 ? (
          <div className="rounded border border-dashed p-4 text-sm text-gray-500">
            Aún no tienes categorías creadas.
          </div>
        ) : (
          <div className={categories.length > 4 ? 'max-h-64 overflow-y-auto pr-1' : ''}>
            <ul className="space-y-2">
              {categories.map((c) => {
              const count = taskCountByCat.get(c.id) || 0
              const status = taskStatusByCat.get(c.id) || { total: 0, completed: 0 }
              const allCompleted = status.total > 0 && status.completed === status.total
              const pending = Math.max(0, status.total - status.completed)
              const canDelete = count === 0 || allCompleted
              return (
                <li key={c.id} className="flex items-center justify-between rounded border px-3 py-2">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="h-4 w-4 rounded" style={{ backgroundColor: c.color }} />
                    <span className="truncate font-medium">{c.name}</span>
                    {count === 0 ? (
                      <span className="text-xs text-gray-500">0 tareas</span>
                    ) : allCompleted ? null : (
                      <span className="text-xs text-gray-500">
                        {pending} {pending === 1 ? 'pendiente' : 'pendientes'}
                      </span>
                    )}
                  </div>
                  <button
                    className={`rounded px-2 py-1 text-xs ${canDelete ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                    onClick={() => {
                      if (!canDelete) return
                      const ok = window.confirm('¿Eliminar esta categoría?')
                      if (ok) onDelete(c.id)
                    }}
                    disabled={!canDelete}
                    title={canDelete ? 'Eliminar categoría' : 'No se puede eliminar: hay tareas pendientes'}
                  >
                    Eliminar
                  </button>
                </li>
              )
              })}
            </ul>
          </div>
        )}
      </div>

      <div className="space-y-3">
  <h3 className="text-sm font-semibold">Crear nueva categoría</h3>
  <CategoryForm onSubmit={onCreate} usedColors={categories.map((c) => c.color)} />
      </div>
    </div>
  )
}
