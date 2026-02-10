'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';

const NOTES_KEY = 'ssc_user_notes';
const BOOKMARKS_KEY = 'ssc_bookmarks';

function loadNotes() {
    try {
        return JSON.parse(localStorage.getItem(NOTES_KEY) || '[]');
    } catch { return []; }
}
function saveNotes(notes) {
    try { localStorage.setItem(NOTES_KEY, JSON.stringify(notes)); } catch { }
}
function loadBookmarks() {
    try {
        return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
    } catch { return []; }
}
function saveBookmarks(bm) {
    try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bm)); } catch { }
}

const SUBJECTS = [
    { id: 'all', label: 'All', emoji: '📋' },
    { id: 'qa', label: 'Quant', emoji: '🔢' },
    { id: 'reasoning', label: 'Reasoning', emoji: '🧠' },
    { id: 'english', label: 'English', emoji: '📖' },
    { id: 'gk', label: 'GK', emoji: '🌍' },
    { id: 'current', label: 'Current Affairs', emoji: '📰' },
    { id: 'other', label: 'Other', emoji: '📎' },
];

const COLORS = ['#6C63FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export default function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [activeFilter, setActiveFilter] = useState('all');
    const [showEditor, setShowEditor] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [bookmarks, setBookmarks] = useState([]);

    // Editor state
    const [noteTitle, setNoteTitle] = useState('');
    const [noteBody, setNoteBody] = useState('');
    const [noteSubject, setNoteSubject] = useState('qa');
    const [noteColor, setNoteColor] = useState(COLORS[0]);

    useEffect(() => {
        setNotes(loadNotes());
        setBookmarks(loadBookmarks());
    }, []);

    const filteredNotes = notes.filter(n => {
        if (activeFilter !== 'all' && n.subject !== activeFilter) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
        }
        return true;
    });

    const handleSave = () => {
        if (!noteTitle.trim()) return;
        const now = new Date().toISOString();
        if (editingNote) {
            const updated = notes.map(n =>
                n.id === editingNote.id
                    ? { ...n, title: noteTitle, body: noteBody, subject: noteSubject, color: noteColor, updatedAt: now }
                    : n
            );
            setNotes(updated);
            saveNotes(updated);
        } else {
            const newNote = {
                id: `note-${Date.now()}`,
                title: noteTitle,
                body: noteBody,
                subject: noteSubject,
                color: noteColor,
                createdAt: now,
                updatedAt: now,
            };
            const updated = [newNote, ...notes];
            setNotes(updated);
            saveNotes(updated);
        }
        closeEditor();
    };

    const handleDelete = (id) => {
        const updated = notes.filter(n => n.id !== id);
        setNotes(updated);
        saveNotes(updated);
    };

    const handleEdit = (note) => {
        setEditingNote(note);
        setNoteTitle(note.title);
        setNoteBody(note.body);
        setNoteSubject(note.subject);
        setNoteColor(note.color);
        setShowEditor(true);
    };

    const toggleBookmark = (noteId) => {
        const updated = bookmarks.includes(noteId)
            ? bookmarks.filter(b => b !== noteId)
            : [...bookmarks, noteId];
        setBookmarks(updated);
        saveBookmarks(updated);
    };

    const closeEditor = () => {
        setShowEditor(false);
        setEditingNote(null);
        setNoteTitle('');
        setNoteBody('');
        setNoteSubject('qa');
        setNoteColor(COLORS[0]);
    };

    const openNewNote = () => {
        closeEditor();
        setShowEditor(true);
    };

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const getSubjectLabel = (id) => SUBJECTS.find(s => s.id === id)?.label || id;
    const getSubjectEmoji = (id) => SUBJECTS.find(s => s.id === id)?.emoji || '📋';

    return (
        <div className="fade-in">
            <div className={styles.headerRow}>
                <div>
                    <h1 style={{ marginBottom: '2px' }}>📝 Notes & Revision</h1>
                    <p className="text-sm text-muted">{notes.length} notes saved</p>
                </div>
                <button className={styles.addBtn} onClick={openNewNote}>+ New</button>
            </div>

            {/* Subject Filters */}
            <div className={styles.filterRow}>
                {SUBJECTS.map(s => (
                    <button
                        key={s.id}
                        className={`${styles.filterChip} ${activeFilter === s.id ? styles.filterActive : ''}`}
                        onClick={() => setActiveFilter(s.id)}
                    >
                        {s.emoji} {s.label}
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className={styles.searchBox}>
                <span>🔍</span>
                <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
                {searchQuery && (
                    <button className={styles.clearBtn} onClick={() => setSearchQuery('')}>✕</button>
                )}
            </div>

            {/* Notes Grid */}
            <div className={styles.notesGrid}>
                {filteredNotes.map(note => (
                    <div
                        key={note.id}
                        className={styles.noteCard}
                        style={{ borderLeftColor: note.color }}
                    >
                        <div className={styles.noteHeader}>
                            <span className={styles.noteSubject}>{getSubjectEmoji(note.subject)} {getSubjectLabel(note.subject)}</span>
                            <div className={styles.noteActions}>
                                <button
                                    className={`${styles.iconBtn} ${bookmarks.includes(note.id) ? styles.bookmarked : ''}`}
                                    onClick={() => toggleBookmark(note.id)}
                                >
                                    {bookmarks.includes(note.id) ? '⭐' : '☆'}
                                </button>
                                <button className={styles.iconBtn} onClick={() => handleEdit(note)}>✏️</button>
                                <button className={styles.iconBtn} onClick={() => handleDelete(note.id)}>🗑️</button>
                            </div>
                        </div>
                        <div className={styles.noteTitle}>{note.title}</div>
                        <div className={styles.noteBody}>
                            {note.body.length > 200 ? note.body.substring(0, 200) + '...' : note.body}
                        </div>
                        <div className={styles.noteFooter}>
                            <span className="text-xs text-muted">{formatDate(note.updatedAt)}</span>
                        </div>
                    </div>
                ))}

                {filteredNotes.length === 0 && (
                    <div className={styles.emptyState}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📝</div>
                        <p className="text-muted">
                            {searchQuery
                                ? `No notes found for "${searchQuery}"`
                                : activeFilter !== 'all'
                                    ? `No ${getSubjectLabel(activeFilter)} notes yet`
                                    : 'No notes yet. Create your first note!'}
                        </p>
                        {!searchQuery && (
                            <button className={styles.addBtn} onClick={openNewNote} style={{ marginTop: '12px' }}>
                                + Create Note
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Editor Modal */}
            {showEditor && (
                <>
                    <div className={styles.overlay} onClick={closeEditor} />
                    <div className={styles.editorModal}>
                        <div className={styles.editorHeader}>
                            <h3>{editingNote ? 'Edit Note' : 'New Note'}</h3>
                            <button className={styles.closeBtn} onClick={closeEditor}>✕</button>
                        </div>

                        <div className={styles.editorBody}>
                            <input
                                type="text"
                                placeholder="Note title..."
                                value={noteTitle}
                                onChange={e => setNoteTitle(e.target.value)}
                                className={styles.inputTitle}
                                autoFocus
                            />

                            <div className={styles.editorRow}>
                                <select
                                    className={styles.selectSmall}
                                    value={noteSubject}
                                    onChange={e => setNoteSubject(e.target.value)}
                                >
                                    {SUBJECTS.filter(s => s.id !== 'all').map(s => (
                                        <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>
                                    ))}
                                </select>
                                <div className={styles.colorPicker}>
                                    {COLORS.map(c => (
                                        <button
                                            key={c}
                                            className={`${styles.colorDot} ${noteColor === c ? styles.colorSelected : ''}`}
                                            style={{ background: c }}
                                            onClick={() => setNoteColor(c)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <textarea
                                placeholder="Write your notes here... (supports plain text)"
                                value={noteBody}
                                onChange={e => setNoteBody(e.target.value)}
                                className={styles.textArea}
                                rows={10}
                            />
                        </div>

                        <div className={styles.editorFooter}>
                            <button className={styles.cancelBtn} onClick={closeEditor}>Cancel</button>
                            <button className={styles.saveBtn} onClick={handleSave} disabled={!noteTitle.trim()}>
                                {editingNote ? 'Update' : 'Save'} Note
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
