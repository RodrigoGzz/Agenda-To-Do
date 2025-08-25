import type { AppState } from './types'

// Persistence disabled: no LocalStorage, no DB yet.
export function loadState(): AppState | null {
	return null
}

export function saveState(_state: AppState) {
	// no-op
}

// User preferences persistence
type UserPreferences = {
	hideCompleted: boolean
	view: 'month' | 'week' | 'day' | 'agenda'
}

const PREFERENCES_KEY = 'todo-user-preferences'

export function loadUserPreferences(): UserPreferences {
	try {
		const stored = localStorage.getItem(PREFERENCES_KEY)
		if (stored) {
			const parsed = JSON.parse(stored)
			return {
				hideCompleted: parsed.hideCompleted ?? false,
				view: parsed.view ?? 'month'
			}
		}
	} catch (error) {
		console.warn('Error loading user preferences:', error)
	}
	
	// Default preferences
	return {
		hideCompleted: false,
		view: 'month'
	}
}

export function saveUserPreferences(preferences: UserPreferences) {
	try {
		localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences))
	} catch (error) {
		console.warn('Error saving user preferences:', error)
	}
}

