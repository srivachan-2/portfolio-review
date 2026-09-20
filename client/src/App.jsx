import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Analyze from './pages/Analyze';
import ReviewDashboard from './pages/ReviewDashboard';
import Writer from './pages/Writer';
import ProjectImprover from './pages/ProjectImprover';
import RecruiterMode from './pages/RecruiterMode';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/review" element={<ReviewDashboard />} />
          <Route path="/writer" element={<Writer />} />
          <Route path="/improver" element={<ProjectImprover />} />
          <Route path="/recruiter" element={<RecruiterMode />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}