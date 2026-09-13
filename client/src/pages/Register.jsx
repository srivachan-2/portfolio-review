import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as registerApi } from '../api/api';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await registerApi(form);

      const { token, user } = res.data.data;

      login(token, user);

      navigate('/');
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration failed.'
      );
    }
  };

  return (
    <div className="form-card">
      <h2>Create Account</h2>

      {error && (
        <p className="error">{error}</p>
      )}

      <form onSubmit={handleSubmit}>

        <label>Name</label>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label>Email</label>

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <label>Password (min 8 characters)</label>

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          minLength={8}
          required
        />

        <button type="submit">
          Register
        </button>

      </form>

      <p>
        Already have an account?{' '}
        <Link to="/login">
          Log in
        </Link>
      </p>
    </div>
  );
}