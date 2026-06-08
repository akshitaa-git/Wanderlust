import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GenerateTrip from './pages/GenerateTrip';
import TripDetails from './pages/TripDetails';
import LandingPage from './pages/LandingPage';
import PublicTrip from './pages/PublicTrip';
import AuthCallback from './pages/AuthCallback';

// Component to conditionally render Navbar
const Layout = ({ children }) => {
  const location = useLocation();
  // Don't show the standard app navbar on the landing page
  const showNav = location.pathname !== '/';

  return (
    <>
      {showNav && <Navbar />}
      <main className="w-full">
        {children}
      </main>
    </>
  );
};

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/generate" element={
            <ProtectedRoute>
              <GenerateTrip />
            </ProtectedRoute>
          } />
          <Route path="/trips/:id" element={
            <ProtectedRoute>
              <TripDetails />
            </ProtectedRoute>
          } />

          {/* Public shared trip — no auth */}
          <Route path="/shared/:shareId" element={<PublicTrip />} />

          {/* Google OAuth callback */}
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
