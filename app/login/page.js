'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useUser();
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('phone'); // phone | otp

    const handleSendOTP = () => {
        if (phone.length === 10) {
            setStep('otp');
        }
    };

    const handleVerify = () => {
        if (otp.length === 4) {
            login();
            router.push('/');
        }
    };

    return (
        <div className={styles.container}>
            <div className="fade-in">
                <div className={styles.brand}>
                    <h1>SSC CGL <span className="text-accent">AI</span></h1>
                    <p className="text-sm text-muted" style={{ marginTop: '4px' }}>
                        Your AI-powered exam mentor
                    </p>
                </div>

                {step === 'phone' ? (
                    <div>
                        <div className="input-group">
                            <label>Mobile Number</label>
                            <div className={styles.phoneInput}>
                                <span className={styles.prefix}>+91</span>
                                <input
                                    type="tel"
                                    className="input-field"
                                    placeholder="Enter 10-digit number"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                    style={{ paddingLeft: '48px' }}
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleSendOTP}
                            disabled={phone.length !== 10}
                        >
                            Send OTP
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="input-group">
                            <label>Enter OTP sent to +91 {phone}</label>
                            <input
                                type="tel"
                                className={`input-field ${styles.otpInput}`}
                                placeholder="4-digit OTP"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                maxLength={4}
                            />
                            <p className="text-xs text-muted" style={{ marginTop: '8px' }}>
                                For MVP, enter any 4 digits.
                            </p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={handleVerify}
                            disabled={otp.length !== 4}
                        >
                            Verify & Continue
                        </button>
                        <button
                            className="btn btn-ghost"
                            onClick={() => setStep('phone')}
                            style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}
                        >
                            Change number
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
