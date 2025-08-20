import React, { useState } from 'react'
import type { Category } from '@/types'

type Props = {
  onSubmit: (data: Omit<Category, 'id'>) => void
}

export default function CategoryForm({ onSubmit }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState('#2563eb') // blue-600

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), color })
    setName('')
    setColor('#2563eb')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium">Nombre</label>
        <input
          className="w-full rounded-md border border-gray-300 p-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Trabajo"
          required
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Color</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-16 cursor-pointer rounded border border-gray-300 bg-white"
          />
          <span className="text-sm text-gray-600">{color}</span>
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
      >
        Crear categoría
      </button>
    </form>
  )
}
