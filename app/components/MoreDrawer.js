'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './MoreDrawer.module.css';

const menuItems = [
    { href: '/exam-overview', label: 'Exam Overview', icon: '🎯', desc: 'Pattern, cutoffs, eligibility' },
    { href: '/syllabus', label: 'Syllabus', icon: '📚', desc: 'Topic-wise tracker' },
    { href: '/pyq', label: 'PYQ Engine', icon: '📜', desc: 'Previous year questions' },
    { href: '/notes', label: 'Notes & Revision', icon: '📝', desc: 'Study notes & flashcards' },
    { href: '/videos', label: 'Video Classes', icon: '🎥', desc: 'Lectures & solutions' },
    { href: '/doubts', label: 'Doubt Solving', icon: '❓', desc: 'Ask & resolve doubts' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏅', desc: 'Top performers' },
    { href: '/badges', label: 'Badges', icon: '🏆', desc: 'Your achievements' },
    { href: '/pricing', label: 'Upgrade to Pro', icon: '💎', desc: 'Unlock all features' },
];

export default function MoreDrawer({ isOpen, onClose }) {
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAnimating(true);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const handleClose = () => {
        setAnimating(false);
        setTimeout(onClose, 200);
    };

    if (!isOpen && !animating) return null;

    return (
        <>
            <div
                className={`${styles.overlay} ${animating && isOpen ? styles.overlayVisible : ''}`}
                onClick={handleClose}
            />
            <div className={`${styles.drawer} ${animating && isOpen ? styles.drawerOpen : ''}`}>
                <div className={styles.handle} />
                <div className={styles.header}>
                    <h3 className={styles.title}>More Features</h3>
                    <button className={styles.closeBtn} onClick={handleClose}>✕</button>
                </div>
                <div className={styles.menuGrid}>
                    {menuItems.map(item => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={styles.menuItem}
                            onClick={handleClose}
                        >
                            <span className={styles.menuIcon}>{item.icon}</span>
                            <div className={styles.menuText}>
                                <span className={styles.menuLabel}>{item.label}</span>
                                <span className={styles.menuDesc}>{item.desc}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}
