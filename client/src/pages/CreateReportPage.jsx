import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  FileText, 
  Languages, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  FlaskConical,
  RotateCcw
} from 'lucide-react';
import { CATEGORIES } from '../utils/formatters';
import { SAMPLE_SCENARIOS } from '../utils/sampleScenarios';
import { CategoryIcon } from '../components/CategoryCard';
import { ReportCard } from '../components/ReportCard';
import { generateReportApi } from '../services/api';

export function CreateReportPage({ 
  initialCategory = '', 
  onSaveReport, 
  onToast, 
  apiHealth 
}) {
  // Form State
  const [category, setCategory] = useState(initialCategory || '');
  const [location, setLocation] = useState('');
  const [observation, setObservation] = useState('');
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [language, setLanguage] = useState('English');

  // UI state
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [apiError, setApiError] = useState(null);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [activeSampleId, setActiveSampleId] = useState(null);

  // Synchronize when initialCategory prop changes from external navigation
  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  // Animated loading step progression
  useEffect(() => {
    let interval;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < 2 ? prev + 1 : prev));
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingMessages = [
    'Transmitting observation to hosted Gemma AI model...',
    'Analyzing spatial context and structuring civic description...',
    'Formulating constructive next steps and verification items...'
  ];

  // Inline Validation
  const validateForm = () => {
    const newErrors = {};

    if (!category) {
      newErrors.category = 'Please select an issue category.';
    }

    if (!location || location.trim().length === 0) {
      newErrors.location = 'Please specify a location, street, or landmark.';
    } else if (location.trim().length > 200) {
      newErrors.location = 'Location must not exceed 200 characters.';
    }

    if (!observation || observation.trim().length === 0) {
      newErrors.observation = 'Please describe what you observed.';
    } else if (observation.trim().length < 5) {
      newErrors.observation = 'Please provide a more descriptive observation (at least 5 characters).';
    } else if (observation.trim().length > 1500) {
      newErrors.observation = 'Observation description must not exceed 1500 characters.';
    }

    if (additionalDetails && additionalDetails.trim().length > 1000) {
      newErrors.additionalDetails = 'Additional details must not exceed 1000 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Populate Demonstration Sample
  const handleLoadSample = (sample) => {
    setCategory(sample.category);
    setLocation(sample.location);
    setObservation(sample.observation);
    setAdditionalDetails(sample.additionalDetails);
    setLanguage(sample.language || 'English');
    setActiveSampleId(sample.id);
    setErrors({});
    setApiError(null);
    onToast(`Loaded sample scenario: "${sample.label}"`);
  };

  const handleClearSample = () => {
    setActiveSampleId(null);
  };

  // Submit and Generate
  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError(null);

    const payload = {
      category: category.trim(),
      location: location.trim(),
      observation: observation.trim(),
      additionalDetails: additionalDetails ? additionalDetails.trim() : '',
      language: language
    };

    try {
      const result = await generateReportApi(payload);
      setGeneratedReport(result);
      onToast('Report generated successfully with Gemma AI!');
    } catch (err) {
      console.error('Report generation error:', err);
      let userFriendlyMessage = err.message;
      let errorHint = null;

      if (err.code === 'MISSING_API_KEY' || err.status === 503) {
        userFriendlyMessage = 'AI API key is not configured on the backend.';
        errorHint = 'Please set AI_API_KEY in server/.env (e.g. your Groq or OpenRouter API key) and restart the server.';
      } else if (err.code === 'RATE_LIMITED' || err.status === 429) {
        userFriendlyMessage = 'The AI inference service is temporarily busy.';
        errorHint = 'Please wait 30 seconds and try generating again.';
      } else if (err.message && err.message.includes('Failed to fetch')) {
        userFriendlyMessage = 'Cannot connect to GroundTruth Express server.';
        errorHint = 'Ensure the backend server is running at http://localhost:5000.';
      }

      setApiError({
        message: userFriendlyMessage,
        hint: errorHint,
        details: err.details
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setGeneratedReport(null);
    setApiError(null);
    setActiveSampleId(null);
  };

  return (
    <div className="create-report-page">
      {/* If a report has been generated, show the Report Review Interface */}
      {generatedReport ? (
        <section aria-labelledby="generated-report-heading">
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h1 id="generated-report-heading" style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
                Review Generated Report
              </h1>
              <p style={{ fontSize: '0.92rem' }}>
                Review and refine the AI-structured report before sharing or saving to your records.
              </p>
            </div>
            <button 
              type="button" 
              className="btn-ghost" 
              onClick={handleReset}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RotateCcw size={15} />
              <span>Start New Report</span>
            </button>
          </div>

          <ReportCard
            report={generatedReport}
            onSave={(updated) => {
              onSaveReport(updated);
              onToast('Report saved to your local report history!');
            }}
            onCopy={(msg) => onToast(msg)}
            onReset={handleReset}
          />
        </section>
      ) : (
        /* Report Creation Form */
        <section aria-labelledby="create-report-heading">
          <div style={{ marginBottom: '1.75rem' }}>
            <h1 id="create-report-heading" style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>
              Create a Public-Space Report
            </h1>
            <p style={{ fontSize: '0.95rem' }}>
              Document an issue you noticed in your community or campus. Our AI assistant will structure it into an actionable memo.
            </p>
          </div>

          {/* Demonstration Mode Banner ("Try an Example") */}
          <div className="example-banner" role="region" aria-label="Demonstration mode">
            <div className="example-banner-text">
              <FlaskConical size={18} color="var(--civic-700)" />
              <span>
                <strong>Demonstration Mode:</strong> Try a pre-filled sample scenario to test the report workflow.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              {SAMPLE_SCENARIOS.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  className={`btn-secondary ${activeSampleId === sample.id ? 'active' : ''}`}
                  style={{
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.82rem',
                    backgroundColor: activeSampleId === sample.id ? 'var(--civic-50)' : 'var(--bg-card)',
                    borderColor: activeSampleId === sample.id ? 'var(--civic-700)' : 'var(--border-card)'
                  }}
                  onClick={() => handleLoadSample(sample)}
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {activeSampleId && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem 1rem',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              color: '#1E40AF'
            }}>
              <span>
                📌 <strong>Sample Content Loaded:</strong> This is a demonstration scenario for evaluation. It does not represent a verified real incident.
              </span>
              <button 
                type="button" 
                className="btn-ghost" 
                style={{ fontSize: '0.8rem', color: '#1E40AF', padding: '0.2rem 0.5rem' }}
                onClick={handleClearSample}
              >
                Clear Sample
              </button>
            </div>
          )}

          {/* API Error Notification */}
          {apiError && (
            <div style={{
              backgroundColor: 'var(--status-red-bg)',
              border: '1px solid #FCA5A5',
              borderRadius: 'var(--radius-md)',
              padding: '1.1rem 1.25rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <AlertCircle size={20} color="var(--status-red)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
              <div>
                <h4 style={{ color: '#991B1B', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                  {apiError.message}
                </h4>
                {apiError.hint && (
                  <p style={{ color: '#7F1D1D', fontSize: '0.86rem', marginTop: '0.25rem' }}>
                    {apiError.hint}
                  </p>
                )}
                {Array.isArray(apiError.details) && apiError.details.length > 0 && (
                  <ul style={{ color: '#7F1D1D', fontSize: '0.85rem', marginTop: '0.5rem', paddingLeft: '1.2rem' }}>
                    {apiError.details.map((d, i) => <li key={i}>{d}</li>)}
                  </ul>
                )}
                <p style={{ color: '#526058', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                  Your entered information has been preserved below.
                </p>
              </div>
            </div>
          )}

          {/* Report Form */}
          <form onSubmit={handleGenerate} noValidate className="card" style={{ padding: '2rem' }}>
            {/* 1. Category */}
            <div className="form-group">
              <label className="form-label">
                <span>1. Issue Category</span>
                <span className="label-required">* Required</span>
              </label>
              <div className="category-pill-grid">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-pill ${category === cat.id ? 'active' : ''}`}
                    onClick={() => {
                      setCategory(cat.id);
                      if (errors.category) {
                        setErrors(prev => ({ ...prev, category: null }));
                      }
                    }}
                  >
                    <CategoryIcon categoryName={cat.id} size={18} />
                    <span>{cat.title}</span>
                  </button>
                ))}
              </div>
              {errors.category && (
                <div className="form-error">
                  <AlertCircle size={14} />
                  <span>{errors.category}</span>
                </div>
              )}
            </div>

            {/* 2. Location */}
            <div className="form-group">
              <label htmlFor="report-location" className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <MapPin size={16} /> 2. Location or Landmark
                </span>
                <span className="label-required">* Required</span>
              </label>
              <input
                id="report-location"
                type="text"
                className={`form-control ${errors.location ? 'has-error' : ''}`}
                placeholder="e.g., Central Library East Steps, or Corner of 5th Ave & Pine St"
                value={location}
                maxLength={200}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (errors.location) {
                    setErrors(prev => ({ ...prev, location: null }));
                  }
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {errors.location ? (
                  <div className="form-error">
                    <AlertCircle size={14} />
                    <span>{errors.location}</span>
                  </div>
                ) : (
                  <span className="form-hint">No GPS required — just describe the spot.</span>
                )}
                <span className="char-counter">{location.length}/200</span>
              </div>
            </div>

            {/* 3. Observation */}
            <div className="form-group">
              <label htmlFor="report-observation" className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <FileText size={16} /> 3. Describe What You Observed
                </span>
                <span className="label-required">* Required</span>
              </label>
              <textarea
                id="report-observation"
                rows={5}
                className={`form-control ${errors.observation ? 'has-error' : ''}`}
                placeholder="Describe what you noticed. For example, the ramp near the library entrance is blocked by construction materials, leaving no wheelchair access."
                value={observation}
                maxLength={1500}
                onChange={(e) => {
                  setObservation(e.target.value);
                  if (errors.observation) {
                    setErrors(prev => ({ ...prev, observation: null }));
                  }
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {errors.observation ? (
                  <div className="form-error">
                    <AlertCircle size={14} />
                    <span>{errors.observation}</span>
                  </div>
                ) : (
                  <span className="form-hint">Be as specific as you can about what is damaged, blocked, or overflowing.</span>
                )}
                <span className="char-counter">{observation.length}/1500</span>
              </div>
            </div>

            {/* 4. Additional Details */}
            <div className="form-group">
              <label htmlFor="report-details" className="form-label">
                <span>4. Additional Details</span>
                <span className="label-optional">Optional</span>
              </label>
              <textarea
                id="report-details"
                rows={3}
                className={`form-control ${errors.additionalDetails ? 'has-error' : ''}`}
                placeholder="Optional extra context (e.g., time of day observed, temporary hazards, whether anyone was already notified)"
                value={additionalDetails}
                maxLength={1000}
                onChange={(e) => {
                  setAdditionalDetails(e.target.value);
                  if (errors.additionalDetails) {
                    setErrors(prev => ({ ...prev, additionalDetails: null }));
                  }
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {errors.additionalDetails ? (
                  <div className="form-error">
                    <AlertCircle size={14} />
                    <span>{errors.additionalDetails}</span>
                  </div>
                ) : (
                  <span className="form-hint">Avoid including names or personal contact numbers.</span>
                )}
                <span className="char-counter">{additionalDetails.length}/1000</span>
              </div>
            </div>

            {/* 5. Output Language */}
            <div className="form-group">
              <label htmlFor="report-language" className="form-label">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Languages size={16} /> 5. Output Language
                </span>
              </label>
              <select
                id="report-language"
                className="form-control"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ maxWidth: '280px' }}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (Experimental)</option>
              </select>
              <span className="form-hint">
                {language === 'Hindi' 
                  ? 'Gemma 2 supports Hindi. Please verify translations before submitting.' 
                  : 'Standard civic report format in English.'}
              </span>
            </div>

            {/* Submit Action */}
            <div style={{
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid var(--border-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                Reports are formatted via instruction-tuned open-weight AI.
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
                style={{ minWidth: '190px' }}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    <span>Structuring...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Generate Report</span>
                  </>
                )}
              </button>
            </div>

            {/* Progressive Loading State Card */}
            {isLoading && (
              <div style={{
                marginTop: '1.5rem',
                backgroundColor: 'var(--civic-50)',
                border: '1px solid var(--civic-100)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem'
              }}>
                <div className="spinner spinner-civic" style={{ width: 22, height: 22 }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--civic-900)' }}>
                    {loadingMessages[loadingStep]}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--civic-700)', marginTop: '0.15rem' }}>
                    Hosted Gemma model is synthesizing observations without fabricating details.
                  </div>
                </div>
              </div>
            )}
          </form>
        </section>
      )}
    </div>
  );
}
