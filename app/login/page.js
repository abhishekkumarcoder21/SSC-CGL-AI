'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { sendOtp, verifyOtp, isAuthenticated } = useAuth();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [step, setStep] = useState('phone'); // phone | otp
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);
    const otpRefs = useRef([]);

    // If already authenticated, redirect
    useEffect(() => {
        if (isAuthenticated) router.replace('/');
    }, [isAuthenticated, router]);

    // Countdown timer for resend
    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    const handleSendOtp = async () => {
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
            setError('Enter a valid 10-digit number');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await sendOtp(cleanPhone);
            setStep('otp');
            setCountdown(60);
        } catch (err) {
            setError(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1);
        if (value && !/^\d$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all 6 digits entered
        if (value && index === 5 && newOtp.every(d => d !== '')) {
            handleVerifyOtp(newOtp.join(''));
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOtp = async (otpCode) => {
        const code = otpCode || otp.join('');
        if (code.length !== 6) {
            setError('Enter the 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const cleanPhone = phone.replace(/\D/g, '');
            await verifyOtp(cleanPhone, code);
            // Navigate — home page will handle onboarding check
            router.replace('/');
        } catch (err) {
            setError(err.message || 'Invalid OTP');
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        setLoading(true);
        setError('');
        try {
            const cleanPhone = phone.replace(/\D/g, '');
            await sendOtp(cleanPhone);
            setCountdown(60);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            setError(err.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.blob1} />
            <div className={styles.blob2} />

            <div className={styles.card}>
                <div className={styles.logo}>📚</div>
                <h1 className={styles.title}>SSC CGL AI</h1>
                <p className={styles.subtitle}>Your AI-powered exam mentor</p>

                {step === 'phone' ? (
                    <div className={styles.form}>
                        <label className={styles.label}>Mobile Number</label>
                        <div className={styles.phoneInput}>
                            <span className={styles.prefix}>+91</span>
                            <input
                                type="tel"
                                inputMode="numeric"
                                placeholder="98765 43210"
                                value={phone}
                                onChange={e => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setPhone(val);
                                    setError('');
                                }}
                                className={styles.input}
                                autoFocus
                            />
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <button
                            className={`btn btn-primary ${styles.submitBtn}`}
                            onClick={handleSendOtp}
                            disabled={loading || phone.length < 10}
                        >
                            {loading ? <span className="spinner" /> : 'Send OTP'}
                        </button>

                        <p className={styles.terms}>
                            By continuing, you agree to our Terms of Service
                        </p>
                    </div>
                ) : (
                    <div className={styles.form}>
                        <p className={styles.otpSent}>
                            OTP sent to <strong>+91 {phone}</strong>
                        </p>
                        <button
                            className={styles.changeNum}
                            onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}
                        >
                            Change number
                        </button>

                        <div className={styles.otpGrid}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => otpRefs.current[i] = el}
                                    type="tel"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleOtpChange(i, e.target.value)}
                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                    className={styles.otpDigit}
                                    autoFocus={i === 0}
                                />
                            ))}
                        </div>

                        {error && <p className={styles.error}>{error}</p>}

                        <button
                            className={`btn btn-primary ${styles.submitBtn}`}
                            onClick={() => handleVerifyOtp()}
                            disabled={loading || otp.some(d => d === '')}
                        >
                            {loading ? <span className="spinner" /> : 'Verify OTP'}
                        </button>

                        <button
                            className={styles.resend}
                            onClick={handleResend}
                            disabled={countdown > 0 || loading}
                        >
                            {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
