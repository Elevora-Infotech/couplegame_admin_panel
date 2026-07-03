import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts & Pages
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Categories from './pages/Categories';
import CardCatalog from './pages/CardCatalog';
import Questions from './pages/Questions';
import UserManagement from './pages/UserManagement';
import GameManagement from './pages/GameManagement';
import MasterDeck from './pages/MasterDeck';
import Notifications from './pages/Notifications';
import CardAnalytics from './pages/CardAnalytics';
import RelationshipDynamics from './pages/RelationshipDynamics';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Redirect if already logged in
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="games" element={<GameManagement />} />
        <Route path="categories" element={<Categories />} />
        <Route path="cards" element={<CardCatalog />} />
        <Route path="card-analytics" element={<CardAnalytics />} />
        <Route path="relationship-dynamics" element={<RelationshipDynamics />} />
        <Route path="questions" element={<Questions />} />
        <Route path="master-deck" element={<MasterDeck />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={
          <div className="flex items-center justify-center h-full text-slate-400">
            Settings functionality coming soon.
          </div>
        } />
      </Route>
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
