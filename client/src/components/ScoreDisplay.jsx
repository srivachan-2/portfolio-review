export default function ScoreDisplay({ creativity, technical, presentation, overall }) {
  const rows = [
    ['Creativity', creativity],
    ['Technical', technical],
    ['Presentation', presentation],
    ['Overall', overall],
  ];

  return (
    <div className="score-grid">
      {rows.map(([label, value]) => (
        <div key={label} className="score-row">
          <span>{label}</span>
          <div className="score-bar-track">
            <div className="score-bar-fill" style={{ width: `${(Number(value || 0) / 10) * 100}%` }} />
          </div>
          <span className="score-value">{value ?? '-'}/10</span>
        </div>
      ))}
    </div>
  );
}
