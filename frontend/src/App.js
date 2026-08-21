import React, { useState } from 'react';
import './App.css';
import LandingPage from './components/Landing/LandingPage';
import Auth from './components/Auth/Auth';
import CitizenDashboard from './components/Dashboard/CitizenDashboard';
import OfficerDashboard from './components/Dashboard/OfficerDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';

function App() {
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'login', 'register', 'dashboard'
  const [userRole, setUserRole] = useState('citizen'); // 'citizen', 'officer', 'admin'

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    setCurrentPage('dashboard');
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
          <OfficerDashboard 
            onLogout={() => {
              setUserRole('citizen');
              setCurrentPage('landing');
            }} 
          />
        ) : userRole === 'admin' ? (
          <AdminDashboard 
            onLogout={() => {
              setUserRole('citizen');
              setCurrentPage('landing');
            }} 
          />
        ) : (
          <CitizenDashboard 
            onLogout={() => {
              setUserRole('citizen');
              setCurrentPage('landing');
            }} 
          />
        )
      )}
    </>
  );
}

export default App;

