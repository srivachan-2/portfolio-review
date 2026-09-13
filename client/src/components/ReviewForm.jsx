import { useState } from 'react';

export default function ReviewForm({ onSubmit, submitting }) {
  const [scores, setScores] = useState({ creativity: 5, technical: 5, presentation: 5, overall: 5 });
  const [comment, setComment] = useState('');

  const handleScoreChange = (key, value) => {
    setScores({ ...scores, [key]: Number(value) });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...scores, comment });
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <h4>Leave a Structured Review</h4>
      {['creativity', 'technical', 'presentation', 'overall'].map((key) => (
        <div key={key} className="slider-row">
          <label>{key.charAt(0).toUpperCase() + key.slice(1)}: {scores[key]}</label>
          <input
            type="range"
            min="1"
            max="10"
            value={scores[key]}
            onChange={(e) => handleScoreChange(key, e.target.value)}
          />
        </div>
      ))}

      <label>Comment</label>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share detailed, constructive feedback..."
        required
        rows={4}
      />

      <button type="submit" disabled={submitting}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
