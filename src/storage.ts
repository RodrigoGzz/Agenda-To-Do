import type { AppState } from './types'

// Persistence disabled: no LocalStorage, no DB yet.
export function loadState(): AppState | null {
	return null
}

export function saveState(_state: AppState) {
	// no-op
}

