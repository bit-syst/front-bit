import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiUsers, FiUserPlus, FiDollarSign, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import TaskPopup from '../components/TaskPopup';

const AdminLayout = () => {
  const { user, logout, settings } = useAuth();
  const navigate = useNavigate();
  const [sideOpen, setSideOpen] = useState(true);
  const [showPopup, setShowPopup] = useState(true);

  const themeColors = settings?.theme_colors ? JSON.parse(settings.theme_colors) : ['#0d1642', '#1a237e', '#283593'];
  const gradient = `linear-gradient(180deg, ${themeColors.join(', ')})`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard' },
    { path: '/admin/clients', icon: <FiUsers />, label: 'Clients' },
    { path: '/admin/employees', icon: <FiUserPlus />, label: 'Employees' },
    { path: '/admin/salary-incentive', icon: <FiDollarSign />, label: 'Salary & Payouts' },
    { path: '/admin/settings', icon: <FiSettings />, label: 'System Settings' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: sideOpen ? 260 : 72,
        background: gradient,
        color: 'white',
        transition: 'width 0.3s ease',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          {sideOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="Logo" style={{ height: 32, width: 'auto' }} />
              ) : (
                <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: 1 }}>ADMIN PANEL</span>
              )}
            </div>
          )}
          <button onClick={() => setSideOpen(!sideOpen)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: 8, borderRadius: 8, cursor: 'pointer' }}>
            {sideOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
        <nav style={{ flex: 1, padding: '16px 8px' }}>
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10,
              color: 'white', textDecoration: 'none', marginBottom: 4, fontSize: 14, fontWeight: 600,
              background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
              transition: 'all 0.2s ease'
            })}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {sideOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {sideOpen && <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>{user?.email}</div>}
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px',
            background: 'rgba(244,67,54,0.2)', border: 'none', color: '#ff8a80', borderRadius: 8,
            cursor: 'pointer', fontSize: 13, fontWeight: 600
          }}>
            <FiLogOut /> {sideOpen && 'Logout'}
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main style={{ marginLeft: sideOpen ? 260 : 72, flex: 1, padding: 24, transition: 'margin-left 0.3s ease', minHeight: '100vh', background: '#f5f7fb' }}>
        <Outlet />
      </main>
      {/* Task Popup on every admin dashboard open */}
      {showPopup && <TaskPopup onClose={() => setShowPopup(false)} />}
    </div>
  );
};

export default AdminLayout;
