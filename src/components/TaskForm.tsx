import React, { useState } from 'react'
import type { Category, Task } from '@/types'

type Props = {
  categories: Category[]
  defaultDate?: string
  initial?: Partial<Omit<Task, 'id'>>
  submitLabel?: string
  onSubmit: (data: Omit<Task, 'id'>) => void
}

export default function TaskForm({ categories, defaultDate, initial, submitLabel, onSubmit }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? '')
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [customColor, setCustomColor] = useState<string>(initial?.customColor ?? '')

  React.useEffect(() => {
    setTitle(initial?.title ?? '')
    setDate(initial?.date ?? defaultDate ?? '')
  setCategoryId(initial?.categoryId ?? '')
    setDescription(initial?.description ?? '')
    setCustomColor(initial?.customColor ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.title, initial?.date, initial?.categoryId, initial?.description, initial?.customColor, defaultDate, categories.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date || !categoryId) return
    onSubmit({ title: title.trim(), date, categoryId, description: description.trim() || undefined, customColor: customColor || undefined })
    setTitle('')
    setDescription('')
    setCustomColor('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Título</label>
        <input
          className="w-full rounded-md border border-gray-300 p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Entregar informe"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Fecha</label>
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Categoría</label>
          <select
            className="w-full rounded-md border border-gray-300 p-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="" disabled>
              Selecciona una categoría
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Descripción (opcional)</label>
        <textarea
          className="w-full rounded-md border border-gray-300 p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalles de la tarea"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Color personalizado (opcional)</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={customColor || '#ffffff'}
            onChange={(e) => setCustomColor(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded border border-gray-300 bg-white"
          />
          <span className="text-sm text-gray-600">{customColor || 'Sin color'}</span>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        {submitLabel ?? 'Agregar tarea'}
      </button>
    </form>
  )
}
