import { formatTime } from '../audio/analyze'

export function Vinyl({ progress, time, duration }: { progress: number; time: number; duration: number }) {
  const angle = progress * 360
  return (
    <div className="vinyl">
      <svg viewBox="0 0 200 200" aria-hidden="true">
        {[96, 88, 80, 72, 64, 56, 48].map((r) => (
          <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="var(--track)" strokeWidth="1" opacity="0.8" />
        ))}
        <circle cx="100" cy="100" r="38" fill="var(--bg)" />
        <g transform={`rotate(${angle} 100 100)`}>
          <line x1="100" y1="5" x2="100" y2="26" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </svg>
      <div className="vinyl-time">
        <strong>{formatTime(time)}</strong>
        <small>/ {formatTime(duration)}</small>
      </div>
    </div>
  )
}
