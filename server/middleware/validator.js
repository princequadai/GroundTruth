/**
 * Input validation middleware for report generation requests.
 * Ensures clean inputs, trims whitespace, enforces bounds, and prevents injection.
 */

const ALLOWED_CATEGORIES = [
  'Accessibility',
  'Infrastructure',
  'Waste Management',
  'Water Issues',
  'Public Facilities',
  'Other'
];

const ALLOWED_LANGUAGES = ['English', 'Hindi'];

export function validateReportInput(req, res, next) {
  const { category, location, observation, additionalDetails, language } = req.body || {};

  const errors = [];

  // Category validation
  if (!category || typeof category !== 'string') {
    errors.push('Category is required and must be a valid text selection.');
  } else if (!ALLOWED_CATEGORIES.includes(category.trim())) {
    errors.push(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`);
  }

  // Location validation
  if (!location || typeof location !== 'string' || location.trim().length === 0) {
    errors.push('Location or landmark is required.');
  } else if (location.trim().length > 200) {
    errors.push('Location must not exceed 200 characters.');
  }

  // Observation validation
  if (!observation || typeof observation !== 'string' || observation.trim().length === 0) {
    errors.push('Observation description is required.');
  } else if (observation.trim().length < 5) {
    errors.push('Observation must be at least 5 characters long.');
  } else if (observation.trim().length > 1500) {
    errors.push('Observation description must not exceed 1500 characters.');
  }

  // Additional details validation (optional)
  if (additionalDetails !== undefined && additionalDetails !== null) {
    if (typeof additionalDetails !== 'string') {
      errors.push('Additional details must be text.');
    } else if (additionalDetails.trim().length > 1000) {
      errors.push('Additional details must not exceed 1000 characters.');
    }
  }

  // Language validation
  const targetLanguage = language && typeof language === 'string' ? language.trim() : 'English';
  if (!ALLOWED_LANGUAGES.includes(targetLanguage)) {
    errors.push(`Output language must be one of: ${ALLOWED_LANGUAGES.join(', ')}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors
    });
  }

  // Attach sanitized fields to req.sanitizedBody
  req.sanitizedBody = {
    category: category.trim(),
    location: location.trim(),
    observation: observation.trim(),
    additionalDetails: additionalDetails ? additionalDetails.trim() : '',
    language: targetLanguage
  };

  next();
}
