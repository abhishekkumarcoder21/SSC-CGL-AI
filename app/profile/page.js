'use client';

import { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeProvider';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

const TARGET_YEARS = [2026, 2027, 2028, 2029, 2030];
const GENDERS = [
    { value: '', label: 'Select Gender' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];

export default function ProfilePage() {
    const { profile, isPaid, updateProfile } = useUser();
    const { user, isAuthenticated, signOut } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const fileInputRef = useRef(null);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [gender, setGender] = useState('');
    const [targetYear, setTargetYear] = useState(2026);
    const [dailyHours, setDailyHours] = useState(4);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (profile) {
            setFirstName(profile.first_name || profile.display_name?.split(' ')[0] || '');
            setLastName(profile.last_name || profile.display_name?.split(' ').slice(1).join(' ') || '');
            setGender(profile.gender || '');
            setTargetYear(profile.attempt_year || 2026);
            setDailyHours(profile.daily_hours || 4);
        }
        // Load avatar from localStorage
        const savedAvatar = localStorage.getItem('ssc_avatar');
        if (savedAvatar) setAvatarPreview(savedAvatar);
    }, [profile]);

    function handleAvatarChange(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert('Image must be under 2MB');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target.result;
            setAvatarPreview(dataUrl);
            localStorage.setItem('ssc_avatar', dataUrl);
        };
        reader.readAsDataURL(file);
    }

    async function handleSave() {
        setSaving(true);
        setSaved(false);
        try {
            if (typeof updateProfile === 'function') {
                await updateProfile({
                    first_name: firstName,
                    last_name: lastName,
                    display_name: `${firstName} ${lastName}`.trim(),
                    gender,
                    attempt_year: targetYear,
                    daily_hours: dailyHours,
                });
            }
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err) {
            console.error('Save profile error:', err);
        } finally {
            setSaving(false);
        }
    }

    async function handleLogout() {
        try {
            await signOut();
            // Clear local data
            localStorage.removeItem('ssc_cgl_ai');
            localStorage.removeItem('ssc_avatar');
        } catch (err) {
            console.error('Sign out error:', err);
        }
        router.push('/login');
    }

    const initials = firstName && lastName
        ? `${firstName[0]}${lastName[0]}`.toUpperCase()
        : firstName ? firstName[0].toUpperCase()
            : user?.phone ? '📱' : '👤';

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>My Profile</h1>

            {/* Avatar */}
            <div className={styles.avatarSection}>
                <div
                    className={styles.avatar}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {avatarPreview ? (
                        <img src={avatarPreview} alt="Profile" className={styles.avatarImg} />
                    ) : (
                        <span className={styles.avatarInitials}>{initials}</span>
                    )}
                    <div className={styles.avatarOverlay}>📷</div>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                />
                <p className={styles.avatarHint}>Tap to change photo</p>
            </div>

            {/* Name */}
            <div className={styles.formSection}>
                <div className={styles.row}>
                    <div className="input-group" style={{ flex: 1 }}>
                        <label>First Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Abhishek"
                            value={firstName}
                            onChange={e => setFirstName(e.target.value)}
                        />
                    </div>
                    <div className="input-group" style={{ flex: 1 }}>
                        <label>Last Name</label>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Kumar"
                            value={lastName}
                            onChange={e => setLastName(e.target.value)}
                        />
                    </div>
                </div>

                {/* Gender */}
                <div className="input-group">
                    <label>Gender</label>
                    <select
                        className="input-field"
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                    >
                        {GENDERS.map(g => (
                            <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                    </select>
                </div>

                {/* Phone (read-only) */}
                <div className="input-group">
                    <label>Phone</label>
                    <input
                        type="text"
                        className="input-field"
                        value={user?.phone || profile?.phone || 'Not available'}
                        disabled
                        style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    />
                </div>

                {/* Target Year */}
                <div className="input-group">
                    <label>SSC CGL Target Year</label>
                    <div className={styles.yearChips}>
                        {TARGET_YEARS.map(y => (
                            <button
                                key={y}
                                className={`chip ${targetYear === y ? 'active' : ''}`}
                                onClick={() => setTargetYear(y)}
                            >
                                {y}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Daily Hours */}
                <div className="input-group">
                    <label>Daily Study Hours: <strong>{dailyHours}h</strong></label>
                    <input
                        type="range"
                        min={1}
                        max={12}
                        value={dailyHours}
                        onChange={e => setDailyHours(Number(e.target.value))}
                        className={styles.slider}
                    />
                    <div className={styles.sliderLabels}>
                        <span>1h</span>
                        <span>12h</span>
                    </div>
                </div>
            </div>

            {/* Theme */}
            <div className={styles.settingsCard}>
                <div className={styles.settingsRow}>
                    <div>
                        <div className={styles.settingsLabel}>🎨 Appearance</div>
                        <div className={styles.settingsHint}>{theme === 'dark' ? 'Dark' : 'Light'} mode</div>
                    </div>
                    <button className={styles.themeSwitch} onClick={toggleTheme}>
                        <span className={`${styles.switchTrack} ${theme === 'light' ? styles.switchLight : ''}`}>
                            <span className={styles.switchThumb}>
                                {theme === 'dark' ? '🌙' : '☀️'}
                            </span>
                        </span>
                    </button>
                </div>
            </div>

            {/* Subscription */}
            <div className={styles.settingsCard}>
                <div className={styles.settingsRow}>
                    <div>
                        <div className={styles.settingsLabel}>👑 Subscription</div>
                        <div className={styles.settingsHint}>
                            {isPaid ? 'Pro plan active' : 'Free plan'}
                        </div>
                    </div>
                    {!isPaid && (
                        <button
                            className="btn btn-primary btn-sm"
                            onClick={() => router.push('/pricing')}
                        >
                            Upgrade
                        </button>
                    )}
                    {isPaid && <span className="badge badge-green">PRO</span>}
                </div>
            </div>

            {/* Save */}
            <button
                className={`btn btn-primary ${styles.saveBtn}`}
                onClick={handleSave}
                disabled={saving}
            >
                {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Profile'}
            </button>

            {/* Logout */}
            <button className={styles.logoutBtn} onClick={handleLogout}>
                Sign Out
            </button>
        </div>
    );
}
