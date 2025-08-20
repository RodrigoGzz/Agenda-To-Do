import React, { useState } from 'react'
import type { Category } from '@/types'

type Props = {
  onSubmit: (data: Omit<Category, 'id'>) => void
  usedColors?: string[]
}

export default function CategoryForm({ onSubmit, usedColors }: Props) {
  const [name, setName] = useState('')
  const palette: { hex: string; label: string }[] = [
    // 600 series
    { hex: '#dc2626', label: 'Rojo 600' },
    { hex: '#ea580c', label: 'Naranja 600' },
    { hex: '#d97706', label: 'Ámbar 600' },
    { hex: '#ca8a04', label: 'Amarillo 600' },
    { hex: '#65a30d', label: 'Lima 600' },
    { hex: '#16a34a', label: 'Verde 600' },
    { hex: '#059669', label: 'Esmeralda 600' },
    { hex: '#0d9488', label: 'Teal 600' },
    { hex: '#0891b2', label: 'Cian 600' },
    { hex: '#0284c7', label: 'Celeste 600' },
    { hex: '#2563eb', label: 'Azul 600' },
    { hex: '#4f46e5', label: 'Índigo 600' },
    { hex: '#7c3aed', label: 'Violeta 600' },
    { hex: '#9333ea', label: 'Púrpura 600' },
    { hex: '#c026d3', label: 'Fucsia 600' },
    { hex: '#db2777', label: 'Rosa 600' },
    { hex: '#e11d48', label: 'Rosa fuerte 600' },
    { hex: '#475569', label: 'Pizarra 600' },
    { hex: '#4b5563', label: 'Gris 600' },
    { hex: '#525252', label: 'Neutral 600' },
    { hex: '#57534e', label: 'Piedra 600' },
    // 500 series
    { hex: '#ef4444', label: 'Rojo 500' },
    { hex: '#f97316', label: 'Naranja 500' },
    { hex: '#f59e0b', label: 'Ámbar 500' },
    { hex: '#eab308', label: 'Amarillo 500' },
    { hex: '#84cc16', label: 'Lima 500' },
    { hex: '#22c55e', label: 'Verde 500' },
    { hex: '#10b981', label: 'Esmeralda 500' },
    { hex: '#14b8a6', label: 'Teal 500' },
    { hex: '#06b6d4', label: 'Cian 500' },
    { hex: '#0ea5e9', label: 'Celeste 500' },
    { hex: '#3b82f6', label: 'Azul 500' },
    { hex: '#6366f1', label: 'Índigo 500' },
    { hex: '#8b5cf6', label: 'Violeta 500' },
    { hex: '#a855f7', label: 'Púrpura 500' },
    { hex: '#d946ef', label: 'Fucsia 500' },
    { hex: '#ec4899', label: 'Rosa 500' },
    { hex: '#f43f5e', label: 'Rosa fuerte 500' },
    { hex: '#78716c', label: 'Piedra 500' },
    { hex: '#64748b', label: 'Pizarra 500' },
  ]
  const usedSet = React.useMemo(() => new Set((usedColors ?? []).map((c) => c.toLowerCase())), [usedColors])
  const firstAvailable = React.useMemo(() => {
    const found = palette.find((p) => !usedSet.has(p.hex.toLowerCase()))
    return found?.hex ?? palette[10].hex
  }, [palette, usedSet])
  const [color, setColor] = useState<string>(firstAvailable) // Azul 600 o primer disponible
  const [open, setOpen] = useState(false)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!popoverRef.current) return
      if (e.target instanceof Node && !popoverRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    if (usedSet.has(color.toLowerCase())) {
      alert('Ese color ya está en uso por otra categoría. Elige otro.')
      return
    }
    onSubmit({ name: name.trim(), color })
    setName('')
    setColor(firstAvailable)
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
        <div className="relative inline-block" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label="Seleccionar color"
          >
            <span className="inline-block h-4 w-4 rounded-full border" style={{ backgroundColor: color }} />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-gray-500"
              aria-hidden
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.94l3.71-3.71a.75.75 0 1 1 1.06 1.06l-4.24 4.24a.75.75 0 0 1-1.06 0L5.21 8.29a.75.75 0 0 1 .02-1.08Z" clipRule="evenodd" />
            </svg>
          </button>
          {open && (
            <div className="absolute z-20 mt-2 w-[28rem] rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
              <div>
                <div className="grid grid-cols-10 gap-3">
                  {palette.map((p) => (
                    <button
                      key={p.hex}
                      type="button"
                      onClick={() => {
                        if (usedSet.has(p.hex.toLowerCase())) return
                        setColor(p.hex)
                        setOpen(false)
                      }}
                      className={`relative h-9 w-9 rounded-full border transition focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        color === p.hex ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      } ${usedSet.has(p.hex.toLowerCase()) ? 'cursor-not-allowed' : ''}`}
                      style={{ backgroundColor: p.hex, opacity: usedSet.has(p.hex.toLowerCase()) ? 0.35 : 1 }}
                      aria-label="Color"
                      aria-pressed={color === p.hex}
                      title={usedSet.has(p.hex.toLowerCase()) ? 'No disponible' : ''}
                      disabled={usedSet.has(p.hex.toLowerCase())}
                    >
                      {color === p.hex && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="white"
                          className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0l-3-3a1 1 0 1 1 1.414-1.414L8.75 11.836l6.543-6.543a1 1 0 0 1 1.414 0Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      {usedSet.has(p.hex.toLowerCase()) && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2"
                          aria-hidden
                        >
                          <line x1="5" y1="5" x2="15" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                          <line x1="15" y1="5" x2="5" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        {palette.every((p) => usedSet.has(p.hex.toLowerCase())) && (
          <p className="mt-2 text-xs text-amber-600">No hay colores disponibles. Elimina o edita alguna categoría para liberar colores.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={palette.every((p) => usedSet.has(p.hex.toLowerCase()))}
        className="w-full rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Crear categoría
      </button>
    </form>
  )
}
