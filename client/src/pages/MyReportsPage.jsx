import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  PlusCircle, 
  FileText, 
  Info, 
  AlertCircle,
  Copy,
  Check,
  CheckCircle2
} from 'lucide-react';
import { CATEGORIES } from '../utils/formatters';
import { ReportCard } from '../components/ReportCard';

export function MyReportsPage({ 
  reports = [], 
  onSaveReport, 
  onDeleteReport, 
  onClearAllReports, 
  onNavigate, 
  onToast 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filtered reports calculation
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      // Category filter
      if (selectedCategory !== 'All' && report.category !== selectedCategory) {
        return false;
      }

      // Search query (matches title, location, description, or action)
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = (report.title || '').toLowerCase().includes(query);
        const matchesLocation = (report.location || '').toLowerCase().includes(query);
        const matchesDescription = (report.description || '').toLowerCase().includes(query);
        const matchesAction = (report.suggestedAction || '').toLowerCase().includes(query);
        return matchesTitle || matchesLocation || matchesDescription || matchesAction;
      }

      return true;
    });
  }, [reports, selectedCategory, searchQuery]);

  const handleClearAll = () => {
    onClearAllReports();
    setShowClearConfirm(false);
    onToast('All saved reports have been removed from browser storage.');
  };

  return (
    <div className="my-reports-page">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>
            My Saved Reports
          </h1>
          <p style={{ fontSize: '0.95rem' }}>
            Review, edit, and export reports stored locally in your browser session.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {reports.length > 0 && (
            <button
              type="button"
              className="btn-danger"
              style={{ fontSize: '0.85rem' }}
              onClick={() => setShowClearConfirm(true)}
            >
              Clear All Reports
            </button>
          )}

          <button
            type="button"
            className="btn-primary"
            onClick={() => onNavigate('create')}
          >
            <PlusCircle size={17} />
            <span>New Report</span>
          </button>
        </div>
      </div>

      {/* Local Storage Privacy / Transparency Banner */}
      <div style={{
        backgroundColor: 'var(--bg-subtle)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1.1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        fontSize: '0.86rem',
        color: 'var(--text-muted)'
      }}>
        <Info size={18} color="var(--civic-700)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Stored Locally:</strong> These {reports.length} report(s) are stored only on this device’s browser storage. They are not sent to any central server or public database.
        </span>
      </div>

      {/* Filter and Search Bar */}
      {reports.length > 0 && (
        <div className="card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            {/* Search Input */}
            <div style={{
              flex: 1,
              minWidth: '220px',
              position: 'relative'
            }}>
              <Search 
                size={16} 
                style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-light)'
                }} 
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search by title, location, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.3rem' }}
                aria-label="Search reports"
              />
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className={`btn-secondary ${selectedCategory === 'All' ? 'active' : ''}`}
                style={{
                  padding: '0.45rem 0.8rem',
                  fontSize: '0.82rem',
                  backgroundColor: selectedCategory === 'All' ? 'var(--civic-50)' : 'var(--bg-card)',
                  borderColor: selectedCategory === 'All' ? 'var(--civic-700)' : 'var(--border-card)',
                  color: selectedCategory === 'All' ? 'var(--civic-900)' : 'var(--text-muted)',
                  fontWeight: selectedCategory === 'All' ? 700 : 500
                }}
                onClick={() => setSelectedCategory('All')}
              >
                All ({reports.length})
              </button>

              {CATEGORIES.map((cat) => {
                const count = reports.filter(r => r.category === cat.id).length;
                if (count === 0) return null;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`btn-secondary ${isSelected ? 'active' : ''}`}
                    style={{
                      padding: '0.45rem 0.8rem',
                      fontSize: '0.82rem',
                      backgroundColor: isSelected ? 'var(--civic-50)' : 'var(--bg-card)',
                      borderColor: isSelected ? 'var(--civic-700)' : 'var(--border-card)',
                      color: isSelected ? 'var(--civic-900)' : 'var(--text-muted)',
                      fontWeight: isSelected ? 700 : 500
                    }}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.title} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      {reports.length === 0 ? (
        /* Empty State */
        <div className="card" style={{
          textAlign: 'center',
          padding: '4rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--civic-50)',
            color: 'var(--civic-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem' }}>No Reports Stored Yet</h2>
          <p style={{ maxWidth: '420px', fontSize: '0.95rem' }}>
            Whenever you generate and save a report, it will be kept here locally for your future reference and sharing.
          </p>
          <button
            type="button"
            className="btn-primary"
            style={{ marginTop: '0.5rem' }}
            onClick={() => onNavigate('create')}
          >
            <PlusCircle size={18} />
            <span>Create Your First Report</span>
          </button>
        </div>
      ) : filteredReports.length === 0 ? (
        /* Search/Filter Yielded 0 Results */
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
            No reports matched your search query "{searchQuery}" or selected filter.
          </p>
          <button
            type="button"
            className="btn-secondary"
            style={{ marginTop: '1rem' }}
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Render Report Cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              isSavedView={true}
              onSave={(updated) => {
                onSaveReport(updated);
                onToast('Report updated successfully!');
              }}
              onDelete={(reportId) => {
                if (window.confirm('Are you sure you want to delete this report from local storage?')) {
                  onDeleteReport(reportId);
                  onToast('Report deleted.');
                }
              }}
              onCopy={(msg) => onToast(msg)}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal for Clear All */}
      {showClearConfirm && (
        <div className="modal-overlay" onClick={() => setShowClearConfirm(false)} role="dialog">
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
              Clear All Saved Reports?
            </h3>
            <p style={{ fontSize: '0.92rem', marginBottom: '1.5rem' }}>
              This will permanently delete all {reports.length} report(s) from your browser's local storage. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleClearAll}
              >
                Yes, Delete All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
