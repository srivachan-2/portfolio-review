import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPortfolio, getPortfolioReviewHistory, submitReview, requestAIReview } from '../api/api';
import { useAuth } from '../context/AuthContext.jsx';
import ScoreDisplay from '../components/ScoreDisplay.jsx';
import ReviewForm from '../components/ReviewForm.jsx';

export default function PortfolioDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [portfolio, setPortfolio] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [aiSubmitting, setAiSubmitting] = useState(false);
  const [aiError, setAiError] = useState('');

  const load = () => {
    getPortfolio(id).then((res) => setPortfolio(res.data.data));
    getPortfolioReviewHistory(id)
      .then((res) => setHistory(res.data.data.history))
      .catch(() => setError('Failed to load feedback history.'));
  };

  useEffect(load, [id]);

  const canReview =
    user &&
    (user.role === 'reviewer' || user.role === 'admin') &&
    portfolio &&
    Number(portfolio.user_id) !== Number(user.id);

  const handleReviewSubmit = async (scoresAndComment) => {
    setSubmitting(true);
    setReviewError('');
    try {
      await submitReview(id, scoresAndComment);
      load();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAIReview = async () => {
    setAiSubmitting(true);
    setAiError('');
    try {
      await requestAIReview(id);
      load();
    } catch (err) {
      setAiError(err.response?.data?.message || 'Could not generate AI review.');
    } finally {
      setAiSubmitting(false);
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!portfolio) return <p>Loading...</p>;

  return (
    <div>
      <div className="detail-header">
        <h2>{portfolio.title}</h2>
        <span className={`badge badge-${portfolio.status}`}>{portfolio.status}</span>
      </div>
      <p className="muted">Submitted by {portfolio.owner_name} · v{portfolio.version}</p>
      <p>{portfolio.description}</p>
      <a href={portfolio.link} target="_blank" rel="noreferrer">{portfolio.link}</a>

      <div className="tags">
        {portfolio.tags?.map((t) => <span key={t} className="tag">{t}</span>)}
      </div>

      <h3>Aggregate Scores</h3>
      <ScoreDisplay
        creativity={portfolio.avg_creativity}
        technical={portfolio.avg_technical}
        presentation={portfolio.avg_presentation}
        overall={portfolio.avg_overall}
      />

      {canReview && (
        <>
          {reviewError && <p className="error">{reviewError}</p>}
          <ReviewForm onSubmit={handleReviewSubmit} submitting={submitting} />
        </>
      )}

      {user && (
        <div className="ai-review-box">
          {aiError && <p className="error">{aiError}</p>}
          <button onClick={handleAIReview} disabled={aiSubmitting} className="btn-ai">
            {aiSubmitting ? 'Analyzing with AI...' : '✨ Get AI Review'}
          </button>
          <p className="muted">Optional — generates an additional structured review from an AI model, alongside human reviews.</p>
        </div>
      )}

      <h3>Feedback History ({history.length})</h3>
      {history.length === 0 ? (
        <p className="muted">No reviews yet.</p>
      ) : (
        <div className="history-list">
          {history.map((r) => (
            <div key={r.id} className="history-item">
              <div className="history-header">
                <strong>
                  {r.reviewer_name}{' '}
                  <span className={`badge-author badge-author-${r.author_type}`}>
                    {r.author_type === 'ai' ? `AI · ${r.ai_model}` : 'Human'}
                  </span>
                </strong>
                <span className="muted">{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <ScoreDisplay
                creativity={r.score_creativity}
                technical={r.score_technical}
                presentation={r.score_presentation}
                overall={r.score_overall}
              />
              <p>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
