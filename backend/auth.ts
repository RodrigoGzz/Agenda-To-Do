// Authentication endpoints for Firebase
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from './firebaseClient'

export type UserRegistrationData = {
  name: string
  lastName: string
  email: string
  password: string
}

export type UserDocument = {
  user_id: string
  name: string
  lastName: string
  email: string
  password: string // Note: In production, never store plain passwords. Use Firebase Auth instead.
  created_at: any // serverTimestamp
}

export type LoginCredentials = {
  email: string
  password: string
}

export type AuthUser = {
  id: string
  name: string
  lastName: string
  email: string
}

// Register a new user in Firestore
export async function registerUser(userData: UserRegistrationData): Promise<string> {
  // Generate a unique user ID (in production, this would come from Firebase Auth)
  const userId = Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
  
  const userDoc: UserDocument = {
    user_id: userId,
    name: userData.name,
    lastName: userData.lastName,
    email: userData.email,
    password: userData.password, // WARNING: Plain text password (for demo only)
    created_at: serverTimestamp(),
  }

  const userRef = doc(db, 'users', userId)
  await setDoc(userRef, userDoc)
  
  return userId
}

// Login user by email and password
export async function loginUser(credentials: LoginCredentials): Promise<AuthUser> {
  const usersCollection = collection(db, 'users')
  const q = query(usersCollection, where('email', '==', credentials.email))
  const querySnapshot = await getDocs(q)
  
  if (querySnapshot.empty) {
    throw new Error('Usuario no encontrado')
  }
  
  const userDoc = querySnapshot.docs[0]
  const userData = userDoc.data() as UserDocument
  
  // Check password (in production, use proper password hashing)
  if (userData.password !== credentials.password) {
    throw new Error('Contraseña incorrecta')
  }
  
  return {
    id: userData.user_id,
    name: userData.name,
    lastName: userData.lastName,
    email: userData.email,
  }
}

// Check if email already exists (optional validation)
export async function checkEmailExists(email: string): Promise<boolean> {
  // Note: This would require a compound query on email field
  // For now, we'll skip this check to keep it simple
  return false
}
