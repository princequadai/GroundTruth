import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="#52B788" />,
    error: <AlertCircle size={18} color="#EF4444" />,
    info: <Info size={18} color="#60A5FA" />
  };

  return (
    <div className="toast-container" role="region" aria-live="polite">
      <div className="toast">
        {icons[toast.type] || icons.info}
        <span>{toast.message}</span>
        <button 
          onClick={onClose} 
          style={{ color: '#9CA3AF', marginLeft: '0.5rem', display: 'flex' }}
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
