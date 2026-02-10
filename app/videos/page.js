'use client';

import styles from './page.module.css';

const PLAYLISTS = [
    {
        id: 'qa',
        title: 'Quantitative Aptitude',
        emoji: '🔢',
        color: '#6C63FF',
        videos: [
            { title: 'Number System — Complete Theory', duration: '45 min', status: 'free' },
            { title: 'Percentage — Tricks & Shortcuts', duration: '38 min', status: 'free' },
            { title: 'Profit & Loss — PYQ Solutions', duration: '42 min', status: 'pro' },
            { title: 'Algebra — All Identities Explained', duration: '55 min', status: 'pro' },
            { title: 'Geometry — Triangle Properties', duration: '50 min', status: 'free' },
            { title: 'Trigonometry — Height & Distance', duration: '35 min', status: 'pro' },
            { title: 'Mensuration — Complete in 1 Session', duration: '60 min', status: 'pro' },
        ]
    },
    {
        id: 'reasoning',
        title: 'General Intelligence & Reasoning',
        emoji: '🧠',
        color: '#F59E0B',
        videos: [
            { title: 'Analogy — All Types with Tricks', duration: '30 min', status: 'free' },
            { title: 'Coding-Decoding — Complete Chapter', duration: '40 min', status: 'free' },
            { title: 'Series — Number & Alphabet', duration: '35 min', status: 'pro' },
            { title: 'Blood Relations — Family Tree Method', duration: '28 min', status: 'free' },
            { title: 'Syllogism — Venn Diagram Approach', duration: '32 min', status: 'pro' },
        ]
    },
    {
        id: 'english',
        title: 'English Language',
        emoji: '📖',
        color: '#10B981',
        videos: [
            { title: 'Error Spotting — 50 Rules', duration: '48 min', status: 'free' },
            { title: 'Idioms & Phrases — Top 200', duration: '40 min', status: 'free' },
            { title: 'One Word Substitution — Complete', duration: '35 min', status: 'pro' },
            { title: 'Active/Passive Voice — All Cases', duration: '30 min', status: 'pro' },
        ]
    },
    {
        id: 'gk',
        title: 'General Awareness',
        emoji: '🌍',
        color: '#EF4444',
        videos: [
            { title: 'Indian History — Ancient India', duration: '55 min', status: 'free' },
            { title: 'Indian Polity — Complete Constitution', duration: '65 min', status: 'pro' },
            { title: 'Indian Economy — Budget & Banking', duration: '45 min', status: 'pro' },
            { title: 'General Science — Physics Basics', duration: '40 min', status: 'free' },
            { title: 'Current Affairs — Jan 2026', duration: '30 min', status: 'free' },
        ]
    },
];

export default function VideosPage() {
    return (
        <div className="fade-in">
            <h1 style={{ marginBottom: '4px' }}>🎥 Video Classes</h1>
            <p className="text-sm text-muted" style={{ marginBottom: '20px' }}>
                Topic-wise video lectures for SSC CGL preparation.
            </p>

            <div className={styles.comingSoonBanner}>
                <span className={styles.bannerIcon}>🚧</span>
                <div>
                    <div className={styles.bannerTitle}>Video Integration Coming Soon</div>
                    <div className="text-xs text-muted">YouTube/hosted videos will be linked here. Below is the planned structure.</div>
                </div>
            </div>

            {PLAYLISTS.map(playlist => (
                <div key={playlist.id} className={styles.playlistCard}>
                    <div className={styles.playlistHeader} style={{ '--pl-color': playlist.color }}>
                        <span className={styles.playlistEmoji}>{playlist.emoji}</span>
                        <h3 className={styles.playlistTitle}>{playlist.title}</h3>
                        <span className={styles.videoCount}>{playlist.videos.length} videos</span>
                    </div>
                    <div className={styles.videoList}>
                        {playlist.videos.map((v, i) => (
                            <div key={i} className={styles.videoItem}>
                                <div className={styles.videoThumb}>▶</div>
                                <div className={styles.videoInfo}>
                                    <div className={styles.videoTitle}>{v.title}</div>
                                    <div className={styles.videoMeta}>
                                        <span className="text-xs text-muted">⏱ {v.duration}</span>
                                        {v.status === 'pro' && <span className={styles.proBadge}>PRO</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
