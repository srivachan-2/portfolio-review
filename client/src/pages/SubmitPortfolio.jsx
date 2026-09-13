import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortfolio } from '../api/api';

export default function SubmitPortfolio() {
  const [form, setForm] = useState({ title: '', description: '', link: '', category: '', tags: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      const res = await createPortfolio(payload);
      navigate(`/portfolios/${res.data.data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-card">
      <h2>Submit a Portfolio</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <input name="title" value={form.title} onChange={handleChange} required />

        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={4} />

        <label>Link (portfolio URL / repo)</label>
        <input type="url" name="link" value={form.link} onChange={handleChange} placeholder="https://..." required />

        <label>Category</label>
        <input name="category" value={form.category} onChange={handleChange} placeholder="e.g. Web Dev, Design, Writing" />

        <label>Tags (comma-separated)</label>
        <input name="tags" value={form.tags} onChange={handleChange} placeholder="react, ui, portfolio" />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Portfolio'}
        </button>
      </form>
    </div>
  );
}
