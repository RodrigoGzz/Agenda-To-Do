import React, { useState, useEffect } from 'react'
import '@/css/pages/Notes.css'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { listNotes, createNote, updateNote, deleteNote, togglePinNote, type Note, type NoteData } from '../../backend/notes'

export default function NotesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [query, setQuery] = useState('')

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

  // Normalize strings for case/diacritic-insensitive search
  const normalizeForSearch = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  const filteredNotes = notes.filter((note) => {
    const q = normalizeForSearch(query)
    if (!q) return true
    const title = normalizeForSearch(note.title || '')
    const content = normalizeForSearch(cleanDisplayText(note.noteDescription || ''))
  return title.includes(q) || content.includes(q)
  })

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
      <div className="notes__loading">
        <div className="notes__loadingInner">
          <p className="notes__loadingText">Cargando notas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="notes">
      <div className="notes__toolbar">
        <div className="notes__left">
          <Link
            to="/"
            className="notes__backBtn"
          >
            <svg className="notes__backIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al Calendario
          </Link>
          <h1 className="notes__title">Mis Notas</h1>
          <div className="notes__search">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="notes__searchInput"
              placeholder={'Buscar en título o contenido...'}
            />
            {query && (
              <button
                type="button"
                className="notes__clearBtn"
                onClick={() => setQuery('')}
                aria-label="Limpiar búsqueda"
                title="Limpiar búsqueda"
              >
                ×
              </button>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="notes__newBtn"
        >
          + Nueva Nota
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="notes__empty">
          <p className="notes__emptyText">No tienes notas aún</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="notes__emptyLink"
          >
            Crear tu primera nota
          </button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="notes__empty">
          <p className="notes__emptyText">No hay notas que coincidan con la búsqueda o filtro</p>
          {query && (
            <button
              onClick={() => setQuery('')}
              className="notes__emptyLink"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="notes__grid">
          {[...filteredNotes]
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
              <div key={note.id} className="note">
                <div className="note__header">
                  <h3 className="note__title">{note.title}</h3>
                  <div className="note__icons">
                    <button
                      onClick={() => handleTogglePin(note.id, note.pinned || false)}
                      className={`${note.pinned ? 'note__iconBtn--pinActive' : 'note__iconBtn'}`}
                      title={note.pinned ? 'Desfijar nota' : 'Fijar nota'}
                    >
                      <svg className="note__icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setEditingNote(note)}
                      className="note__iconBtn"
                      title="Editar"
                    >
                      <svg className="note__icon" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="note__iconBtn note__iconBtn--danger"
                      title="Eliminar"
                    >
                      <svg className="note__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="note__content">
                  <p className="note__contentText">
                    {cleanDisplayText(note.noteDescription)}
                  </p>
                </div>

                {copyableItems.length > 0 && (
                  <div className="note__copySection">
                    <p className="note__copyLabel">Texto copiable:</p>
                    <div className="note__copyList">
                      {copyableItems.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => copyToClipboard(item.text)}
                          className="note__copyBtn"
                          title={`Copiar: ${item.text}`}
                        >
                          <svg className="note__copyIcon" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                            <path d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L14.586 13H19v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586V9a1 1 0 00-1-1H8a1 1 0 00-1 1v2.586l.293-.293a1 1 0 011.414 0l2 2a1 1 0 001.414 0l2-2a1 1 0 011.414 0l.293.293z" />
                          </svg>
                          {item.displayName.length > 20 ? `${item.displayName.substring(0, 20)}...` : item.displayName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="note__date">
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
    <div className="notemodal__overlay">
      <div className="notemodal__dialog">
        <div className="notemodal__header">
          <div className="notemodal__headerRow">
            <h2 className="notemodal__title">{title}</h2>
            <button
              onClick={onClose}
              className="notemodal__close"
            >
              <svg className="notemodal__closeIcon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="notemodal__form">
          <div className="notemodal__field">
            <label className="notemodal__label">
              Título
            </label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="notemodal__input"
              placeholder="Título de la nota"
              required
            />
          </div>

          <div className="notemodal__field">
            <div className="flex items-center justify-between mb-2">
              <label className="notemodal__label">
                Contenido
              </label>
              <button
                type="button"
                onClick={() => setShowCopyField(!showCopyField)}
                className="notemodal__toggleCopy"
              >
                {showCopyField ? 'Cancelar' : 'Insertar texto copiable'}
              </button>
            </div>
            
            {showCopyField && (
              <div className="notemodal__copyBox">
                <label className="notemodal__copyLabel">
                  Texto para copiar fácilmente
                </label>
                <div className="notemodal__copyFields">
                  <div>
                    <input
                      type="text"
                      value={copyableText}
                      onChange={(e) => setCopyableText(e.target.value)}
                      className="notemodal__copyInput"
                      placeholder="Texto a copiar"
                    />
                  </div>
                  <div className="notemodal__copyRow">
                    <input
                      type="text"
                      value={copyableName}
                      onChange={(e) => setCopyableName(e.target.value)}
                      className="notemodal__copyNameInput"
                      placeholder="Nombre a mostrar (opcional)"
                    />
                    <button
                      type="button"
                      onClick={insertCopyableText}
                      className="notemodal__insertBtn"
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
              className="notemodal__textarea"
              rows={10}
              placeholder="Escribe el contenido de tu nota aquí..."
              required
            />
          </div>

          <div className="notemodal__actions">
            <button
              type="button"
              onClick={onClose}
              className="notemodal__btn"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="notemodal__save"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
