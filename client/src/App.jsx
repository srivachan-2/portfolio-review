import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SubmitPortfolio from './pages/SubmitPortfolio.jsx';
import PortfolioDetail from './pages/PortfolioDetail.jsx';
import MyPortfolios from './pages/MyPortfolios.jsx';
import Admin from './pages/Admin.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <p className="center">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="app">

      <nav className="navbar">

        <Link to="/" className="brand">
          Portfolio Review
        </Link>

        <div className="nav-links">

          <Link to="/">
            Browse
          </Link>

          {user && (
            <Link to="/submit">
              Submit
            </Link>
          )}

          {user && (
            <Link to="/my-portfolios">
              My Portfolios
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin">
              Admin
            </Link>
          )}

          {user ? (
            <>
              <span className="nav-user">
                {user.name} ({user.role})
              </span>

              <button onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                Login
              </Link>

              <Link to="/register">
                Register
              </Link>
            </>
          )}

        </div>

      </nav>

      <main className="container">

        <Routes>

          <Route
            path="/"
            element={<Dashboard />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/portfolios/:id"
            element={<PortfolioDetail />}
          />

          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <SubmitPortfolio />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-portfolios"
            element={
              <ProtectedRoute>
                <MyPortfolios />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />

        </Routes>

      </main>

    </div>
  );
}