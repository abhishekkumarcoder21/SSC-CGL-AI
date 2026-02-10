'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styles from './page.module.css';

function ExamContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const paperId = searchParams.get('paper');
    const paperFile = searchParams.get('file');

    const [paper, setPaper] = useState(null);
    const [loading, setLoading] = useState(true);
    const [started, setStarted] = useState(false);
    const [finished, setFinished] = useState(false);

    // Exam state
    const [currentSection, setCurrentSection] = useState(0);
    const [currentQ, setCurrentQ] = useState(0); // index within section
    const [answers, setAnswers] = useState({});    // { questionId: selectedOptionIndex }
    const [marked, setMarked] = useState({});      // { questionId: true }
    const [hintsUsed, setHintsUsed] = useState({}); // { questionId: [1] or [1,2] }
    const [showHint, setShowHint] = useState(null);  // null | 1 | 2
    const [showPalette, setShowPalette] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    // Load paper
    useEffect(() => {
        if (!paperFile) return;
        fetch(paperFile)
            .then(r => r.json())
            .then(data => {
                setPaper(data);
                setTimeLeft(data.duration_minutes * 60);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [paperFile]);

    // Timer
    useEffect(() => {
        if (!started || finished) return;
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timerRef.current);
    }, [started, finished]);

    const handleSubmit = useCallback((autoSubmit = false) => {
        if (finished) return;
        clearInterval(timerRef.current);
        setFinished(true);

        const timeTaken = paper ? (paper.duration_minutes * 60) - timeLeft : 0;

        // Compute results and navigate
        const resultData = computeResults(paper, answers, hintsUsed, timeTaken, autoSubmit);
        // Store in sessionStorage for result page
        sessionStorage.setItem('exam_result', JSON.stringify({
            ...resultData,
            paperId,
            paperTitle: paper.title,
            paper, // full paper for question review
            answers,
            hintsUsed,
            marked,
        }));
        router.push('/mock-test/result');
    }, [paper, answers, hintsUsed, marked, timeLeft, finished, paperId, router]);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>;
    }
    if (!paper) {
        return <div className="card" style={{ textAlign: 'center', margin: '40px 16px' }}>Paper not found.</div>;
    }

    // Pre-exam screen
    if (!started) {
        return (
            <div className="fade-in" style={{ padding: '16px' }}>
                <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
                    <h2 style={{ marginBottom: '8px' }}>{paper.title}</h2>
                    <p className="text-sm text-muted" style={{ marginBottom: '24px' }}>
                        {paper.sections.reduce((s, sec) => s + sec.questions.length, 0)} Questions &bull; {paper.duration_minutes} Minutes &bull; +2 / −0.5 Marking
                    </p>

                    <div className={styles.instructions}>
                        <h4>Exam Rules</h4>
                        <ul>
                            <li>+2 marks for each correct answer</li>
                            <li>−0.50 for each wrong answer</li>
                            <li>0 for unattempted questions</li>
                            <li>You can use <strong>AI Hints</strong> 💡 if you're stuck</li>
                            <li>Timer auto-submits when time runs out</li>
                        </ul>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ marginTop: '24px', fontSize: '1.0625rem', padding: '14px 48px' }}
                        onClick={() => { setStarted(true); startTimeRef.current = Date.now(); }}
                    >
                        Start Exam ▶
                    </button>
                </div>
            </div>
        );
    }

    const section = paper.sections[currentSection];
    const question = section.questions[currentQ];
    const totalQ = paper.sections.reduce((s, sec) => s + sec.questions.length, 0);
    const globalQIndex = paper.sections.slice(0, currentSection).reduce((s, sec) => s + sec.questions.length, 0) + currentQ;

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const getQStatus = (qId) => {
        if (qId === question.id) return 'current';
        if (marked[qId] && answers[qId] !== undefined) return 'marked-answered';
        if (marked[qId]) return 'marked';
        if (answers[qId] !== undefined) return 'answered';
        return 'not-visited';
    };

    const navigateQ = (sectionIdx, qIdx) => {
        setCurrentSection(sectionIdx);
        setCurrentQ(qIdx);
        setShowHint(null);
        setShowPalette(false);
    };

    const goNext = () => {
        if (currentQ < section.questions.length - 1) {
            setCurrentQ(currentQ + 1);
        } else if (currentSection < paper.sections.length - 1) {
            setCurrentSection(currentSection + 1);
            setCurrentQ(0);
        }
        setShowHint(null);
    };

    const goPrev = () => {
        if (currentQ > 0) {
            setCurrentQ(currentQ - 1);
        } else if (currentSection > 0) {
            const prevSec = paper.sections[currentSection - 1];
            setCurrentSection(currentSection - 1);
            setCurrentQ(prevSec.questions.length - 1);
        }
        setShowHint(null);
    };

    const selectOption = (optIdx) => {
        setAnswers(prev => ({ ...prev, [question.id]: optIdx }));
    };

    const clearResponse = () => {
        setAnswers(prev => { const n = { ...prev }; delete n[question.id]; return n; });
    };

    const toggleMark = () => {
        setMarked(prev => ({ ...prev, [question.id]: !prev[question.id] }));
    };

    const useHint = (hintNum) => {
        setShowHint(hintNum);
        setHintsUsed(prev => {
            const used = prev[question.id] || [];
            if (!used.includes(hintNum)) return { ...prev, [question.id]: [...used, hintNum] };
            return prev;
        });
    };

    const answeredCount = Object.keys(answers).length;

    return (
        <div className={styles.examContainer}>
            {/* Timer Bar */}
            <div className={styles.timerBar}>
                <span className={styles.timerLabel}>{paper.title}</span>
                <span className={`${styles.timer} ${timeLeft < 300 ? styles.timerDanger : ''}`}>
                    ⏱️ {formatTime(timeLeft)}
                </span>
            </div>

            {/* Section Tabs */}
            <div className={styles.sectionTabs}>
                {paper.sections.map((sec, i) => (
                    <button
                        key={sec.id}
                        className={`${styles.sectionTab} ${i === currentSection ? styles.activeTab : ''}`}
                        onClick={() => { setCurrentSection(i); setCurrentQ(0); setShowHint(null); }}
                    >
                        {sec.name.split(' ')[0]}
                    </button>
                ))}
            </div>

            <div className={styles.examBody}>
                {/* Question Area */}
                <div className={styles.questionArea}>
                    <div className={styles.qHeader}>
                        <span className={styles.qNumber}>Q.{globalQIndex + 1} of {totalQ}</span>
                        <div className={styles.qTags}>
                            <span className={`badge badge-accent ${styles.topicBadge}`}>{question.topic}</span>
                            <span className={`${styles.diffBadge} ${styles[question.difficulty]}`}>{question.difficulty}</span>
                        </div>
                    </div>

                    <div className={styles.qText}>{question.text}</div>

                    <div className={styles.options}>
                        {question.options.map((opt, i) => (
                            <button
                                key={i}
                                className={`${styles.option} ${answers[question.id] === i ? styles.selected : ''}`}
                                onClick={() => selectOption(i)}
                            >
                                <span className={styles.optLetter}>{String.fromCharCode(65 + i)}</span>
                                <span>{opt}</span>
                            </button>
                        ))}
                    </div>

                    {/* Hint Section */}
                    <div className={styles.hintArea}>
                        <div className={styles.hintButtons}>
                            <button className={`${styles.hintBtn} ${(hintsUsed[question.id] || []).includes(1) ? styles.hintUsed : ''}`} onClick={() => useHint(1)}>
                                💡 Hint 1
                            </button>
                            <button className={`${styles.hintBtn} ${(hintsUsed[question.id] || []).includes(2) ? styles.hintUsed : ''}`} onClick={() => useHint(2)}>
                                💡 Hint 2
                            </button>
                        </div>
                        {showHint === 1 && <div className={styles.hintBox}>{question.hint1}</div>}
                        {showHint === 2 && <div className={styles.hintBox}>{question.hint2}</div>}
                    </div>

                    {/* Action Buttons */}
                    <div className={styles.actions}>
                        <button className={styles.actionBtn} onClick={clearResponse}>Clear</button>
                        <button className={`${styles.actionBtn} ${marked[question.id] ? styles.markedBtn : ''}`} onClick={toggleMark}>
                            {marked[question.id] ? '★ Marked' : '☆ Mark'}
                        </button>
                        <button className={`btn btn-primary btn-sm ${styles.saveNext}`} onClick={goNext}>
                            Save & Next →
                        </button>
                    </div>
                </div>

                {/* Palette Toggle (Mobile) */}
                <button className={styles.paletteToggle} onClick={() => setShowPalette(!showPalette)}>
                    {showPalette ? '✕' : `📊 ${answeredCount}/${totalQ}`}
                </button>

                {/* Question Palette */}
                <div className={`${styles.palette} ${showPalette ? styles.paletteOpen : ''}`}>
                    <div className={styles.paletteLegend}>
                        <span><span className={`${styles.dot} ${styles.dotAnswered}`} /> Answered</span>
                        <span><span className={`${styles.dot} ${styles.dotCurrent}`} /> Current</span>
                        <span><span className={`${styles.dot} ${styles.dotMarked}`} /> Marked</span>
                        <span><span className={`${styles.dot} ${styles.dotNot}`} /> Not Visited</span>
                    </div>
                    {paper.sections.map((sec, si) => (
                        <div key={sec.id} className={styles.paletteSection}>
                            <div className={styles.paletteSectionTitle}>{sec.name.split(' ')[0]}</div>
                            <div className={styles.paletteGrid}>
                                {sec.questions.map((q, qi) => (
                                    <button
                                        key={q.id}
                                        className={`${styles.paletteQ} ${styles['pq-' + getQStatus(q.id)]}`}
                                        onClick={() => navigateQ(si, qi)}
                                    >
                                        {paper.sections.slice(0, si).reduce((s, ss) => s + ss.questions.length, 0) + qi + 1}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Nav */}
            <div className={styles.examNav}>
                <button className={styles.navBtn} onClick={goPrev} disabled={globalQIndex === 0}>◀ Prev</button>
                <button className={`${styles.navBtn} ${styles.submitBtn}`} onClick={() => setShowConfirm(true)}>
                    Submit Test
                </button>
                <button className={styles.navBtn} onClick={goNext} disabled={globalQIndex === totalQ - 1}>Next ▶</button>
            </div>

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '360px' }}>
                        <h3 style={{ marginBottom: '16px' }}>Submit Test?</h3>
                        <div className={styles.confirmStats}>
                            <div className={styles.confirmStat}>
                                <span className={styles.confirmNum}>{answeredCount}</span>
                                <span className="text-xs text-muted">Answered</span>
                            </div>
                            <div className={styles.confirmStat}>
                                <span className={styles.confirmNum}>{totalQ - answeredCount}</span>
                                <span className="text-xs text-muted">Unattempted</span>
                            </div>
                            <div className={styles.confirmStat}>
                                <span className={styles.confirmNum}>{Object.keys(marked).filter(k => marked[k]).length}</span>
                                <span className="text-xs text-muted">Marked</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>Go Back</button>
                            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleSubmit(false)}>Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Grading + cognitive breakdown
function computeResults(paper, answers, hintsUsed, timeTaken, autoSubmit) {
    let correct = 0, wrong = 0, unattempted = 0;
    const sectionResults = {};
    const cogCounts = { careless_error: 0, knowledge_gap: 0, conceptual_gap: 0, rushed_guess: 0, skipped: 0, correct: 0 };
    const weakTopics = {};

    paper.sections.forEach(sec => {
        let sC = 0, sW = 0, sU = 0;
        sec.questions.forEach(q => {
            const ans = answers[q.id];
            if (ans === undefined || ans === null) {
                unattempted++; sU++;
                cogCounts.skipped++;
            } else if (ans === q.correct) {
                correct++; sC++;
                cogCounts.correct++;
            } else {
                wrong++; sW++;
                // Cognitive classification
                if (q.difficulty === 'easy') cogCounts.careless_error++;
                else if (q.difficulty === 'hard') cogCounts.knowledge_gap++;
                else cogCounts.conceptual_gap++;
                // Track weak topic
                weakTopics[q.topic] = (weakTopics[q.topic] || 0) + 1;
            }
        });
        sectionResults[sec.id] = {
            name: sec.name,
            correct: sC, wrong: sW, unattempted: sU,
            marks: (sC * 2) - (sW * 0.5),
            maxMarks: sec.questions.length * 2,
            total: sec.questions.length,
        };
    });

    const score = (correct * 2) - (wrong * 0.5);
    const maxMarks = paper.sections.reduce((s, sec) => s + sec.questions.length * 2, 0);
    const sortedWeakTopics = Object.entries(weakTopics).sort((a, b) => b[1] - a[1]).map(([t]) => t);

    return {
        score, maxMarks, correct, wrong, unattempted,
        sections: sectionResults,
        cognitiveBreakdown: cogCounts,
        weakTopics: sortedWeakTopics,
        timeTaken,
        autoSubmit,
        date: new Date().toISOString().split('T')[0],
        hintsUsedCount: Object.keys(hintsUsed).length,
    };
}

export default function ExamPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}><div className="spinner" /></div>}>
            <ExamContent />
        </Suspense>
    );
}
