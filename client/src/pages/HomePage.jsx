import React from 'react';
import { 
  PlusCircle, 
  FileText, 
  Eye, 
  Sparkles, 
  Send, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2,
  FileCheck
} from 'lucide-react';
import { CATEGORIES } from '../utils/formatters';
import { CategoryCard } from '../components/CategoryCard';

export function HomePage({ onSelectCategory, onNavigate }) {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-badge">
          <Eye size={14} />
          <span>Notice it. Document it. Do something about it.</span>
        </div>

        <h1 id="hero-title" className="hero-title">
          See a problem? <br />
          <span style={{ color: 'var(--civic-700)' }}>Make it actionable.</span>
        </h1>

        <p className="hero-subtitle">
          Turn everyday observations into clear, actionable reports with AI assistance.
          Help make your campus and public spaces better.
        </p>

        <div className="hero-actions">
          <button 
            className="btn-primary" 
            onClick={() => onNavigate('create')}
            aria-label="Create a new report"
          >
            <PlusCircle size={18} />
            <span>Create a Report</span>
          </button>

          <button 
            className="btn-secondary" 
            onClick={() => onNavigate('reports')}
            aria-label="View previously saved reports"
          >
            <FileText size={18} />
            <span>View My Reports</span>
          </button>
        </div>

        {/* Visual CSS-based Journey Graphic: Notice -> Document -> Take Action */}
        <div className="journey-container" aria-label="Reporting Journey">
          <div className="journey-steps">
            <div className="journey-step">
              <div className="journey-icon">
                <Eye size={24} />
              </div>
              <div className="journey-label">1. Notice</div>
              <div className="journey-desc">Spot a safety, accessibility, or maintenance problem.</div>
            </div>

            <div className="journey-arrow">
              <ArrowRight size={22} />
            </div>

            <div className="journey-step">
              <div className="journey-icon">
                <Sparkles size={24} />
              </div>
              <div className="journey-label">2. Document</div>
              <div className="journey-desc">Gemma AI structures your notes into a clear, professional report.</div>
            </div>

            <div className="journey-arrow">
              <ArrowRight size={22} />
            </div>

            <div className="journey-step">
              <div className="journey-icon">
                <Send size={24} />
              </div>
              <div className="journey-label">3. Take Action</div>
              <div className="journey-desc">Review, copy, and send directly to responsible coordinators.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Issue Categories Section */}
      <section style={{ marginTop: '3.5rem' }} aria-labelledby="categories-heading">
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h2 id="categories-heading" style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>
            What kind of issue did you notice?
          </h2>
          <p style={{ maxWidth: '580px', margin: '0 auto', fontSize: '0.95rem' }}>
            Select an issue category below to start drafting your report.
          </p>
        </div>

        <div className="category-grid">
          {CATEGORIES.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              isSelected={false}
              onClick={(catId) => onSelectCategory(catId)}
            />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ marginTop: '4rem' }} aria-labelledby="how-it-works-heading">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 id="how-it-works-heading" style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>
            How GroundTruth Works
          </h2>
          <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '0.95rem' }}>
            A lightweight assistant that removes the friction of civic reporting.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem'
        }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--civic-50)',
              color: 'var(--civic-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700
            }}>
              1
            </div>
            <h3 style={{ fontSize: '1.15rem' }}>Describe what you observed</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Type your observation in plain words without worrying about formal terminology. Note the location, landmark, and what you saw.
            </p>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--civic-50)',
              color: 'var(--civic-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700
            }}>
              2
            </div>
            <h3 style={{ fontSize: '1.15rem' }}>Let AI organize the information</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Our hosted open-weight model refines your observations into a concise, professional summary, highlights missing details to verify, and suggests a concrete next step.
            </p>
          </div>

          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--civic-50)',
              color: 'var(--civic-700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700
            }}>
              3
            </div>
            <h3 style={{ fontSize: '1.15rem' }}>Review and share your report</h3>
            <p style={{ fontSize: '0.9rem' }}>
              Review the structured draft, edit any field as needed, copy it to your clipboard with one click, or save it to your local report history.
            </p>
          </div>
        </div>
      </section>

      {/* Important Civic Disclaimer Card */}
      <section style={{ marginTop: '3.5rem' }}>
        <div className="civic-notice">
          <ShieldAlert size={24} color="var(--civic-800)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <div>
            <h3 style={{ fontSize: '1rem', color: 'var(--civic-900)', marginBottom: '0.25rem' }}>
              Important Note on Civic Reporting
            </h3>
            <p>
              AI-generated reports must be reviewed for accuracy before sharing. GroundTruth is a documentation assistant and <strong>does not automatically submit reports to public authorities, emergency services, or campus management</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
