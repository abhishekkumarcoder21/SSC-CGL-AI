'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import styles from './page.module.css';

const SUBJECTS = [
    'Quantitative Aptitude',
    'General Intelligence & Reasoning',
    'English Language',
    'General Awareness',
];

const YEARS = [2025, 2026, 2027];

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
        const key = list;
        const current = form[key];
        const otherKey = key === 'strongSubjects' ? 'weakSubjects' : 'strongSubjects';
        if (current.includes(subject)) {
            setForm({ ...form, [key]: current.filter(s => s !== subject) });
        } else {
            // Remove from the other list if present
            setForm({
                ...form,
                [key]: [...current, subject],
                [otherKey]: form[otherKey].filter(s => s !== subject),
            });
        }
    };

    const handleSubmit = () => {
        if (form.strongSubjects.length === 0 && form.weakSubjects.length === 0) {
            return; // require at least some selection
        }
        setProfile(form);
        router.push('/');
    };

    const steps = [
        // Step 0: Exam + Year
        <div key="0" className="fade-in">
            <h1 className={styles.stepTitle}>Let&apos;s set up your plan</h1>
            <p className="text-muted" style={{ marginBottom: '24px' }}>
                This takes 30 seconds. We&apos;ll personalize everything for you.
            </p>

            <div className="input-group">
                <label>Exam</label>
                <div className={styles.examBadge}>SSC CGL (Tier-1)</div>
            </div>

            <div className="input-group">
                <label>Attempt Year</label>
                <div className="chip-group">
                    {YEARS.map(y => (
                        <button
                            key={y}
                            className={`chip ${form.attemptYear === y ? 'active' : ''}`}
                            onClick={() => setForm({ ...form, attemptYear: y })}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            </div>

            <div className="input-group">
                <label>Daily Study Hours: <strong>{form.dailyHours}h</strong></label>
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
                    <span>10h</span>
                </div>
            </div>
        </div>,

        // Step 1: Strong subjects
        <div key="1" className="fade-in">
            <h1 className={styles.stepTitle}>Your strong subjects</h1>
            <p className="text-muted" style={{ marginBottom: '24px' }}>
                Select subjects you&apos;re confident in. We&apos;ll allocate less time here.
            </p>
            <div className="chip-group" style={{ gap: '10px' }}>
                {SUBJECTS.map(s => (
                    <button
                        key={s}
                        className={`chip ${form.strongSubjects.includes(s) ? 'active' : ''}`}
                        onClick={() => toggleSubject('strongSubjects', s)}
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>,

        // Step 2: Weak subjects
        <div key="2" className="fade-in">
            <h1 className={styles.stepTitle}>Your weak subjects</h1>
            <p className="text-muted" style={{ marginBottom: '24px' }}>
                Be honest. This is where we&apos;ll focus your plan.
            </p>
            <div className="chip-group" style={{ gap: '10px' }}>
                {SUBJECTS.filter(s => !form.strongSubjects.includes(s)).map(s => (
                    <button
                        key={s}
                        className={`chip ${form.weakSubjects.includes(s) ? 'active' : ''}`}
                        onClick={() => toggleSubject('weakSubjects', s)}
                    >
                        {s}
                    </button>
                ))}
            </div>
        </div>,
    ];

    return (
        <div className={styles.container}>
            {/* Progress dots */}
            <div className={styles.dots}>
                {steps.map((_, i) => (
                    <div key={i} className={`${styles.dot} ${i <= step ? styles.dotActive : ''}`} />
                ))}
            </div>

            {steps[step]}

            <div className={styles.actions}>
                {step > 0 && (
                    <button className="btn btn-secondary" onClick={() => setStep(step - 1)}>
                        Back
                    </button>
                )}
                {step < steps.length - 1 ? (
                    <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
                        Continue
                    </button>
                ) : (
                    <button className="btn btn-primary" onClick={handleSubmit}>
                        Start My Plan →
                    </button>
                )}
            </div>
        </div>
    );
}
