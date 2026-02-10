'use client';

import { useTheme } from '../context/ThemeProvider';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: '1px solid var(--border-light)',
                background: 'var(--bg-card)',
                cursor: 'pointer',
                fontSize: '1.125rem',
                transition: 'all 0.25s ease',
            }}
        >
            {theme === 'dark' ? '☀️' : '🌙'}
        </button>
    );
}
