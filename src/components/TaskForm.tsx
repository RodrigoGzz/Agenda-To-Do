import React, { useState } from 'react'
import '@/css/components/TaskForm.css'
import type { Category, Task } from '@/types'
import DatePicker from '@/components/DatePicker'

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

  React.useEffect(() => {
    setTitle(initial?.title ?? '')
    setDate(initial?.date ?? defaultDate ?? '')
  setCategoryId(initial?.categoryId ?? '')
    setDescription(initial?.description ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.title, initial?.date, initial?.categoryId, initial?.description, defaultDate, categories.length])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date || !categoryId) return
  onSubmit({ title: title.trim(), date, categoryId, description: description.trim() || undefined })
    setTitle('')
    setDescription('')
  }

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <div>
        <label className="task-form__label">Título</label>
        <input
          className="task-form__input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. Entregar informe"
          required
        />
      </div>

      <div className="task-form__grid">
        <div>
          <DatePicker
            value={date}
            onChange={setDate}
            label="Fecha"
            placeholder="Selecciona una fecha"
          />
        </div>

        <div>
          <label className="task-form__label">Categoría</label>
          <select
            className="task-form__select"
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
        <label className="task-form__label">Descripción (opcional)</label>
        <textarea
          className="task-form__textarea"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detalles de la tarea"
        />
      </div>
      <button type="submit" className="task-form__submit">
        {submitLabel ?? 'Agregar tarea'}
      </button>
    </form>
  )
}
