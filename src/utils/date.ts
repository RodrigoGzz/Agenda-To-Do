export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function addDays(date: Date, amount: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + amount)
  return d
}

export function formatISODate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7 // Monday=0
  d.setDate(d.getDate() - day)
  d.setHours(0, 0, 0, 0)
  return d
}

export function endOfWeek(date: Date) {
  const s = startOfWeek(date)
  const e = new Date(s)
  e.setDate(s.getDate() + 6)
  e.setHours(23, 59, 59, 999)
  return e
}

export function getWeekDays(date: Date) {
  const s = startOfWeek(date)
  return Array.from({ length: 7 }, (_, i) => addDays(s, i))
}

export function getMonthMatrix(current: Date) {
  // Returns a 6x7 grid (weeks x days) covering the month view
  const first = startOfMonth(current)
  const last = endOfMonth(current)
  const startDay = (first.getDay() + 6) % 7 // make Monday=0

  const daysInMonth = last.getDate()
  const totalCells = 42 // 6 weeks x 7 days
  const matrix: Date[] = []

  const gridStart = new Date(first)
  gridStart.setDate(first.getDate() - startDay)

  for (let i = 0; i < totalCells; i++) {
    const d = new Date(gridStart)
    d.setDate(gridStart.getDate() + i)
    matrix.push(d)
  }

  return matrix
}
