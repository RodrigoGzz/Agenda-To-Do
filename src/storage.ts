import type { AppState } from './types'

const LS_KEY = 'todo-calendar-app:v1'

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as AppState) : null
  } catch (e) {
    console.warn('Failed to load state', e)
    return null
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save state', e)
  }
}
