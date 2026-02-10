'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '../context/UserContext';
import styles from './page.module.css';

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
            <p className="text-sm text-muted" style={{ marginBottom: '24px' }}>
                Take a real CGL exam. Get AI-powered diagnosis.
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
                                    <span className="badge badge-accent">{paper.questions} Questions</span>
                                    <span className="text-xs text-muted">{paper.duration_minutes} min</span>
                                </div>
                                {lastAttempt && (
                                    <div className={styles.lastScore}>
                                        Last: <strong>{lastAttempt.score}/{lastAttempt.maxMarks}</strong>
                                        <span className="text-xs text-muted"> ({lastAttempt.date})</span>
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
                        <p className="text-muted">No papers available yet.</p>
                    </div>
                )}
            </section>

            {/* Past attempts */}
            {testAttempts.length > 0 && (
                <section className="section" style={{ marginTop: '8px' }}>
                    <h3 className="section-title" style={{ marginBottom: '12px' }}>Past Attempts</h3>
                    {testAttempts.slice().reverse().slice(0, 5).map((attempt, i) => (
                        <div key={i} className={`card ${styles.attemptCard}`}>
                            <div>
                                <div className="text-sm" style={{ fontWeight: 600 }}>{attempt.paperTitle}</div>
                                <div className="text-xs text-muted">{attempt.date}</div>
                            </div>
                            <div className={styles.attemptScore}>
                                <span className={styles.scoreNum}>{attempt.score}</span>
                                <span className="text-xs text-muted">/{attempt.maxMarks}</span>
                            </div>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
}
