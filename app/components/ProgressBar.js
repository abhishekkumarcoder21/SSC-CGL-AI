export default function ProgressBar({ value, max = 100, color = 'accent', label, showPct = true }) {
    const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
    const colorClass = color === 'accent' ? '' : color;

    return (
        <div style={{ marginBottom: '8px' }}>
            {label && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span className="text-sm">{label}</span>
                    {showPct && <span className="text-sm text-muted">{pct}%</span>}
                </div>
            )}
            <div className="progress-track">
                <div
                    className={`progress-fill ${colorClass}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}
