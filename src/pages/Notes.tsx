import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { listNotes, createNote, updateNote, deleteNote, togglePinNote, type Note, type NoteData } from '../../backend/notes'

export default function NotesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  // Function to detect and extract copyable text patterns
  const extractCopyableText = (text: string) => {
    // Detect text in [copy:name|text] or [copy:text] format
    const copyPattern = /\[copy:(.*?)\]/g
    
    const matches: { text: string, displayName: string, pattern: string }[] = []
    let match
    while ((match = copyPattern.exec(text)) !== null) {
      const content = match[1] // Content inside [copy:...]
      
      // Check if it has the format "name|text"
      if (content.includes('|')) {
        const [displayName, actualText] = content.split('|', 2)
        matches.push({
          text: actualText.trim(), // Text to copy
          displayName: displayName.trim(), // Name to display
          pattern: match[0] // The full match including [copy:...]
        })
      } else {
        // Simple format [copy:text]
        matches.push({
          text: content.trim(), // Text to copy and display
          displayName: content.trim(), // Same as text
          pattern: match[0] // The full match including [copy:...]
        })
      }
    }
    return matches
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Texto copiado al portapapeles')
    } catch (err) {
      console.error('Error copying text: ', err)
      alert('Error al copiar el texto')
    }
  }

  // Function to clean the display text by removing [copy:...] markers
  const cleanDisplayText = (text: string) => {
    return text.replace(/\[copy:(.*?)\]/g, (match, content) => {
      // If content has format "name|text", show the actual text to copy
      if (content.includes('|')) {
        const [, actualText] = content.split('|', 2)
        return actualText.trim()
      }
      // If simple format, show the content
      return content.trim()
    })
  }

  useEffect(() => {
    if (user?.id) {
      loadNotes()
    }
  }, [user?.id])

  const loadNotes = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const userNotes = await listNotes(user.id)
      setNotes(userNotes)
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNote = async (data: NoteData) => {
    if (!user?.id) return
    try {
      console.log('Creating note with data:', data, 'for user:', user.id)
      const newNote = await createNote(user.id, data)
      console.log('Note created successfully:', newNote)
      setNotes(prev => [newNote, ...prev])
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating note:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        userId: user?.id,
        data
      })
      alert(`Error al crear la nota: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  const handleUpdateNote = async (noteId: string, data: Partial<NoteData>) => {
    if (!user?.id) return
    try {
      await updateNote(user.id, noteId, data)
      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, ...data } : note
      ))
      setEditingNote(null)
    } catch (error) {
      console.error('Error updating note:', error)
      alert('Error al actualizar la nota')
    }
  }

  const handleTogglePin = async (noteId: string, currentPinned: boolean) => {
    if (!user?.id) return
    try {
      await togglePinNote(user.id, noteId, !currentPinned)
      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, pinned: !currentPinned } : note
      ))
    } catch (error) {
      console.error('Error toggling pin:', error)
      alert('Error al fijar/desfijar la nota')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!user?.id) return
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta nota?')) return
    
    try {
      await deleteNote(user.id, noteId)
      setNotes(prev => prev.filter(note => note.id !== noteId))
    } catch (error) {
      console.error('Error deleting note:', error)
      alert('Error al eliminar la nota')
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-4">
        <div className="text-center py-8">
          <p className="text-gray-600">Cargando notas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Calendario
          </Link>
          <h1 className="text-2xl font-bold">Mis Notas</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Nueva Nota
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No tienes notas aún</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-blue-600 hover:underline"
          >
            Crear tu primera nota
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {notes
            .sort((a, b) => {
              // First sort by pinned status (pinned notes first)
              if (a.pinned && !b.pinned) return -1
              if (!a.pinned && b.pinned) return 1
              // Then sort by creation date (newest first)
              const aDate = a.created_at?.toDate?.() || new Date(0)
              const bDate = b.created_at?.toDate?.() || new Date(0)
              return bDate.getTime() - aDate.getTime()
            })
            .map(note => {
            const copyableItems = extractCopyableText(note.noteDescription)
            return (
              <div key={note.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm min-h-[200px]">
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="font-medium text-gray-900 text-lg">{note.title}</h3>
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => handleTogglePin(note.id, note.pinned || false)}
                      className={`${
                        note.pinned 
                          ? 'text-blue-600 hover:text-blue-700' 
                          : 'text-gray-400 hover:text-blue-600'
                      }`}
                      title={note.pinned ? 'Desfijar nota' : 'Fijar nota'}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingNote(note)}
                      className="text-gray-400 hover:text-blue-600"
                      title="Editar"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-gray-400 hover:text-red-600"
                      title="Eliminar"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="mb-4 flex-1">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {cleanDisplayText(note.noteDescription)}
                  </p>
                </div>

                {copyableItems.length > 0 && (
                  <div className="mb-4 border-t pt-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Texto copiable:</p>
                    <div className="flex flex-wrap gap-2">
                      {copyableItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => copyToClipboard(item.text)}
                          className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700 hover:bg-blue-100 hover:text-blue-700"
                          title={`Copiar: ${item.text}`}
                        >
                          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L14.586 13H19v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586V9a1 1 0 00-1-1H8a1 1 0 00-1 1v2.586l.293-.293a1 1 0 011.414 0l2 2a1 1 0 001.414 0l2-2a1 1 0 011.414 0l.293.293z" />
                          </svg>
                          {item.displayName.length > 20 ? `${item.displayName.substring(0, 20)}...` : item.displayName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs text-gray-400">
                  {note.created_at?.toDate?.()?.toLocaleDateString() || 'Fecha no disponible'}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Note Modal */}
      {showCreateModal && (
        <NoteModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateNote}
          title="Nueva Nota"
        />
      )}

      {/* Edit Note Modal */}
      {editingNote && (
        <NoteModal
          onClose={() => setEditingNote(null)}
          onSave={(data) => handleUpdateNote(editingNote.id, data)}
          title="Editar Nota"
          initialData={{
            title: editingNote.title,
            noteDescription: editingNote.noteDescription,
            pinned: editingNote.pinned
          }}
        />
      )}
    </div>
  )
}

// Note Modal Component
function NoteModal({ 
  onClose, 
  onSave, 
  title, 
  initialData 
}: {
  onClose: () => void
  onSave: (data: NoteData) => void
  title: string
  initialData?: Partial<NoteData>
}) {
  const [noteTitle, setNoteTitle] = useState(initialData?.title || '')
  const [noteDescription, setNoteDescription] = useState(initialData?.noteDescription || '')
  const [copyableText, setCopyableText] = useState('')
  const [copyableName, setCopyableName] = useState('')
  const [showCopyField, setShowCopyField] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteTitle.trim() || !noteDescription.trim()) {
      alert('Por favor completa todos los campos')
      return
    }
    onSave({ title: noteTitle.trim(), noteDescription: noteDescription.trim() })
  }

  const insertCopyableText = () => {
    if (copyableText.trim()) {
      let formattedText
      if (copyableName.trim()) {
        // Format: [copy:name|text]
        formattedText = `[copy:${copyableName.trim()}|${copyableText.trim()}]`
      } else {
        // Format: [copy:text]
        formattedText = `[copy:${copyableText.trim()}]`
      }
      setNoteDescription(prev => prev + (prev ? '\n\n' : '') + formattedText)
      setCopyableText('')
      setCopyableName('')
      setShowCopyField(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              placeholder="Título de la nota"
              required
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Contenido
              </label>
              <button
                type="button"
                onClick={() => setShowCopyField(!showCopyField)}
                className="text-sm text-blue-600 hover:underline"
              >
                {showCopyField ? 'Cancelar' : 'Insertar texto copiable'}
              </button>
            </div>
            
            {showCopyField && (
              <div className="mb-3 p-3 bg-gray-50 rounded-md">
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Texto para copiar fácilmente
                </label>
                <div className="space-y-2">
                  <div>
                    <input
                      type="text"
                      value={copyableText}
                      onChange={(e) => setCopyableText(e.target.value)}
                      className="w-full rounded border px-2 py-1 text-sm"
                      placeholder="Texto a copiar"
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={copyableName}
                      onChange={(e) => setCopyableName(e.target.value)}
                      className="flex-1 rounded border px-2 py-1 text-sm"
                      placeholder="Nombre a mostrar (opcional)"
                    />
                    <button
                      type="button"
                      onClick={insertCopyableText}
                      className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
                    >
                      Insertar
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <textarea
              value={noteDescription}
              onChange={(e) => setNoteDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              rows={10}
              placeholder="Escribe el contenido de tu nota aquí..."
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
