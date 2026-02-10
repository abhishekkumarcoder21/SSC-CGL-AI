'use client';

import { useState, useMemo } from 'react';
import PYQ_DATA from '../data/pyq-data';
import styles from './page.module.css';

export default function PYQPage() {
    const [selectedYear, setSelectedYear] = useState('all');
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [selectedTopic, setSelectedTopic] = useState('all');
    const [expandedQ, setExpandedQ] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showExplanation, setShowExplanation] = useState({});

    // Filter questions
    const filtered = useMemo(() => {
        return PYQ_DATA.questions.filter(q => {
            if (selectedYear !== 'all' && q.year !== parseInt(selectedYear)) return false;
            if (selectedSubject !== 'all' && q.subject !== selectedSubject) return false;
            if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) return false;
            if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;
            return true;
        });
    }, [selectedYear, selectedSubject, selectedDifficulty, selectedTopic]);

    // Dynamically get topics for selected subject
    const availableTopics = useMemo(() => {
        const base = selectedSubject !== 'all'
            ? PYQ_DATA.questions.filter(q => q.subject === selectedSubject)
            : PYQ_DATA.questions;
        return [...new Set(base.map(q => q.topic))].sort();
    }, [selectedSubject]);

    const handleAnswer = (qId, optionIdx) => {
        if (selectedAnswers[qId] !== undefined) return; // already answered
        setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    };

    const toggleExplanation = (qId) => {
        setShowExplanation(prev => ({ ...prev, [qId]: !prev[qId] }));
    };

    const difficultyColors = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };
    const subjectEmojis = {
        'Quantitative Aptitude': '🔢',
        'General Intelligence & Reasoning': '🧠',
        'English Language': '📖',
        'General Awareness': '🌍',
    };

    const stats = {
        total: filtered.length,
        attempted: Object.keys(selectedAnswers).filter(k => filtered.some(q => q.id === k)).length,
        correct: Object.entries(selectedAnswers).filter(([k, v]) => {
            const q = filtered.find(q => q.id === k);
            return q && q.correct === v;
        }).length,
    };

    return (
        <div className="fade-in">
            <h1 style={{ marginBottom: '4px' }}>📜 Previous Year Questions</h1>
            <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>
                Practice PYQs filtered by year, subject, topic & difficulty.
            </p>

            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={styles.statChip}><strong>{stats.total}</strong> Qs</div>
                <div className={styles.statChip}><strong>{stats.attempted}</strong> Attempted</div>
                <div className={`${styles.statChip} ${styles.statCorrect}`}><strong>{stats.correct}</strong> Correct</div>
            </div>

            {/* Filters */}
            <div className={styles.filters}>
                <select className={styles.filterSelect} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                    <option value="all">All Years</option>
                    {PYQ_DATA.years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select className={styles.filterSelect} value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedTopic('all'); }}>
                    <option value="all">All Subjects</option>
                    {PYQ_DATA.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select className={styles.filterSelect} value={selectedDifficulty} onChange={e => setSelectedDifficulty(e.target.value)}>
                    <option value="all">All Difficulty</option>
                    {PYQ_DATA.difficulties.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
                {availableTopics.length > 0 && (
                    <select className={styles.filterSelect} value={selectedTopic} onChange={e => setSelectedTopic(e.target.value)}>
                        <option value="all">All Topics</option>
                        {availableTopics.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                )}
            </div>

            {/* Questions */}
            <div className={styles.questionList}>
                {filtered.map((q, idx) => {
                    const answered = selectedAnswers[q.id] !== undefined;
                    const userAnswer = selectedAnswers[q.id];
                    const isCorrect = answered && userAnswer === q.correct;

                    return (
                        <div key={q.id} className={styles.questionCard}>
                            {/* Header */}
                            <div className={styles.qHeader}>
                                <span className={styles.qNum}>Q{idx + 1}</span>
                                <div className={styles.qBadges}>
                                    <span className={styles.qBadge}>{q.year} • {q.shift}</span>
                                    <span className={styles.qBadge} style={{ color: difficultyColors[q.difficulty] }}>
                                        {q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)}
                                    </span>
                                    <span className={styles.qSubjectBadge}>
                                        {subjectEmojis[q.subject]} {q.topic}
                                    </span>
                                </div>
                            </div>

                            {/* Question Text */}
                            <div className={styles.qText}>{q.text}</div>

                            {/* Options */}
                            <div className={styles.optionList}>
                                {q.options.map((opt, oi) => {
                                    let optClass = styles.option;
                                    if (answered) {
                                        if (oi === q.correct) optClass += ` ${styles.optionCorrect}`;
                                        else if (oi === userAnswer && !isCorrect) optClass += ` ${styles.optionWrong}`;
                                    }

                                    return (
                                        <button
                                            key={oi}
                                            className={optClass}
                                            onClick={() => handleAnswer(q.id, oi)}
                                            disabled={answered}
                                        >
                                            <span className={styles.optionLetter}>
                                                {String.fromCharCode(65 + oi)}
                                            </span>
                                            <span className={styles.optionText}>{opt}</span>
                                            {answered && oi === q.correct && <span className={styles.optionIcon}>✅</span>}
                                            {answered && oi === userAnswer && !isCorrect && oi !== q.correct && <span className={styles.optionIcon}>❌</span>}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Result / Explanation */}
                            {answered && (
                                <div className={styles.qFooter}>
                                    <div className={isCorrect ? styles.resultCorrect : styles.resultWrong}>
                                        {isCorrect ? '🎉 Correct!' : `❌ Wrong! Correct: ${String.fromCharCode(65 + q.correct)}`}
                                    </div>
                                    <button
                                        className={styles.explainBtn}
                                        onClick={() => toggleExplanation(q.id)}
                                    >
                                        {showExplanation[q.id] ? 'Hide' : 'Show'} Explanation
                                    </button>
                                    {showExplanation[q.id] && (
                                        <div className={styles.explanation}>
                                            💡 {q.explanation}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filtered.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <p style={{ fontSize: '2rem', marginBottom: '8px' }}>📭</p>
                        <p className="text-muted">No questions found for the selected filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
