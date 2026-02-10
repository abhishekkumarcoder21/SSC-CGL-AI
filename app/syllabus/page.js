'use client';

import { useState, useEffect, useCallback } from 'react';
import SYLLABUS_DATA from '../data/syllabus-data';
import { useUser } from '../context/UserContext';
import styles from './page.module.css';

const STORAGE_KEY = 'ssc_syllabus_progress';

function loadProgress() {
    if (typeof window === 'undefined') return {};
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch { return {}; }
}

function saveProgress(progress) {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { }
}

export default function SyllabusPage() {
    const { profile } = useUser();
    const [activeSubject, setActiveSubject] = useState(0);
    const [expandedTopics, setExpandedTopics] = useState({});
    const [progress, setProgress] = useState({});
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setProgress(loadProgress());
    }, []);

    const toggleSubtopic = useCallback((subjectId, topicName, subtopic) => {
        const key = `${subjectId}__${topicName}__${subtopic}`;
        setProgress(prev => {
            const next = { ...prev, [key]: !prev[key] };
            saveProgress(next);
            return next;
        });
    }, []);

    const toggleTopic = useCallback((topicName) => {
        setExpandedTopics(prev => ({ ...prev, [topicName]: !prev[topicName] }));
    }, []);

    const subject = SYLLABUS_DATA.subjects[activeSubject];

    // Calculate progress stats
    const getSubjectProgress = (subj) => {
        let total = 0, completed = 0;
        subj.topics.forEach(topic => {
            topic.subtopics.forEach(st => {
                total++;
                const key = `${subj.id}__${topic.name}__${st}`;
                if (progress[key]) completed++;
            });
        });
        return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    const getTopicProgress = (subj, topic) => {
        let total = 0, completed = 0;
        topic.subtopics.forEach(st => {
            total++;
            const key = `${subj.id}__${topic.name}__${st}`;
            if (progress[key]) completed++;
        });
        return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
    };

    // Overall progress
    const overallProgress = (() => {
        let total = 0, completed = 0;
        SYLLABUS_DATA.subjects.forEach(subj => {
            subj.topics.forEach(topic => {
                topic.subtopics.forEach(st => {
                    total++;
                    const key = `${subj.id}__${topic.name}__${st}`;
                    if (progress[key]) completed++;
                });
            });
        });
        return { total, completed, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
    })();

    // Filter topics by search
    const filteredTopics = subject.topics.filter(topic => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return topic.name.toLowerCase().includes(q) ||
            topic.subtopics.some(st => st.toLowerCase().includes(q));
    });

    return (
        <div className="fade-in">
            <h1 style={{ marginBottom: '4px' }}>📚 SSC CGL Syllabus</h1>
            <p className="text-sm text-muted" style={{ marginBottom: '16px' }}>
                Deep-structured syllabus with PYQ weightage & tracker.
            </p>

            {/* Overall Progress */}
            <div className={styles.overallProgress}>
                <div className={styles.overallLeft}>
                    <div className={styles.overallPct}>{overallProgress.pct}%</div>
                    <div className="text-xs text-muted">Syllabus Completed</div>
                </div>
                <div className={styles.overallBar}>
                    <div className={styles.overallBarFill} style={{ width: `${overallProgress.pct}%` }} />
                </div>
                <div className="text-xs text-muted">{overallProgress.completed}/{overallProgress.total}</div>
            </div>

            {/* Subject Tabs */}
            <div className={styles.subjectTabs}>
                {SYLLABUS_DATA.subjects.map((subj, i) => {
                    const sp = getSubjectProgress(subj);
                    return (
                        <button
                            key={subj.id}
                            className={`${styles.subjectTab} ${i === activeSubject ? styles.activeTab : ''}`}
                            onClick={() => setActiveSubject(i)}
                            style={{ '--tab-color': subj.color }}
                        >
                            <span className={styles.tabEmoji}>{subj.emoji}</span>
                            <span className={styles.tabName}>{subj.id.toUpperCase()}</span>
                            <span className={styles.tabPct}>{sp.pct}%</span>
                        </button>
                    );
                })}
            </div>

            {/* Subject Progress Bar */}
            {(() => {
                const sp = getSubjectProgress(subject);
                return (
                    <div className={styles.subjectProgress}>
                        <div className={styles.subjectProgressHeader}>
                            <span>{subject.emoji} {subject.name}</span>
                            <span className="text-sm text-muted">{sp.completed}/{sp.total} subtopics done</span>
                        </div>
                        <div className={styles.subjectBar}>
                            <div
                                className={styles.subjectBarFill}
                                style={{ width: `${sp.pct}%`, background: subject.color }}
                            />
                        </div>
                    </div>
                );
            })()}

            {/* Search */}
            <div className={styles.searchBox}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search topics or subtopics..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                    <button className={styles.searchClear} onClick={() => setSearchQuery('')}>✕</button>
                )}
            </div>

            {/* Topic List */}
            <div className={styles.topicList}>
                {filteredTopics.map((topic) => {
                    const tp = getTopicProgress(subject, topic);
                    const isExpanded = expandedTopics[topic.name];

                    return (
                        <div key={topic.name} className={styles.topicCard}>
                            <button
                                className={styles.topicHeader}
                                onClick={() => toggleTopic(topic.name)}
                            >
                                <div className={styles.topicLeft}>
                                    <div className={styles.topicName}>
                                        {topic.name}
                                        {topic.important && <span className={styles.importantBadge}>🔥 Important</span>}
                                    </div>
                                    <div className={styles.topicMeta}>
                                        <span className={`${styles.weightBadge} ${styles[`weight_${topic.weightage}`]}`}>
                                            {topic.weightage === 'high' ? '🟢 High' : topic.weightage === 'medium' ? '🟡 Medium' : '🔴 Low'}
                                        </span>
                                        <span className="text-xs text-muted">{topic.pyqCount} PYQs</span>
                                        <span className="text-xs text-muted">{tp.completed}/{tp.total}</span>
                                    </div>
                                </div>
                                <div className={styles.topicRight}>
                                    <div className={styles.topicPctCircle} style={{ '--pct': tp.pct, '--color': subject.color }}>
                                        <span className={styles.topicPctText}>{tp.pct}%</span>
                                    </div>
                                    <span className={styles.topicArrow}>{isExpanded ? '▲' : '▼'}</span>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className={styles.subtopicList}>
                                    {topic.subtopics.map(st => {
                                        const key = `${subject.id}__${topic.name}__${st}`;
                                        const isDone = !!progress[key];
                                        // Highlight search match
                                        const isMatch = searchQuery && st.toLowerCase().includes(searchQuery.toLowerCase());

                                        return (
                                            <div
                                                key={st}
                                                className={`${styles.subtopicItem} ${isDone ? styles.subtopicDone : ''} ${isMatch ? styles.subtopicHighlight : ''}`}
                                                onClick={() => toggleSubtopic(subject.id, topic.name, st)}
                                            >
                                                <div className={styles.subtopicCheck}>
                                                    {isDone ? '✅' : '⬜'}
                                                </div>
                                                <span className={styles.subtopicName}>{st}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredTopics.length === 0 && (
                    <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                        <p className="text-muted">No topics found for &quot;{searchQuery}&quot;</p>
                    </div>
                )}
            </div>
        </div>
    );
}
