// Notes service for Firebase
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebaseClient'
import { ensureUser } from './firestore'

export type Note = {
  id: string
  title: string
  noteDescription: string
  user_id: string
  created_at: any
  pinned?: boolean
}

export type NoteData = Omit<Note, 'id' | 'user_id' | 'created_at'>

// List all notes for a user
export async function listNotes(userId: string): Promise<Note[]> {
  const col = collection(db, 'users', userId, 'note')
  const q = query(col, orderBy('created_at', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Note[]
}

// Create a new note
export async function createNote(userId: string, data: NoteData): Promise<Note> {
  await ensureUser(userId)
  const col = collection(db, 'users', userId, 'note')
  const ref = await addDoc(col, { 
    ...data, 
    user_id: userId, 
    pinned: data.pinned || false,
    created_at: serverTimestamp() 
  })
  return { id: ref.id, ...data, user_id: userId, pinned: data.pinned || false, created_at: new Date() }
}

// Update an existing note
export async function updateNote(
  userId: string, 
  noteId: string, 
  data: Partial<NoteData>
): Promise<void> {
  const ref = doc(db, 'users', userId, 'note', noteId)
  await updateDoc(ref, { ...data })
}

// Toggle pin status of a note
export async function togglePinNote(userId: string, noteId: string, pinned: boolean): Promise<void> {
  const ref = doc(db, 'users', userId, 'note', noteId)
  await updateDoc(ref, { pinned })
}

// Delete a note
export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const ref = doc(db, 'users', userId, 'note', noteId)
  await deleteDoc(ref)
}
