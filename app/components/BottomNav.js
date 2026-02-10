'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import MoreDrawer from './MoreDrawer';
import styles from './BottomNav.module.css';

const tabs = [
    { href: '/', label: 'Home', icon: '🏠' },
    { href: '/mock-test', label: 'Mock', icon: '📝' },
    { href: '/syllabus', label: 'Syllabus', icon: '📚' },
    { href: '/progress', label: 'Progress', icon: '📈' },
    { id: 'more', label: 'More', icon: '☰' },
];

export default function BottomNav() {
    const pathname = usePathname();
    const [showMore, setShowMore] = useState(false);

    // Hide on certain pages
    if (pathname === '/onboarding' || pathname === '/login' || pathname.startsWith('/mock-test/exam') || pathname.startsWith('/mock-test/result')) return null;

    // Pages accessible via More drawer
    const morePages = ['/exam-overview', '/syllabus', '/pyq', '/notes', '/videos', '/doubts', '/leaderboard', '/badges', '/pricing', '/rank', '/profile'];
    const isMoreActive = morePages.some(p => pathname.startsWith(p)) && !tabs.slice(0, 4).some(t => pathname === t.href);

    return (
        <>
            <nav className={styles.nav}>
                {tabs.map((tab) => {
                    if (tab.id === 'more') {
                        return (
                            <button
                                key="more"
                                className={`${styles.tab} ${isMoreActive || showMore ? styles.active : ''}`}
                                onClick={() => setShowMore(true)}
                            >
                                <span className={styles.icon}>{tab.icon}</span>
                                <span className={styles.label}>{tab.label}</span>
                            </button>
                        );
                    }
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`${styles.tab} ${isActive ? styles.active : ''}`}
                        >
                            <span className={styles.icon}>{tab.icon}</span>
                            <span className={styles.label}>{tab.label}</span>
                        </Link>
                    );
                })}
            </nav>
            <MoreDrawer isOpen={showMore} onClose={() => setShowMore(false)} />
        </>
    );
}
