'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => { } });

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('ssc_theme') || 'dark';
        setTheme(saved);
        document.documentElement.setAttribute('data-theme', saved);
        setMounted(true);
    }, []);

    function toggleTheme() {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        localStorage.setItem('ssc_theme', next);
        document.documentElement.setAttribute('data-theme', next);
    }

    // Prevent flash of wrong theme
    if (!mounted) return null;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}
