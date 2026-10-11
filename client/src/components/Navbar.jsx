import React, { useState } from 'react';
import { 
  ShieldCheck, 
  PlusCircle, 
  FileText, 
  Home, 
  Info, 
  Menu, 
  X,
  Server
} from 'lucide-react';

export function Navbar({ 
  activeTab, 
  onNavigate, 
  savedReportsCount = 0, 
  apiHealth = { ok: false, data: null } 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab) => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  const isConnected = apiHealth.ok;
  const isAiReady = apiHealth.ok && apiHealth.data?.aiConfigured;

  return (
    <nav className="navbar" aria-label="Main Navigation">
      <div className="navbar-inner">
        {/* Brand */}
        <button 
          className="brand" 
          onClick={() => handleNav('home')} 
          aria-label="GroundTruth Home"
        >
          <div className="brand-icon-wrapper">
            <ShieldCheck size={22} strokeWidth={2.4} />
          </div>
          <span>GroundTruth</span>
        </button>

        {/* Desktop Nav Links */}
        <div className="nav-links" style={{ display: 'none' }} id="desktop-nav">
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleNav('home')}
          >
            <Home size={18} />
            <span>Home</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => handleNav('create')}
          >
            <PlusCircle size={18} />
            <span>Create Report</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => handleNav('reports')}
          >
            <FileText size={18} />
            <span>My Reports</span>
            {savedReportsCount > 0 && (
              <span className="nav-badge">{savedReportsCount}</span>
            )}
          </button>

          <button 
            className={`nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => handleNav('privacy')}
            title="Privacy & AI Disclaimers"
          >
            <Info size={18} />
            <span>Privacy</span>
          </button>

          {/* Backend Status Pill */}
          <div 
            className="api-pill" 
            title={
              !isConnected 
                ? 'Backend not reachable at http://localhost:5000' 
                : isAiReady 
                  ? `AI Provider Ready (${apiHealth.data?.model || 'Gemma 2'})` 
                  : 'Backend connected (AI API key needed in server/.env)'
            }
          >
            <div className={`api-dot ${isConnected ? (isAiReady ? 'connected' : 'warning') : ''}`} />
            <span>{isConnected ? (isAiReady ? 'AI Active' : 'API Key Setup') : 'Offline'}</span>
          </div>
        </div>

        {/* Mobile menu trigger */}
        <button 
          className="btn-ghost" 
          id="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          style={{ display: 'flex' }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Menu Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-light)',
          padding: '1rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.6rem'
        }}>
          <button 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => handleNav('home')}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Home size={18} />
            <span>Home</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => handleNav('create')}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <PlusCircle size={18} />
            <span>Create Report</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => handleNav('reports')}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <FileText size={18} />
            <span>My Reports</span>
            {savedReportsCount > 0 && (
              <span className="nav-badge" style={{ marginLeft: 'auto' }}>{savedReportsCount}</span>
            )}
          </button>
          <button 
            className={`nav-item ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => handleNav('privacy')}
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            <Info size={18} />
            <span>Privacy & Responsible AI</span>
          </button>

          <div style={{
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.85rem',
            color: 'var(--text-muted)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Server size={14} /> Backend Status:
            </span>
            <div className="api-pill">
              <div className={`api-dot ${isConnected ? (isAiReady ? 'connected' : 'warning') : ''}`} />
              <span>{isConnected ? (isAiReady ? 'AI Active' : 'API Key Needed') : 'Offline'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Responsive CSS helper */}
      <style>{`
        @media (min-width: 768px) {
          #desktop-nav { display: flex !important; }
          #mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
