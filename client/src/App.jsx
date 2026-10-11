import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Toast } from './components/Toast';
import { PrivacyModal } from './components/PrivacyModal';
import { HomePage } from './pages/HomePage';
import { CreateReportPage } from './pages/CreateReportPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { 
  getSavedReports, 
  saveReportToStorage, 
  deleteReportFromStorage, 
  clearAllReportsFromStorage 
} from './services/storage';
import { checkHealth } from './services/api';
import { ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [savedReports, setSavedReports] = useState([]);
  const [apiHealth, setApiHealth] = useState({ ok: false, data: null });
  const [toast, setToast] = useState(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // Load saved reports on mount
  useEffect(() => {
    const loaded = getSavedReports();
    setSavedReports(loaded);
  }, []);

  // Check backend health
  const refreshHealth = useCallback(async () => {
    const health = await checkHealth();
    setApiHealth(health);
  }, []);

  useEffect(() => {
    refreshHealth();
    const interval = setInterval(refreshHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [refreshHealth]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleNavigate = (tab) => {
    if (tab === 'privacy') {
      setIsPrivacyModalOpen(true);
      return;
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategoryFromHome = (category) => {
    setSelectedCategory(category);
    setActiveTab('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveReport = (report) => {
    const saved = saveReportToStorage(report);
    setSavedReports(getSavedReports());
    return saved;
  };

  const handleDeleteReport = (reportId) => {
    const updated = deleteReportFromStorage(reportId);
    setSavedReports(updated);
  };

  const handleClearAllReports = () => {
    const cleared = clearAllReportsFromStorage();
    setSavedReports(cleared);
  };

  return (
    <div className="app-container">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onNavigate={handleNavigate}
        savedReportsCount={savedReports.length}
        apiHealth={apiHealth}
      />

      {/* Main Page Content */}
      <main className="main-content" id="main-content">
        {activeTab === 'home' && (
          <HomePage
            onSelectCategory={handleSelectCategoryFromHome}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'create' && (
          <CreateReportPage
            initialCategory={selectedCategory}
            onSaveReport={handleSaveReport}
            onToast={showToast}
            apiHealth={apiHealth}
          />
        )}

        {activeTab === 'reports' && (
          <MyReportsPage
            reports={savedReports}
            onSaveReport={handleSaveReport}
            onDeleteReport={handleDeleteReport}
            onClearAllReports={handleClearAllReports}
            onNavigate={handleNavigate}
            onToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, color: 'var(--civic-900)' }}>
              <ShieldCheck size={18} color="var(--civic-700)" />
              <span>GroundTruth</span>
            </div>
            <p className="footer-text" style={{ marginTop: '0.2rem' }}>
              Notice it. Document it. Do something about it.
            </p>
          </div>

          <div className="footer-links">
            <button 
              type="button" 
              className="btn-ghost" 
              style={{ fontSize: '0.85rem' }}
              onClick={() => setIsPrivacyModalOpen(true)}
            >
              Privacy & Responsible AI
            </button>

            <span className="footer-text" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              Built for Open-Source Civic AI
            </span>
          </div>
        </div>
      </footer>

      {/* Global Toast Notifications */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Privacy and Responsible AI Modal */}
      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />
    </div>
  );
}
