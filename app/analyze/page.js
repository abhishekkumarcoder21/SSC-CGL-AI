'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import PaywallModal from '../components/PaywallModal';
import styles from './page.module.css';

export default function AnalyzePage() {
    const { canAnalyzeMock, addMockResult, mockHistory, isPaid } = useUser();
    const [showPaywall, setShowPaywall] = useState(false);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [form, setForm] = useState({
        total: '',
        qa: '',
        gir: '',
        eng: '',
        gk: '',
    });
    const autoAnalyzed = useRef(false);

    // Auto-detect scores from mock test result page
    useEffect(() => {
        if (autoAnalyzed.current) return;
        const raw = sessionStorage.getItem('auto_analyze');
        if (raw) {
            autoAnalyzed.current = true;
            sessionStorage.removeItem('auto_analyze');
            try {
                const data = JSON.parse(raw);
                const autoForm = {
                    total: data.total || 0,
                    qa: data.sections?.qa || 0,
                    gir: data.sections?.gir || 0,
                    eng: data.sections?.eng || 0,
                    gk: data.sections?.gk || 0,
                };
                setForm(autoForm);
                // Auto-submit
                runAnalysis(autoForm);
            } catch (e) {
                console.error('Auto-analyze parse error:', e);
            }
        }
    }, []); // eslint-disable-line

    async function runAnalysis(formData) {
        const { total, qa, gir, eng, gk } = formData;
        if (total === '' || qa === '' || gir === '' || eng === '' || gk === '') return;

        setLoading(true);
        try {
            const previousMocks = mockHistory.map(m => ({ total: m.total }));
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    total: Number(total),
                    sections: { qa: Number(qa), gir: Number(gir), eng: Number(eng), gk: Number(gk) },
                    previousMocks: previousMocks.length > 0 ? previousMocks : null,
                }),
            });
            const data = await res.json();
            if (data.analysis) {
                setAnalysis(data.analysis);
                addMockResult(
                    { total: Number(total), sections: { qa: Number(qa), gir: Number(gir), eng: Number(eng), gk: Number(gk) } },
                    data.analysis
                );
            }
        } catch (err) {
            console.error('Analysis failed:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleChange = (field, value) => {
        const num = value === '' ? '' : Math.max(0, Math.min(field === 'total' ? 200 : 50, parseInt(value) || 0));
        setForm({ ...form, [field]: num });
    };

    const handleSubmit = async () => {
        if (!canAnalyzeMock) {
            setShowPaywall(true);
            return;
        }
        runAnalysis(form);
    };

    const resetForm = () => {
        setAnalysis(null);
        setForm({ total: '', qa: '', gir: '', eng: '', gk: '' });
    };

    return (
        <div className="fade-in">
            <h1 style={{ marginBottom: '4px' }}>📊 Mock Test Analyzer</h1>
            <p className="text-sm text-muted" style={{ marginBottom: '24px' }}>
                Enter your scores. Get honest, actionable feedback.
            </p>

            {!analysis ? (
                /* Input form */
                <div>
                    <div className="input-group">
                        <label>Total Marks (out of 200)</label>
                        <input
                            type="number"
                            className="input-field"
                            placeholder="e.g. 125"
                            value={form.total}
                            onChange={e => handleChange('total', e.target.value)}
                            max={200}
                            min={0}
                        />
                    </div>

                    <div className={styles.sectionGrid}>
                        <div className="input-group">
                            <label>Quant (/50)</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="0-50"
                                value={form.qa}
                                onChange={e => handleChange('qa', e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>Reasoning (/50)</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="0-50"
                                value={form.gir}
                                onChange={e => handleChange('gir', e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>English (/50)</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="0-50"
                                value={form.eng}
                                onChange={e => handleChange('eng', e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label>GK (/50)</label>
                            <input
                                type="number"
                                className="input-field"
                                placeholder="0-50"
                                value={form.gk}
                                onChange={e => handleChange('gk', e.target.value)}
                            />
                        </div>
                    </div>

                    {!canAnalyzeMock && (
                        <div className={`card ${styles.limitNotice}`}>
                            <span>🔒</span>
                            <span className="text-sm">Free analysis used. Upgrade for unlimited.</span>
                        </div>
                    )}

                    <button
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        disabled={loading || form.total === ''}
                        style={{ marginTop: '8px' }}
                    >
                        {loading ? <span className="spinner" /> : 'Analyze Now'}
                    </button>
                </div>
            ) : (
                /* Results */
                <div>
                    {/* Verdict */}
                    <div className={`card ${styles.verdictCard}`}>
                        <p className={styles.verdict}>{analysis.overall_verdict}</p>
                    </div>

                    {/* Weak Areas */}
                    {analysis.weak_areas.length > 0 && (
                        <section className="section">
                            <h3 className="section-title" style={{ marginBottom: '12px' }}>🔴 Weak Areas</h3>
                            {analysis.weak_areas.map((area, i) => (
                                <div key={i} className={`card ${styles.weakCard}`}>
                                    <div className={styles.weakHeader}>
                                        <span className={`severity-${area.severity}`}>●</span>
                                        <strong>{area.section}</strong>
                                        <span className={`badge badge-${area.severity === 'high' ? 'red' : area.severity === 'medium' ? 'amber' : 'green'}`}>
                                            {area.severity}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted">
                                        Focus on: {area.weak_topics.join(', ')}
                                    </p>
                                </div>
                            ))}
                        </section>
                    )}

                    {/* Accuracy */}
                    <section className="section">
                        <h3 className="section-title" style={{ marginBottom: '12px' }}>📊 Section Accuracy</h3>
                        <div className={styles.accuracyGrid}>
                            {Object.entries(analysis.accuracy).map(([section, pct]) => (
                                <div key={section} className={`card ${styles.accuracyItem}`}>
                                    <div className="text-xs text-muted">{section}</div>
                                    <div className={styles.accuracyPct}>{pct}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Time Verdict */}
                    <section className="section">
                        <h3 className="section-title" style={{ marginBottom: '8px' }}>⏱️ Time Management</h3>
                        <p className="text-sm">{analysis.time_verdict}</p>
                    </section>

                    {/* Improvement */}
                    <section className="section">
                        <h3 className="section-title" style={{ marginBottom: '8px' }}>📈 Improvement</h3>
                        <div className={`card ${styles.trendCard}`}>
                            <span className={styles.trendIcon}>
                                {analysis.improvement.trend === 'improving' ? '📈' :
                                    analysis.improvement.trend === 'declining' ? '📉' : '➡️'}
                            </span>
                            <p className="text-sm">{analysis.improvement.detail}</p>
                        </div>
                    </section>

                    {/* 7-day plan */}
                    <section className="section">
                        <h3 className="section-title" style={{ marginBottom: '12px' }}>📋 Next 7-Day Strategy</h3>
                        <div className={styles.dayPlan}>
                            {analysis.seven_day_plan.map((day) => (
                                <div key={day.day} className={styles.dayItem}>
                                    <span className={styles.dayNum}>D{day.day}</span>
                                    <span className="text-sm" style={{ flex: 1 }}>
                                        <strong>{day.focus_subject}</strong> — {day.focus_topic}
                                    </span>
                                    <span className="text-xs text-muted">{day.hours}h</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Stop doing */}
                    <section className="section">
                        <h3 className="section-title" style={{ marginBottom: '12px' }}>⚠️ Stop Doing This</h3>
                        {analysis.stop_doing.map((item, i) => (
                            <div key={i} className={`card ${styles.stopCard}`}>
                                <span className={styles.stopIcon}>✋</span>
                                <p className="text-sm">{item}</p>
                            </div>
                        ))}
                    </section>

                    <button className="btn btn-secondary" onClick={resetForm} style={{ marginTop: '8px' }}>
                        Analyze Another Mock
                    </button>
                </div>
            )}

            <PaywallModal
                isOpen={showPaywall}
                onClose={() => setShowPaywall(false)}
                feature="analyzer"
            />
        </div>
    );
}
