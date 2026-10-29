import React, { useState } from 'react';
import './App.css';
import LandingPage from './components/Landing/LandingPage';
import Auth from './components/Auth/Auth';
import CitizenDashboard from './components/Dashboard/CitizenDashboard';
import OfficerDashboard from './components/Dashboard/OfficerDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import { api } from './utils/api';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const token = localStorage.getItem('token');
    return token ? 'dashboard' : 'landing';
  });
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('role') || 'citizen';
  });

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    api.auth.logout();
    setUserRole('citizen');
    setCurrentPage('landing');
  };

  return (
    <>
      {currentPage === 'landing' && (
        <LandingPage 
          onLogin={() => setCurrentPage('login')} 
          onRegister={() => setCurrentPage('register')} 
        />
      )}
      {currentPage === 'login' && (
        <Auth 
          initialIsLogin={true} 
          onBackToHome={() => setCurrentPage('landing')} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {currentPage === 'register' && (
        <Auth 
          initialIsLogin={false} 
          onBackToHome={() => setCurrentPage('landing')} 
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {currentPage === 'dashboard' && (
        userRole === 'officer' ? (
          <OfficerDashboard onLogout={handleLogout} />
        ) : userRole === 'admin' ? (
          <AdminDashboard onLogout={handleLogout} />
        ) : (
          <CitizenDashboard onLogout={handleLogout} />
        )
      )}
    </>
  );
}

export default App;

