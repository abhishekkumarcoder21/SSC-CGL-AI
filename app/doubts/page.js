'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';

const DOUBTS_KEY = 'ssc_doubts';

function loadDoubts() {
    try { return JSON.parse(localStorage.getItem(DOUBTS_KEY) || '[]'); } catch { return []; }
}
function saveDoubts(doubts) {
    try { localStorage.setItem(DOUBTS_KEY, JSON.stringify(doubts)); } catch { }
}

const SUBJECT_OPTIONS = [
    { id: 'qa', label: 'Quantitative Aptitude', emoji: '🔢' },
    { id: 'reasoning', label: 'Reasoning', emoji: '🧠' },
    { id: 'english', label: 'English', emoji: '📖' },
    { id: 'gk', label: 'General Awareness', emoji: '🌍' },
    { id: 'other', label: 'Other', emoji: '📎' },
];

export default function DoubtsPage() {
    const [doubts, setDoubts] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [question, setQuestion] = useState('');
    const [subject, setSubject] = useState('qa');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => { setDoubts(loadDoubts()); }, []);

    const handleSubmit = () => {
        if (!question.trim()) return;
        const newDoubt = {
            id: `doubt-${Date.now()}`,
            question: question.trim(),
            subject,
            status: 'pending',
            createdAt: new Date().toISOString(),
            answer: null,
        };
        const updated = [newDoubt, ...doubts];
        setDoubts(updated);
        saveDoubts(updated);
        setQuestion('');
        setSubject('qa');
        setShowForm(false);
    };

    const handleResolve = (id) => {
        const updated = doubts.map(d =>
            d.id === id ? { ...d, status: d.status === 'resolved' ? 'pending' : 'resolved' } : d
        );
        setDoubts(updated);
        saveDoubts(updated);
    };

    const handleDelete = (id) => {
        const updated = doubts.filter(d => d.id !== id);
        setDoubts(updated);
        saveDoubts(updated);
    };

    const getSubjectInfo = (id) => SUBJECT_OPTIONS.find(s => s.id === id) || { label: id, emoji: '📋' };

    const pendingCount = doubts.filter(d => d.status === 'pending').length;
    const resolvedCount = doubts.filter(d => d.status === 'resolved').length;

    return (
        <div className="fade-in">
            <div className={styles.headerRow}>
                <div>
                    <h1 style={{ marginBottom: '2px' }}>❓ Doubt Solving</h1>
                    <p className="text-sm text-muted">{pendingCount} pending • {resolvedCount} resolved</p>
                </div>
                <button className={styles.askBtn} onClick={() => setShowForm(true)}>Ask Doubt</button>
            </div>

            <div className={styles.aiBanner}>
                <span className={styles.aiIcon}>🤖</span>
                <div>
                    <div className={styles.aiTitle}>AI-Powered Doubt Solving</div>
                    <div className="text-xs text-muted">Coming soon: Get instant AI explanations for your doubts!</div>
                </div>
            </div>

            {/* Doubt Form */}
            {showForm && (
                <div className={styles.formCard}>
                    <h3 style={{ marginBottom: '12px' }}>Ask a Question</h3>
                    <select
                        className={styles.formSelect}
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                    >
                        {SUBJECT_OPTIONS.map(s => (
                            <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>
                        ))}
                    </select>
                    <textarea
                        className={styles.formTextarea}
                        placeholder="Type your doubt here... Be specific for better answers."
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                        rows={4}
                    />
                    <div className={styles.formActions}>
                        <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                        <button className={styles.submitBtn} onClick={handleSubmit} disabled={!question.trim()}>Submit Doubt</button>
                    </div>
                </div>
            )}

            {/* Doubt List */}
            <div className={styles.doubtList}>
                {doubts.map(d => {
                    const subj = getSubjectInfo(d.subject);
                    return (
                        <div key={d.id} className={`${styles.doubtCard} ${d.status === 'resolved' ? styles.resolved : ''}`}>
                            <div className={styles.doubtHeader}>
                                <span className={styles.doubtSubject}>{subj.emoji} {subj.label}</span>
                                <span className={`${styles.statusBadge} ${styles[`status_${d.status}`]}`}>
                                    {d.status === 'pending' ? '⏳ Pending' : '✅ Resolved'}
                                </span>
                            </div>
                            <div className={styles.doubtQuestion}>{d.question}</div>
                            <div className={styles.doubtFooter}>
                                <span className="text-xs text-muted">
                                    {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                                <div className={styles.doubtActions}>
                                    <button className={styles.smallBtn} onClick={() => handleResolve(d.id)}>
                                        {d.status === 'resolved' ? 'Reopen' : 'Mark Resolved'}
                                    </button>
                                    <button className={`${styles.smallBtn} ${styles.deleteBtn}`} onClick={() => handleDelete(d.id)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {doubts.length === 0 && (
                    <div className={styles.emptyState}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💬</div>
                        <p className="text-muted">No doubts posted yet.</p>
                        <button className={styles.askBtn} onClick={() => setShowForm(true)} style={{ marginTop: '12px' }}>
                            Ask Your First Doubt
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
