import { Link } from 'react-router-dom';

export default function PortfolioCard({ portfolio }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{portfolio.title}</h3>
        <span className={`badge badge-${portfolio.status}`}>{portfolio.status}</span>
      </div>
      <p className="muted">by {portfolio.owner_name}</p>
      {portfolio.category && <span className="tag">{portfolio.category}</span>}
      <p className="description">{portfolio.description?.slice(0, 120)}</p>

      <div className="card-footer">
        <div className="score">
          {portfolio.avg_overall ? (
            <>⭐ {Number(portfolio.avg_overall).toFixed(1)} / 10 ({portfolio.review_count} reviews)</>
          ) : (
            <>No reviews yet</>
          )}
        </div>
        <Link to={`/portfolios/${portfolio.id}`} className="btn-link">View Details</Link>
      </div>
    </div>
  );
}
