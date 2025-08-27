// Firestore data access layer for users/{userId}/categories and users/{userId}/tasks
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteField,
} from 'firebase/firestore'
import { db } from './firebaseClient'

// Types aligned with src/types.ts
export type ID = string
export type Category = { id: ID; name: string; color: string }
export type Task = {
  id: ID
  title: string
  date: string // ISO yyyy-mm-dd
  categoryId: ID
  description?: string
  completed?: boolean
}

// Helper to remove undefined fields (Firestore does not allow undefined values)
function pruneUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined)
  return Object.fromEntries(entries) as Partial<T>
}

// Ensure the user document exists (optional metadata)
export async function ensureUser(userId: string) {
  const userRef = doc(db, 'users', userId)
  const snap = await getDoc(userRef)
  if (!snap.exists()) {
    await setDoc(userRef, { user_id: userId, created_at: serverTimestamp() })
  }
  return userRef
}

// Categories
export async function listCategories(userId: string): Promise<Category[]> {
  const col = collection(db, 'users', userId, 'categories')
  const q = query(col, orderBy('name'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Category[]
}

export async function createCategory(userId: string, data: Omit<Category, 'id'>): Promise<Category> {
  await ensureUser(userId)
  const col = collection(db, 'users', userId, 'categories')
  const ref = await addDoc(col, { ...data, user_id: userId, created_at: serverTimestamp() })
  return { id: ref.id, ...data }
}

export async function deleteCategory(userId: string, categoryId: string): Promise<void> {
  const ref = doc(db, 'users', userId, 'categories', categoryId)
  await deleteDoc(ref)
}

// Tasks
export async function listTasks(userId: string): Promise<Task[]> {
  const col = collection(db, 'users', userId, 'tasks')
  const q = query(col, orderBy('date'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Task[]
}

export async function createTask(userId: string, data: Omit<Task, 'id'>): Promise<Task> {
  await ensureUser(userId)
  const col = collection(db, 'users', userId, 'tasks')
  const payload = pruneUndefined({ ...data, user_id: userId, created_at: serverTimestamp() })
  const ref = await addDoc(col, payload)
  return { id: ref.id, ...data }
}

export async function updateTask(
  userId: string,
  taskId: string,
  data: Partial<Omit<Task, 'id'>>
): Promise<void> {
  const ref = doc(db, 'users', userId, 'tasks', taskId)
  // Build payload: remove undefined normally, but if description is explicitly undefined,
  // we want to delete the field in Firestore so clearing the textarea removes it.
  const payload: Record<string, any> = pruneUndefined({ ...data })
  if ('description' in data && data.description === undefined) {
    payload.description = deleteField()
  }
  await updateDoc(ref, payload)
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const ref = doc(db, 'users', userId, 'tasks', taskId)
  await deleteDoc(ref)
}
