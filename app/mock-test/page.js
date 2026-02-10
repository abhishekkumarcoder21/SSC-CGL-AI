'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '../context/UserContext';
import styles from './page.module.css';

function formatDateTime(dateStr) {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
            ', ' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch { return dateStr; }
}

export default function MockTestPage() {
    const { testAttempts } = useUser();
    const [papers, setPapers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/papers/index.json')
            .then(r => r.json())
            .then(data => { setPapers(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><div className="spinner" /></div>;
    }

    return (
        <div className="fade-in">
            <h1 style={{ marginBottom: '4px' }}>📝 Mock Tests</h1>
            <p className="text-sm text-muted" style={{ marginBottom: '20px' }}>
                Take a real SSC CGL exam. Get AI-powered diagnosis.
            </p>

            {/* Paper list */}
            <section className="section">
                <h3 className="section-title" style={{ marginBottom: '12px' }}>Available Tests</h3>
                {papers.map(paper => {
                    const attempts = testAttempts.filter(a => a.paperId === paper.id);
                    const lastAttempt = attempts[attempts.length - 1];

                    return (
                        <div key={paper.id} className={`card ${styles.paperCard}`}>
                            <div className={styles.paperInfo}>
                                <h3 className={styles.paperTitle}>{paper.title}</h3>
                                <div className={styles.paperMeta}>
                                    <span className="badge badge-accent">{paper.questions} Qs</span>
                                    <span className="text-xs text-muted">{paper.duration_minutes} min</span>
                                    {paper.year && <span className="text-xs text-muted">({paper.year})</span>}
                                </div>
                                {lastAttempt && (
                                    <div className={styles.lastScore}>
                                        Last: <strong>{lastAttempt.score}/{lastAttempt.maxMarks}</strong>
                                        <span className="text-xs text-muted"> ({formatDateTime(lastAttempt.date)})</span>
                                    </div>
                                )}
                            </div>
                            <Link
                                href={`/mock-test/exam?paper=${paper.id}&file=${encodeURIComponent(paper.file)}`}
                                className="btn btn-primary btn-sm"
                                style={{ width: 'auto', whiteSpace: 'nowrap' }}
                            >
                                {attempts.length > 0 ? 'Retake' : 'Start Test'}
                            </Link>
                        </div>
                    );
                })}

                {papers.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                        <p className="text-muted">No mock tests available yet. Check back soon!</p>
                    </div>
                )}
            </section>

            {/* Past attempts */}
            {testAttempts.length > 0 && (
                <section className="section" style={{ marginTop: '8px' }}>
                    <h3 className="section-title" style={{ marginBottom: '12px' }}>Past Attempts</h3>
                    {testAttempts.slice().reverse().slice(0, 5).map((attempt, i) => (
                        <div
                            key={i}
                            className={`card ${styles.attemptCard}`}
                            onClick={() => {
                                if (attempt.attemptId) {
                                    window.location.href = `/mock-test/result?attempt=${attempt.attemptId}`;
                                }
                            }}
                            style={{ cursor: attempt.attemptId ? 'pointer' : 'default' }}
                        >
                            <div>
                                <div className="text-sm" style={{ fontWeight: 600 }}>{attempt.paperTitle}</div>
                                <div className="text-xs text-muted">{formatDateTime(attempt.date)}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className={styles.attemptScore}>
                                    <span className={styles.scoreNum}>{attempt.score}</span>
                                    <span className="text-xs text-muted">/{attempt.maxMarks}</span>
                                </div>
                                {attempt.attemptId && (
                                    <span className="text-xs" style={{ color: 'var(--accent-light)' }}>Review →</span>
                                )}
                            </div>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
}
