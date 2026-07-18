// src/App.jsx
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './features/auth/login';
import StickerDashboard from './features/stickers/StickerDashboard';
import PlayerDashboard from './features/players/PlayerDashboard';
import TeamDashboard from './features/teams/TeamDashboard';
import CountryDashboard from './features/countries/CountryDashboard';

function MainAppContent() {
  const { isAuthenticated, logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('stickers'); // 'stickers', 'players', 'teams', 'countries'

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div style={styles.appContainer}>
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <nav style={styles.navbar}>
        <div style={styles.logo}>
          <span style={styles.trophy}>🏆</span> album<strong style={{ color: '#ffb300' }}>Mundial</strong>
          <span style={styles.cloudTag}>Cloud Serverless</span>
        </div>
        <div style={styles.navLinks}>
          <button 
            style={activeTab === 'stickers' ? styles.activeNavLink : styles.navLink} 
            onClick={() => setActiveTab('stickers')}
          >
            🎴 Cromos
          </button>
          <button 
            style={activeTab === 'players' ? styles.activeNavLink : styles.navLink} 
            onClick={() => setActiveTab('players')}
          >
            🏃‍♂️ Jugadores
          </button>
          <button 
            style={activeTab === 'teams' ? styles.activeNavLink : styles.navLink} 
            onClick={() => setActiveTab('teams')}
          >
            🛡️ Equipos
          </button>
          <button 
            style={activeTab === 'countries' ? styles.activeNavLink : styles.navLink} 
            onClick={() => setActiveTab('countries')}
          >
            🌍 Países
          </button>
        </div>
        <div style={styles.userProfile}>
          <span style={styles.username}>👤 {user?.username || 'admin'}</span>
          <button style={styles.btnLogout} onClick={logout}>Salir 🚪</button>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      <main style={styles.mainContent}>
        {activeTab === 'stickers' && <StickerDashboard />}
        {activeTab === 'players' && <PlayerDashboard />}
        {activeTab === 'teams' && <TeamDashboard />}
        {activeTab === 'countries' && <CountryDashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

const styles = {
  appContainer: { 
    minHeight: '100vh', 
    backgroundColor: '#0d1626', 
    color: '#ffffff', 
    fontFamily: 'system-ui, -apple-system, sans-serif' 
  },
  navbar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '15px 40px', 
    backgroundColor: '#090f1c', 
    borderBottom: '1px solid #1a2a46' 
  },
  logo: { 
    fontSize: '1.4rem', 
    fontWeight: 'bold', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px' 
  },
  trophy: {
    fontSize: '1.6rem'
  },
  cloudTag: {
    fontSize: '0.65rem',
    background: '#1a2a46',
    color: '#ffb300',
    padding: '3px 8px',
    borderRadius: '4px',
    fontWeight: 'bold',
    marginLeft: '5px'
  },
  navLinks: { 
    display: 'flex', 
    gap: '10px' 
  },
  navLink: { 
    background: 'none', 
    border: 'none', 
    color: '#90a4ae', 
    cursor: 'pointer', 
    fontSize: '0.95rem', 
    padding: '8px 16px', 
    borderRadius: '6px',
    transition: 'color 0.2s, background 0.2s'
  },
  activeNavLink: { 
    background: '#1a2a46', 
    border: 'none', 
    color: '#ffb300', 
    cursor: 'pointer', 
    fontSize: '0.95rem', 
    padding: '8px 16px', 
    borderRadius: '6px', 
    fontWeight: 'bold' 
  },
  userProfile: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  username: {
    fontSize: '0.9rem',
    color: '#b0bec5'
  },
  btnLogout: {
    background: '#ff5252',
    color: '#fff',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 'bold'
  },
  mainContent: { 
    padding: '40px max(20px, 4%)', 
    maxWidth: '1200px', 
    margin: '0 auto' 
  }
};