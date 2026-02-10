'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import styles from './page.module.css';

const SUBJECTS = [
    { name: 'Quantitative Aptitude', icon: '🧮' },
    { name: 'General Intelligence & Reasoning', icon: '🧠' },
    { name: 'English Language', icon: '📖' },
    { name: 'General Awareness', icon: '🌍' },
];

const YEARS = [2026, 2027, 2028];

export default function OnboardingPage() {
    const router = useRouter();
    const { setProfile } = useUser();
    const [step, setStep] = useState(0);
    const [form, setForm] = useState({
        exam: 'SSC CGL',
        attemptYear: 2026,
        dailyHours: 4,
        strongSubjects: [],
        weakSubjects: [],
    });

    const toggleSubject = (list, subject) => {
        const current = form[list];
        const otherKey = list === 'strongSubjects' ? 'weakSubjects' : 'strongSubjects';
        if (current.includes(subject)) {
            setForm({ ...form, [list]: current.filter(s => s !== subject) });
        } else {
            setForm({
                ...form,
                [list]: [...current, subject],
                [otherKey]: form[otherKey].filter(s => s !== subject),
            });
        }
    };

    const handleSubmit = () => {
        if (form.strongSubjects.length === 0 && form.weakSubjects.length === 0) return;
        setProfile(form);
        router.push('/');
    };

    return (
        <div className={styles.wrapper}>
            <div className={styles.blob1} />
            <div className={styles.blob2} />

            <div className={styles.container}>
                {/* Step indicator */}
                <div className={styles.stepIndicator}>
                    {[0, 1, 2].map(i => (
                        <div key={i} className={styles.stepRow}>
                            <div className={`${styles.stepCircle} ${i < step ? styles.stepDone : i === step ? styles.stepCurrent : ''}`}>
                                {i < step ? '✓' : i + 1}
                            </div>
                            {i < 2 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
                        </div>
                    ))}
                </div>

                {/* Step 0: Year & Hours */}
                {step === 0 && (
                    <div className={styles.card} key="step0">
                        <div className={styles.cardHeader}>
                            <span className={styles.stepEmoji}>📅</span>
                            <h1 className={styles.title}>Your SSC CGL Prep</h1>
                            <p className={styles.subtitle}>This takes 30 seconds. We&apos;ll personalize everything for you.</p>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Target Year</label>
                            <div className={styles.yearGroup}>
                                {YEARS.map(y => (
                                    <button
                                        key={y}
                                        className={`${styles.yearBtn} ${form.attemptYear === y ? styles.yearActive : ''}`}
                                        onClick={() => setForm({ ...form, attemptYear: y })}
                                    >
                                        {y}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.fieldGroup}>
                            <label className={styles.fieldLabel}>Daily Study Hours</label>
                            <div className={styles.hoursDisplay}>
                                <span className={styles.hoursNum}>{form.dailyHours}</span>
                                <span className={styles.hoursUnit}>hours/day</span>
                            </div>
                            <input
                                type="range"
                                min={2}
                                max={10}
                                value={form.dailyHours}
                                onChange={e => setForm({ ...form, dailyHours: parseInt(e.target.value) })}
                                className={styles.slider}
                            />
                            <div className={styles.sliderLabels}>
                                <span>2h</span>
                                <span>6h</span>
                                <span>10h</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 1: Strong Subjects */}
                {step === 1 && (
                    <div className={styles.card} key="step1">
                        <div className={styles.cardHeader}>
                            <span className={styles.stepEmoji}>💪</span>
                            <h1 className={styles.title}>Your strong subjects</h1>
                            <p className={styles.subtitle}>Select subjects you&apos;re confident in. We&apos;ll allocate less time here.</p>
                        </div>

                        <div className={styles.subjectList}>
                            {SUBJECTS.map(s => (
                                <button
                                    key={s.name}
                                    className={`${styles.subjectCard} ${form.strongSubjects.includes(s.name) ? styles.subjectSelected : ''}`}
                                    onClick={() => toggleSubject('strongSubjects', s.name)}
                                >
                                    <span className={styles.subjectIcon}>{s.icon}</span>
                                    <span className={styles.subjectName}>{s.name}</span>
                                    <span className={styles.subjectCheck}>
                                        {form.strongSubjects.includes(s.name) ? '✓' : ''}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Weak Subjects */}
                {step === 2 && (
                    <div className={styles.card} key="step2">
                        <div className={styles.cardHeader}>
                            <span className={styles.stepEmoji}>📚</span>
                            <h1 className={styles.title}>Your weak subjects</h1>
                            <p className={styles.subtitle}>Be honest — this is where we&apos;ll focus your plan.</p>
                        </div>

                        <div className={styles.subjectList}>
                            {SUBJECTS.filter(s => !form.strongSubjects.includes(s.name)).map(s => (
                                <button
                                    key={s.name}
                                    className={`${styles.subjectCard} ${form.weakSubjects.includes(s.name) ? styles.subjectSelectedWeak : ''}`}
                                    onClick={() => toggleSubject('weakSubjects', s.name)}
                                >
                                    <span className={styles.subjectIcon}>{s.icon}</span>
                                    <span className={styles.subjectName}>{s.name}</span>
                                    <span className={styles.subjectCheck}>
                                        {form.weakSubjects.includes(s.name) ? '✓' : ''}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {form.strongSubjects.length > 0 && (
                            <div className={styles.alreadyStrong}>
                                <span className="text-xs text-muted">Already marked strong:</span>
                                <div className={styles.strongTags}>
                                    {form.strongSubjects.map(s => (
                                        <span key={s} className={styles.strongTag}>✓ {s.split(' ')[0]}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className={styles.actions}>
                    {step > 0 && (
                        <button className={styles.backBtn} onClick={() => setStep(step - 1)}>
                            ← Back
                        </button>
                    )}
                    {step < 2 ? (
                        <button className={styles.nextBtn} onClick={() => setStep(step + 1)}>
                            Continue →
                        </button>
                    ) : (
                        <button
                            className={styles.nextBtn}
                            onClick={handleSubmit}
                            disabled={form.strongSubjects.length === 0 && form.weakSubjects.length === 0}
                        >
                            🚀 Start My Plan
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
