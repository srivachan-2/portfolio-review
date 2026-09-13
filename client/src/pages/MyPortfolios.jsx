import { useEffect, useState } from 'react';
import { getMyPortfolios, deletePortfolio } from '../api/api';
import PortfolioCard from '../components/PortfolioCard.jsx';

export default function MyPortfolios() {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getMyPortfolios()
      .then((res) => setPortfolios(res.data.data.items))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this portfolio and all its reviews?')) return;
    await deletePortfolio(id);
    load();
  };

  return (
    <div>
      <h2>My Portfolios</h2>
      {loading ? (
        <p>Loading...</p>
      ) : portfolios.length === 0 ? (
        <p className="muted">You haven't submitted anything yet.</p>
      ) : (
        <div className="grid">
          {portfolios.map((p) => (
            <div key={p.id}>
              <PortfolioCard portfolio={p} />
              <button className="btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
