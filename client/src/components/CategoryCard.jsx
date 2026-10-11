import React from 'react';
import { 
  Accessibility, 
  HardHat, 
  Trash2, 
  Droplets, 
  Building2, 
  AlertTriangle 
} from 'lucide-react';

const ICON_MAP = {
  'Accessibility': Accessibility,
  'Infrastructure': HardHat,
  'Waste Management': Trash2,
  'Water Issues': Droplets,
  'Public Facilities': Building2,
  'Other': AlertTriangle
};

export function CategoryCard({ category, isSelected, onClick }) {
  const IconComponent = ICON_MAP[category.id] || AlertTriangle;

  return (
    <button
      type="button"
      className={`category-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(category.id)}
      aria-pressed={isSelected}
    >
      <div className="category-card-icon">
        <IconComponent size={24} />
      </div>
      <div>
        <h3>{category.title}</h3>
        <p>{category.description}</p>
      </div>
    </button>
  );
}

export function CategoryIcon({ categoryName, size = 18 }) {
  const IconComponent = ICON_MAP[categoryName] || AlertTriangle;
  return <IconComponent size={size} />;
}
