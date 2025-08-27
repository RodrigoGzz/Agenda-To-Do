import React from 'react'
import { getMonthMatrix, formatISODate } from '@/utils/date'

type Props = {
  value?: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
}

function parseISODate(value: string) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function DatePicker({ value, onChange, label = 'Fecha', placeholder = 'Selecciona una fecha' }: Props) {
  const today = React.useMemo(() => {
    const t = new Date()
    t.setHours(0, 0, 0, 0)
    return t
  }, [])

  const [open, setOpen] = React.useState(false)
  const [monthDate, setMonthDate] = React.useState(() => (value ? parseISODate(value) : today))
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (value) setMonthDate(parseISODate(value))
  }, [value])

  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return
      if (!ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  const matrix = React.useMemo(() => getMonthMatrix(monthDate), [monthDate])
  const monthLabel = monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  const selected = value ? parseISODate(value) : undefined

  return (
    <div className="relative w-full" ref={ref}>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white p-2 text-left text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className={`truncate ${value ? 'text-gray-900' : 'text-gray-500'}`}>
          {value ? value : placeholder}
        </span>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-gray-500">
          <path fillRule="evenodd" d="M6.75 2.25a.75.75 0 0 1 .75.75V4.5h9V3a.75.75 0 0 1 1.5 0v1.5h.75A2.25 2.25 0 0 1 21 6.75v12A2.25 2.25 0 0 1 18.75 21H5.25A2.25 2.25 0 0 1 3 18.75v-12A2.25 2.25 0 0 1 5.25 4.5H6V3a.75.75 0 0 1 .75-.75Zm-1.5 6a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 .75.75v9a.75.75 0 0 1-.75.75h-12a.75.75 0 0 1-.75-.75v-9Z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div role="dialog" className="absolute z-20 mt-2 w-72 rounded-lg border border-gray-200 bg-white p-2 shadow-xl">
          <div className="mb-1 flex items-center justify-between px-1">
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              aria-label="Mes anterior"
            >
              ◀
            </button>
            <div className="text-sm font-semibold capitalize">{monthLabel}</div>
            <button
              type="button"
              className="rounded-md px-2 py-1 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setMonthDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              aria-label="Mes siguiente"
            >
              ▶
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 px-1 pb-1 text-center text-xs text-gray-500">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {matrix.map((d, i) => {
              const inMonth = d.getMonth() === monthDate.getMonth()
              const isToday = isSameDay(d, today)
              const isSelected = selected ? isSameDay(d, selected) : false
              return (
                <button
                  key={i}
                  type="button"
                  className={[
                    'h-9 rounded-md text-center text-sm hover:bg-blue-50',
                    inMonth ? '' : 'text-gray-400',
                    isSelected ? 'bg-blue-600 font-medium text-white hover:bg-blue-600' : '',
                    isToday ? 'ring-1 ring-blue-400' : '',
                  ].join(' ').trim()}
                  onClick={() => {
                    onChange(formatISODate(d))
                    setOpen(false)
                  }}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
          <div className="mt-2 flex items-center justify-between px-1">
            <button
              type="button"
              className="rounded-md bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100"
              onClick={() => {
                onChange(formatISODate(today))
                setMonthDate(today)
                setOpen(false)
              }}
            >
              Hoy
            </button>
            <button type="button" className="rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setOpen(false)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
