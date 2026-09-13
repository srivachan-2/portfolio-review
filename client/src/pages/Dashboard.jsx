import { useEffect, useState } from 'react';
import { listPortfolios } from '../api/api';
import PortfolioCard from '../components/PortfolioCard.jsx';

export default function Dashboard() {
  const [portfolios, setPortfolios] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    listPortfolios(status ? { status } : {})
      .then((res) => setPortfolios(res.data.data.items))
      .catch(() => setError('Failed to load portfolios. Is the PHP API running?'))
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div>
      <div className="page-header">
        <h2>Browse Portfolios</h2>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending Review</option>
          <option value="reviewed">Reviewed</option>
        </select>
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? (
        <p>Loading...</p>
      ) : portfolios.length === 0 ? (
        <p className="muted">No portfolios found.</p>
      ) : (
        <div className="grid">
          {portfolios.map((p) => (
            <PortfolioCard key={p.id} portfolio={p} />
          ))}
        </div>
      )}
    </div>
  );
}
