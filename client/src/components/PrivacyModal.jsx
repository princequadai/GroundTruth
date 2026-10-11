import React from 'react';
import { ShieldCheck, Lock, AlertTriangle, Eye, CheckCircle2, X } from 'lucide-react';

export function PrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-icon-wrapper" style={{ width: 34, height: 34 }}>
              <ShieldCheck size={20} />
            </div>
            <h2 style={{ fontSize: '1.3rem' }}>Privacy & Responsible AI</h2>
          </div>
          <button 
            className="btn-ghost" 
            onClick={onClose} 
            aria-label="Close dialog"
            style={{ padding: '0.3rem' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <Lock size={20} color="var(--civic-700)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>Local-First Storage</h4>
              <p style={{ fontSize: '0.88rem' }}>
                Your saved reports are stored strictly in your browser’s <code>localStorage</code>. GroundTruth does not operate an external database or account tracker. If you clear your browser cache, saved reports will be removed.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <Eye size={20} color="var(--civic-700)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>Remote AI Inference & Sensitive Data</h4>
              <p style={{ fontSize: '0.88rem' }}>
                When you click "Generate Report", observation text and location are transmitted to the backend to run inference via an instruction-tuned open-weight model (Gemma). <strong>Please do not enter personally identifiable information (PII)</strong> such as student IDs, private phone numbers, or residential addresses.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <AlertTriangle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>No Automatic Authority Submission</h4>
              <p style={{ fontSize: '0.88rem' }}>
                GroundTruth is a drafting and structuring assistant. It <strong>never</strong> automatically files tickets, work orders, or legal reports with city councils or campus administration. You maintain full ownership of what you submit.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <CheckCircle2 size={20} color="var(--civic-700)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.2rem' }}>Human Review Requirement</h4>
              <p style={{ fontSize: '0.88rem' }}>
                Generative AI models may produce inaccuracies or omissions. You must review and edit all generated summaries and suggested actions prior to sharing. GroundTruth does not verify whether an issue exists or has been resolved.
              </p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={onClose}>
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
