'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import styles from './BottomNav.module.css';

const tabs = [
    { href: '/', label: 'Plan', icon: '📋' },
    { href: '/mock-test', label: 'Mock Test', icon: '📝' },
    { href: '/progress', label: 'Progress', icon: '📈' },
    { href: '/rank', label: 'Rank', icon: '🏆' },
    { href: '/pricing', label: 'Profile', icon: '👤' },
];

export default function BottomNav() {
    const pathname = usePathname();

    // Hide on onboarding, login, and during exam
    if (pathname === '/onboarding' || pathname === '/login' || pathname.startsWith('/mock-test/exam') || pathname.startsWith('/mock-test/result')) return null;

    return (
        <nav className={styles.nav}>
            {tabs.map((tab) => {
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
    );
}
