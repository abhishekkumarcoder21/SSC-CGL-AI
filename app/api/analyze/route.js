import { NextResponse } from 'next/server';

function analyzeScores(total, sections, previousMocks) {
    const maxMarks = 200;
    const maxPerSection = 50;

    // Calculate accuracy per section
    const accuracy = {};
    const weakAreas = [];

    const sectionNames = {
        qa: { label: 'Quantitative Aptitude', weakTopics: [] },
        gir: { label: 'General Intelligence & Reasoning', weakTopics: [] },
        eng: { label: 'English Language', weakTopics: [] },
        gk: { label: 'General Awareness', weakTopics: [] },
    };

    // Topic diagnosis based on score ranges
    const topicDiagnosis = {
        qa: {
            low: ['Trigonometry', 'Data Interpretation', 'Geometry'],
            mid: ['Algebra', 'Mensuration', 'Time & Work'],
            ok: ['Percentage', 'Ratio & Proportion'],
        },
        gir: {
            low: ['Syllogism', 'Statement & Conclusion', 'Matrix'],
            mid: ['Coding-Decoding', 'Series', 'Blood Relations'],
            ok: ['Analogy', 'Classification'],
        },
        eng: {
            low: ['Reading Comprehension', 'Cloze Test', 'Para Jumbles'],
            mid: ['Error Spotting', 'Sentence Improvement'],
            ok: ['Idioms & Phrases', 'One Word Substitution'],
        },
        gk: {
            low: ['Modern History', 'Indian Polity', 'Geography of India'],
            mid: ['Ancient History', 'Physics', 'Chemistry'],
            ok: ['Biology', 'Static GK'],
        },
    };

    Object.entries(sections).forEach(([key, score]) => {
        const pct = Math.round((score / maxPerSection) * 100);
        accuracy[sectionNames[key]?.label || key] = `${pct}%`;

        let severity, topics;
        if (pct < 40) {
            severity = 'high';
            topics = topicDiagnosis[key]?.low || ['General topics'];
        } else if (pct < 60) {
            severity = 'medium';
            topics = topicDiagnosis[key]?.mid || ['General topics'];
        } else {
            severity = 'low';
            topics = topicDiagnosis[key]?.ok || [];
        }

        if (pct < 70) {
            weakAreas.push({
                section: sectionNames[key]?.label || key,
                weak_topics: topics.slice(0, 2),
                severity,
            });
        }
    });

    // Sort weak areas by severity
    const severityOrder = { high: 0, medium: 1, low: 2 };
    weakAreas.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // Time verdict
    const totalPct = Math.round((total / maxMarks) * 100);
    let timeVerdict;
    if (totalPct < 40) {
        timeVerdict = 'You likely spent too much time on difficult questions. Focus on solving easy and medium questions first.';
    } else if (totalPct < 60) {
        timeVerdict = 'Time distribution needs improvement. Practice timed sectional tests to build speed.';
    } else {
        timeVerdict = 'Decent time management. Focus on accuracy in weak sections rather than speed.';
    }

    // Improvement comparison
    let improvement = { trend: 'first_mock', detail: 'This is your first recorded mock. Take more to track improvement.' };
    if (previousMocks && previousMocks.length > 0) {
        const lastMock = previousMocks[previousMocks.length - 1];
        const diff = total - lastMock.total;
        if (diff > 5) {
            improvement = { trend: 'improving', detail: `+${diff} marks from last mock. Keep this trajectory.` };
        } else if (diff < -5) {
            improvement = { trend: 'declining', detail: `${diff} marks from last mock. Review what changed in your preparation.` };
        } else {
            improvement = { trend: 'flat', detail: `Marginal change (${diff > 0 ? '+' : ''}${diff}). You need to change strategy, not just repeat it.` };
        }
    }

    // 7-day plan — focus on top 2 weak areas
    const sevenDayPlan = [];
    const focusAreas = weakAreas.slice(0, 2);
    for (let day = 1; day <= 7; day++) {
        const focus = focusAreas[(day - 1) % focusAreas.length] || focusAreas[0];
        if (focus) {
            sevenDayPlan.push({
                day,
                focus_subject: focus.section,
                focus_topic: focus.weak_topics[day % focus.weak_topics.length] || focus.weak_topics[0],
                hours: day <= 5 ? 2 : 1.5,
            });
        }
    }

    // Stop doing
    const stopDoing = [];
    if (totalPct < 50) {
        stopDoing.push('Stop attempting questions you are unsure about — negative marking is killing your score.');
    }
    if (weakAreas.some(w => w.severity === 'high')) {
        stopDoing.push('Stop ignoring your weakest section. Dedicate focused time to it daily.');
    }
    if (totalPct > 40 && totalPct < 70) {
        stopDoing.push('Stop studying all subjects equally — your weak areas need 2x the time.');
    }
    if (stopDoing.length < 2) {
        stopDoing.push('Stop skipping revision — solve at least 20 previous year questions daily.');
    }

    // Overall verdict
    let overallVerdict;
    if (totalPct < 35) {
        overallVerdict = `${total}/${maxMarks} — Serious gaps exist. Foundation building is needed before attempting more mocks.`;
    } else if (totalPct < 50) {
        overallVerdict = `${total}/${maxMarks} — Below average. Focused preparation on weak areas can bring quick improvement.`;
    } else if (totalPct < 65) {
        overallVerdict = `${total}/${maxMarks} — Average performance. You need consistency and targeted practice to break through.`;
    } else if (totalPct < 80) {
        overallVerdict = `${total}/${maxMarks} — Good. Fine-tune accuracy and speed in weaker sections to reach selection zone.`;
    } else {
        overallVerdict = `${total}/${maxMarks} — Strong performance. Maintain consistency and focus on eliminating silly mistakes.`;
    }

    return {
        overall_verdict: overallVerdict,
        weak_areas: weakAreas,
        accuracy,
        time_verdict: timeVerdict,
        improvement,
        seven_day_plan: sevenDayPlan,
        stop_doing: stopDoing.slice(0, 2),
    };
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { total, sections, previousMocks } = body;

        if (total == null || !sections) {
            return NextResponse.json({ error: 'Total marks and section marks required' }, { status: 400 });
        }

        const analysis = analyzeScores(total, sections, previousMocks);
        return NextResponse.json({ analysis });
    } catch (error) {
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}
