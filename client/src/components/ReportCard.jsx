import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Bookmark, 
  BookmarkCheck, 
  Edit3, 
  Trash2, 
  MapPin, 
  AlertCircle, 
  ArrowRight, 
  RotateCcw,
  Cpu
} from 'lucide-react';
import { CategoryIcon } from './CategoryCard';
import { formatDate, formatReportForClipboard } from '../utils/formatters';

export function ReportCard({ 
  report, 
  onSave, 
  onDelete, 
  onCopy, 
  onReset,
  isSavedView = false 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(isSavedView || Boolean(report.id));

  // Editable local state
  const [editedTitle, setEditedTitle] = useState(report.title || '');
  const [editedLocation, setEditedLocation] = useState(report.location || '');
  const [editedDescription, setEditedDescription] = useState(report.description || '');
  const [editedAction, setEditedAction] = useState(report.suggestedAction || '');

  const handleCopy = () => {
    const currentReport = {
      ...report,
      title: editedTitle,
      location: editedLocation,
      description: editedDescription,
      suggestedAction: editedAction
    };
    const text = formatReportForClipboard(currentReport);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      if (onCopy) onCopy('Report copied to clipboard in clean civic format.');
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  };

  const handleSave = () => {
    const updated = {
      ...report,
      title: editedTitle,
      location: editedLocation,
      description: editedDescription,
      suggestedAction: editedAction
    };
    if (onSave) {
      onSave(updated);
      setIsSaved(true);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedTitle(report.title || '');
    setEditedLocation(report.location || '');
    setEditedDescription(report.description || '');
    setEditedAction(report.suggestedAction || '');
    setIsEditing(false);
  };

  return (
    <article className="report-card" aria-label={`Report: ${report.title}`}>
      {/* Header */}
      <div className="report-header">
        <div className="report-title-area">
          {isEditing ? (
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="form-label">Report Title</label>
              <input
                type="text"
                className="form-control"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
            </div>
          ) : (
            <h2 className="report-title">{editedTitle}</h2>
          )}

          <div className="report-meta-badges">
            <span className="badge badge-category">
              <CategoryIcon categoryName={report.category} size={14} />
              {report.category}
            </span>

            <span className="badge badge-location">
              <MapPin size={13} />
              {isEditing ? (
                <input
                  type="text"
                  className="form-control"
                  style={{ padding: '0.15rem 0.4rem', fontSize: '0.8rem', width: '200px' }}
                  value={editedLocation}
                  onChange={(e) => setEditedLocation(e.target.value)}
                  placeholder="Location"
                />
              ) : (
                editedLocation
              )}
            </span>

            {report.modelUsed && (
              <span className="badge badge-model" title={`Structured by ${report.modelUsed}`}>
                <Cpu size={12} />
                {report.modelUsed}
              </span>
            )}

            {(report.createdAt || report.generatedAt) && (
              <span className="badge badge-location" style={{ fontSize: '0.75rem' }}>
                {formatDate(report.createdAt || report.generatedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Action icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setIsEditing(!isEditing)}
            title={isEditing ? 'Cancel editing' : 'Edit report details'}
          >
            <Edit3 size={16} />
            <span>{isEditing ? 'Cancel Edit' : 'Edit'}</span>
          </button>

          {isSavedView && onDelete && (
            <button
              type="button"
              className="btn-danger"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
              onClick={() => onDelete(report.id)}
              title="Delete report"
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Description Section */}
      <div className="report-section">
        <div className="report-section-title">
          <span>Observed Issue Description</span>
        </div>
        {isEditing ? (
          <textarea
            className="form-control"
            rows={5}
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
          />
        ) : (
          <div className="report-section-content">
            {editedDescription}
          </div>
        )}
      </div>

      {/* Suggested Action */}
      <div className="report-section">
        <div className="report-section-title">
          <ArrowRight size={15} />
          <span>Recommended Next Action</span>
        </div>
        {isEditing ? (
          <input
            type="text"
            className="form-control"
            value={editedAction}
            onChange={(e) => setEditedAction(e.target.value)}
          />
        ) : (
          <div 
            className="report-section-content" 
            style={{ backgroundColor: 'var(--civic-50)', borderColor: 'var(--civic-100)', color: 'var(--civic-900)' }}
          >
            {editedAction}
          </div>
        )}
      </div>

      {/* Missing Information / Items to verify */}
      {Array.isArray(report.missingInformation) && report.missingInformation.length > 0 && (
        <div className="report-section">
          <div className="report-section-title" style={{ color: '#B45309' }}>
            <AlertCircle size={15} />
            <span>Items To Verify Before Submission</span>
          </div>
          <ul className="missing-info-list">
            {report.missingInformation.map((item, idx) => (
              <li key={idx} className="missing-info-item">
                <span style={{ fontWeight: 600 }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer / Actions Bar */}
      <div className="report-actions-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={handleCopy}
            title="Copy plain-text formatted report to clipboard"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Formatted Report'}</span>
          </button>

          {isEditing ? (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleSave}
            >
              <Check size={16} />
              <span>Save Changes</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-secondary"
              onClick={handleSave}
              title="Save report to local browser storage"
            >
              {isSaved ? <BookmarkCheck size={16} color="var(--civic-700)" /> : <Bookmark size={16} />}
              <span>{isSaved ? 'Saved in My Reports' : 'Save Report'}</span>
            </button>
          )}
        </div>

        {onReset && (
          <button
            type="button"
            className="btn-ghost"
            onClick={onReset}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RotateCcw size={15} />
            <span>Create Another Report</span>
          </button>
        )}
      </div>
    </article>
  );
}
