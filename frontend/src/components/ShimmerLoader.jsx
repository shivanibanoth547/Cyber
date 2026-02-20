/**
 * Shimmer / Skeleton Loading Components
 * Replaces plain spinners with animated shimmer placeholders.
 */

/** Animated shimmer line */
export function ShimmerLine({ width = 'full' }) {
    return <div className={`shimmer-base shimmer-line ${width}`} />;
}

/** Skeleton stat cards grid */
export function ShimmerStatGrid({ count = 4 }) {
    return (
        <div className="shimmer-stat-grid">
            {Array.from({ length: count }).map((_, i) => (
                <div className="shimmer-stat-card" key={i}>
                    <div className="shimmer-base shimmer-circle" />
                    <div className="shimmer-base shimmer-line short" />
                    <div className="shimmer-base shimmer-line medium" />
                </div>
            ))}
        </div>
    );
}

/** Skeleton table rows */
export function ShimmerTable({ rows = 5, cols = 5 }) {
    return (
        <div>
            {Array.from({ length: rows }).map((_, r) => (
                <div className="shimmer-table-row" key={r} style={{
                    gridTemplateColumns: `repeat(${cols}, 1fr)`,
                    animationDelay: `${r * 0.08}s`
                }}>
                    {Array.from({ length: cols }).map((_, c) => (
                        <div className="shimmer-base shimmer-cell" key={c} />
                    ))}
                </div>
            ))}
        </div>
    );
}

/** Skeleton for analysis result card */
export function ShimmerAnalysisResult() {
    return (
        <div className="shimmer-analysis-result">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="shimmer-base shimmer-line medium" style={{ width: '50%' }} />
                <div className="shimmer-base shimmer-line short" style={{ width: '80px' }} />
            </div>
            <div className="shimmer-base shimmer-line long" />
            <div className="shimmer-base shimmer-line full" />
            <div className="shimmer-base shimmer-line medium" />
            <div className="shimmer-base shimmer-line long" />
        </div>
    );
}

/** Branded full-screen loader */
export function BrandedLoader() {
    return (
        <div className="branded-loader">
            <div className="loader-icon">🛡️</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading SOC AI Assistant...</div>
            <div className="loader-bar" />
        </div>
    );
}
