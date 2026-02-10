import { NextResponse } from 'next/server';

// SSC CGL topic bank
const TOPIC_BANK = {
    'Quantitative Aptitude': [
        'Number System', 'Percentage', 'Profit & Loss', 'Ratio & Proportion',
        'Average', 'Simple Interest', 'Compound Interest', 'Time & Work',
        'Time Speed Distance', 'Algebra', 'Geometry', 'Trigonometry',
        'Mensuration', 'Data Interpretation', 'Simplification',
    ],
    'General Intelligence & Reasoning': [
        'Analogy', 'Classification', 'Series', 'Coding-Decoding',
        'Blood Relations', 'Direction Sense', 'Syllogism', 'Venn Diagram',
        'Statement & Conclusion', 'Matrix', 'Paper Folding', 'Mirror Image',
        'Embedded Figures', 'Ranking & Order',
    ],
    'English Language': [
        'Reading Comprehension', 'Cloze Test', 'Fill in the Blanks',
        'Error Spotting', 'Sentence Improvement', 'Idioms & Phrases',
        'One Word Substitution', 'Synonyms & Antonyms', 'Active Passive Voice',
        'Direct Indirect Speech', 'Spelling Correction', 'Para Jumbles',
    ],
    'General Awareness': [
        'Ancient History', 'Medieval History', 'Modern History',
        'Indian Polity', 'Indian Constitution', 'Geography of India',
        'World Geography', 'Physics', 'Chemistry', 'Biology',
        'Indian Economy Basics', 'Static GK',
    ],
};

function generatePlan(profile, recentTopics) {
    const { dailyHours, strongSubjects, weakSubjects } = profile;
    const totalMinutes = dailyHours * 60;

    const allSubjects = Object.keys(TOPIC_BANK);
    let selectedSubjects = [];

    // Pick 2 subjects — prefer weak
    const weak = weakSubjects.filter(s => allSubjects.includes(s));
    const strong = strongSubjects.filter(s => allSubjects.includes(s));
    const neutral = allSubjects.filter(s => !strong.includes(s) && !weak.includes(s));

    if (weak.length >= 2) {
        selectedSubjects = weak.slice(0, 2);
    } else if (weak.length === 1) {
        selectedSubjects = [weak[0]];
        const pool = [...neutral, ...strong];
        if (pool.length > 0) selectedSubjects.push(pool[Math.floor(Math.random() * pool.length)]);
    } else {
        const pool = [...neutral, ...allSubjects];
        selectedSubjects = pool.slice(0, 2);
    }

    // Flatten recent topics for no-repeat check
    const recentTopicNames = (recentTopics || []).flatMap(rt => rt.topics || []);

    // Pick 1 topic per subject, avoiding recent
    const plan = [];
    const studyMinutes = totalMinutes - 20;
    const perSubject = Math.round(studyMinutes / 2);

    selectedSubjects.forEach(subject => {
        const topics = TOPIC_BANK[subject] || [];
        const available = topics.filter(t => !recentTopicNames.includes(t));
        const topic = available.length > 0
            ? available[Math.floor(Math.random() * available.length)]
            : topics[Math.floor(Math.random() * topics.length)];

        plan.push({
            subject,
            topic,
            duration_minutes: perSubject,
            type: 'study',
        });
    });

    // Add revision block
    const revisionSubject = allSubjects.find(s => !selectedSubjects.includes(s)) || selectedSubjects[0];
    const revTopics = TOPIC_BANK[revisionSubject] || [];
    const revTopic = revTopics[Math.floor(Math.random() * revTopics.length)];

    plan.push({
        subject: revisionSubject,
        topic: revTopic,
        duration_minutes: 20,
        type: 'revision',
    });

    return plan;
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { profile, recentTopics } = body;

        if (!profile) {
            return NextResponse.json({ error: 'Profile required' }, { status: 400 });
        }

        const plan = generatePlan(profile, recentTopics);
        return NextResponse.json({ plan });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
    }
}
