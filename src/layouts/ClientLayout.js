import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';

const ClientLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fb' }}>
      <header style={{
        background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
        color: 'white', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 4px 16px rgba(26,35,126,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FiUser size={24} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Client Dashboard</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="btn btn-danger btn-sm">
          <FiLogOut /> Logout
        </button>
      </header>
      <main style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
