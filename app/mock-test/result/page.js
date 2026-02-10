'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../context/UserContext';
import styles from './page.module.css';

const COG_LABELS = {
    correct: { icon: '✅', label: 'Correct', color: '#22c55e' },
    careless_error: { icon: '🔴', label: 'Careless Errors', color: '#ef4444', desc: 'Easy questions you got wrong — focus & attention issue' },
    knowledge_gap: { icon: '🟡', label: 'Knowledge Gaps', color: '#f59e0b', desc: 'Hard topics you haven\'t studied deeply enough' },
    conceptual_gap: { icon: '🟠', label: 'Concept Weak', color: '#f97316', desc: 'Medium questions wrong — concept not clear' },
    rushed_guess: { icon: '⚡', label: 'Rushed Guesses', color: '#8b5cf6', desc: 'Answered too fast without thinking' },
    skipped: { icon: '⬜', label: 'Skipped', color: '#64748b', desc: 'Not attempted — build confidence to attempt' },
};

function generate3DayPlan(result) {
    const weak = result.weakTopics.slice(0, 4);
    const cog = result.cognitiveBreakdown;
    if (weak.length === 0) weak.push('General Revision');

    return [
        {
            day: 1, title: '🔧 Fix the Gaps',
            tasks: [
                `Study: ${weak[0]} — focus on fundamentals (45 min)`,
                weak[1] ? `Study: ${weak[1]} — solve 10 easy problems (30 min)` : `Revise ${weak[0]} formulas (30 min)`,
                `Revise key formulas for ${weak[0]} (15 min)`,
            ]
        },
        {
            day: 2, title: '⚡ Build Speed',
            tasks: [
                `Timed practice: ${weak[0]} — 15 questions in 20 min`,
                weak[2] ? `Study: ${weak[2]} — medium difficulty (30 min)` : `Practice: ${weak[0]} — mixed problems (30 min)`,
                cog.careless_error > 3
                    ? 'Slow reading drill: re-read each question twice before answering (20 min)'
                    : `Practice: ${weak[1] || weak[0]} — 10 mixed problems (20 min)`,
            ]
        },
        {
            day: 3, title: '📝 Mini Mock',
            tasks: [
                'Take a 25-question mini test (weakest sections)',
                'Review every wrong answer — write the correct approach',
                `Revise all ${weak.length} weak topics — quick notes & formulas`,
            ]
        }
    ];
}

export default function ResultPage() {
    const router = useRouter();
    const { saveTestAttempt } = useUser();
    const [result, setResult] = useState(null);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('score');
    const [reviewSection, setReviewSection] = useState(0);

    useEffect(() => {
        const raw = sessionStorage.getItem('exam_result');
        if (!raw) { router.push('/mock-test'); return; }
        setResult(JSON.parse(raw));
    }, [router]);

    useEffect(() => {
        if (result && !saved) {
            saveTestAttempt({
                paperId: result.paperId,
                paperTitle: result.paperTitle,
                date: result.date,
                score: result.score,
                maxMarks: result.maxMarks,
                sections: result.sections,
                cognitiveBreakdown: result.cognitiveBreakdown,
                weakTopics: result.weakTopics,
                timeTaken: result.timeTaken,
                hintsUsedCount: result.hintsUsedCount,
            });
            setSaved(true);
        }
    }, [result, saved, saveTestAttempt]);

    if (!result) return null;

    const pct = Math.round((result.score / result.maxMarks) * 100);
    const plan = generate3DayPlan(result);
    const paper = result.paper;
    const totalQ = result.correct + result.wrong + result.unattempted;

    const verdictText = pct >= 75 ? 'Excellent! 🔥' : pct >= 55 ? 'Good, but gaps remain 📈' : pct >= 35 ? 'Needs improvement 💪' : 'Serious work needed 🚨';
    const verdictColor = pct >= 75 ? '#22c55e' : pct >= 55 ? '#f59e0b' : pct >= 35 ? '#f97316' : '#ef4444';

    // Build section marks for analyzer
    const analyzerScores = {};
    Object.entries(result.sections).forEach(([id, s]) => {
        analyzerScores[id] = s.marks;
    });

    const goToAnalyzer = () => {
        sessionStorage.setItem('auto_analyze', JSON.stringify({
            total: result.score,
            sections: analyzerScores,
        }));
        router.push('/analyze');
    };

    return (
        <div className="fade-in" style={{ paddingBottom: '80px' }}>
            {/* Tabs */}
            <div className={styles.tabs}>
                {['score', 'cognitive', 'plan', 'review'].map(t => (
                    <button key={t} className={`${styles.tab} ${activeTab === t ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab(t)}>
                        {t === 'score' ? '📊 Score' : t === 'cognitive' ? '🧠 Brain' : t === 'plan' ? '📋 3-Day Plan' : '📝 Review'}
                    </button>
                ))}
            </div>

            {/* Score Tab */}
            {activeTab === 'score' && (
                <div className="fade-in" style={{ padding: '16px' }}>
                    <div className={styles.scoreCard}>
                        <div className={styles.mainScore}>
                            <span className={styles.scoreNum}>{result.score}</span>
                            <span className={styles.scoreMax}>/ {result.maxMarks}</span>
                        </div>
                        <div className={styles.verdict} style={{ color: verdictColor }}>{verdictText}</div>
                        <div className={styles.scoreMeta}>
                            <div className={styles.metaItem}>
                                <span className={styles.metaNum} style={{ color: '#22c55e' }}>{result.correct}</span>
                                <span className="text-xs text-muted">Correct</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaNum} style={{ color: '#ef4444' }}>{result.wrong}</span>
                                <span className="text-xs text-muted">Wrong</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaNum} style={{ color: '#64748b' }}>{result.unattempted}</span>
                                <span className="text-xs text-muted">Skipped</span>
                            </div>
                            <div className={styles.metaItem}>
                                <span className={styles.metaNum} style={{ color: '#f59e0b' }}>{result.hintsUsedCount}</span>
                                <span className="text-xs text-muted">Hints</span>
                            </div>
                        </div>
                    </div>

                    <h3 className="section-title" style={{ marginTop: '20px', marginBottom: '12px' }}>Section Breakdown</h3>
                    {Object.entries(result.sections).map(([id, sec]) => (
                        <div key={id} className={`card ${styles.sectionCard}`}>
                            <div className={styles.sectionName}>{sec.name.split(' ').slice(0, 2).join(' ')}</div>
                            <div className={styles.sectionBar}>
                                <div className={styles.sectionFill}
                                    style={{ width: `${Math.max(0, (sec.marks / sec.maxMarks) * 100)}%` }}
                                />
                            </div>
                            <div className={styles.sectionScore}>
                                {sec.marks}/{sec.maxMarks}
                                <span className="text-xs text-muted"> ({sec.correct}✓ {sec.wrong}✗ {sec.unattempted}−)</span>
                            </div>
                        </div>
                    ))}

                    <button className="btn btn-primary" style={{ marginTop: '20px' }} onClick={goToAnalyzer}>
                        🤖 Deep AI Analysis →
                    </button>
                </div>
            )}

            {/* Cognitive Tab */}
            {activeTab === 'cognitive' && (
                <div className="fade-in" style={{ padding: '16px' }}>
                    <h2 style={{ marginBottom: '4px' }}>🧠 Cognitive Breakdown</h2>
                    <p className="text-sm text-muted" style={{ marginBottom: '20px' }}>
                        WHY you got questions wrong — not just which ones.
                    </p>

                    {Object.entries(COG_LABELS).filter(([k]) => k !== 'correct').map(([key, meta]) => {
                        const count = result.cognitiveBreakdown[key] || 0;
                        if (count === 0) return null;
                        const width = totalQ > 0 ? (count / totalQ) * 100 : 0;
                        return (
                            <div key={key} className={`card ${styles.cogCard}`}>
                                <div className={styles.cogHeader}>
                                    <span>{meta.icon} {meta.label}</span>
                                    <span style={{ color: meta.color, fontWeight: 700 }}>{count}</span>
                                </div>
                                <div className={styles.cogBar}>
                                    <div className={styles.cogFill} style={{ width: `${width}%`, background: meta.color }} />
                                </div>
                                <p className="text-xs text-muted" style={{ marginTop: '6px' }}>{meta.desc}</p>
                            </div>
                        );
                    })}

                    {result.weakTopics.length > 0 && (
                        <div className={`card ${styles.weakCard}`}>
                            <h4 style={{ marginBottom: '10px' }}>🎯 Weakest Topics</h4>
                            <div className={styles.weakList}>
                                {result.weakTopics.slice(0, 5).map((t, i) => (
                                    <span key={t} className={styles.weakChip}>
                                        {i + 1}. {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* 3-Day Plan Tab */}
            {activeTab === 'plan' && (
                <div className="fade-in" style={{ padding: '16px' }}>
                    <h2 style={{ marginBottom: '4px' }}>📋 3-Day Improvement Plan</h2>
                    <p className="text-sm text-muted" style={{ marginBottom: '20px' }}>
                        Auto-generated from your test performance.
                    </p>

                    {plan.map(day => (
                        <div key={day.day} className={`card ${styles.dayCard}`}>
                            <h3 className={styles.dayTitle}>Day {day.day}: {day.title}</h3>
                            <ul className={styles.dayTasks}>
                                {day.tasks.map((task, i) => (
                                    <li key={i} className={styles.dayTask}>{task}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}

            {/* Review Tab */}
            {activeTab === 'review' && paper && (
                <div className="fade-in" style={{ padding: '16px' }}>
                    <h2 style={{ marginBottom: '4px' }}>📝 Question Review</h2>
                    <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>
                        See every answer with explanation.
                    </p>

                    <div className={styles.reviewSections}>
                        {paper.sections.map((sec, i) => (
                            <button key={sec.id} className={`${styles.reviewSecBtn} ${i === reviewSection ? styles.reviewSecActive : ''}`}
                                onClick={() => setReviewSection(i)}>
                                {sec.name.split(' ')[0]}
                            </button>
                        ))}
                    </div>

                    {paper.sections[reviewSection].questions.map((q, qi) => {
                        const userAns = result.answers[q.id];
                        const isCorrect = userAns === q.correct;
                        const isWrong = userAns !== undefined && userAns !== null && !isCorrect;
                        const isSkipped = userAns === undefined || userAns === null;
                        const hintsArr = result.hintsUsed[q.id] || [];

                        return (
                            <div key={q.id} className={`card ${styles.reviewQ}`}>
                                <div className={styles.reviewQHeader}>
                                    <span className="text-sm" style={{ fontWeight: 600 }}>
                                        Q.{paper.sections.slice(0, reviewSection).reduce((s, ss) => s + ss.questions.length, 0) + qi + 1}
                                    </span>
                                    <span className={`${styles.reviewStatus} ${isCorrect ? styles.rsCorrect : isWrong ? styles.rsWrong : styles.rsSkip}`}>
                                        {isCorrect ? '✓ Correct' : isWrong ? '✗ Wrong' : '— Skipped'}
                                    </span>
                                </div>
                                <p className={styles.reviewQText}>{q.text}</p>
                                <div className={styles.reviewOptions}>
                                    {q.options.map((opt, oi) => {
                                        let cls = styles.reviewOpt;
                                        if (oi === q.correct) cls += ` ${styles.roCorrect}`;
                                        if (oi === userAns && isWrong) cls += ` ${styles.roWrong}`;
                                        return (
                                            <div key={oi} className={cls}>
                                                <span className={styles.roLetter}>{String.fromCharCode(65 + oi)}</span>
                                                <span>{opt}</span>
                                                {oi === q.correct && <span className={styles.roCheck}>✓</span>}
                                                {oi === userAns && isWrong && <span className={styles.roX}>✗</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className={styles.explanation}>
                                    <strong>Explanation:</strong> {q.explanation}
                                </div>
                                {hintsArr.length > 0 && (
                                    <div className={styles.hintsUsedTag}>
                                        💡 Used {hintsArr.length} hint{hintsArr.length > 1 ? 's' : ''}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Bottom Action */}
            <div className={styles.bottomAction}>
                <button className="btn btn-secondary" onClick={() => router.push('/mock-test')}>
                    ← Back to Tests
                </button>
            </div>
        </div>
    );
}
