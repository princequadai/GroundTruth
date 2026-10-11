/**
 * Formatting utilities for dates, categories, and clipboard report text.
 */

export const CATEGORIES = [
  {
    id: 'Accessibility',
    title: 'Accessibility',
    icon: 'Accessibility',
    description: 'Blocked ramps, broken elevators, non-functional tactile paths, or obstructed doorways.'
  },
  {
    id: 'Infrastructure',
    title: 'Infrastructure',
    icon: 'HardHat',
    description: 'Damaged sidewalks, potholes, broken railings, cracked curbs, or roadway hazards.'
  },
  {
    id: 'Waste Management',
    title: 'Waste Management',
    icon: 'Trash2',
    description: 'Overflowing bins, illegal litter dumping, unsorted hazardous debris, or missed collection.'
  },
  {
    id: 'Water Issues',
    title: 'Water Issues',
    icon: 'Droplets',
    description: 'Broken water pipes, leaking drinking fountains, clogged stormwater drains, or stagnant pooling.'
  },
  {
    id: 'Public Facilities',
    title: 'Public Facilities',
    icon: 'Building2',
    description: 'Restroom issues, broken park benches, street lighting failures, or damaged playground equipment.'
  },
  {
    id: 'Other',
    title: 'Other',
    icon: 'AlertTriangle',
    description: 'Campus maintenance needs, general pedestrian safety hazards, or public space concerns.'
  }
];

export function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
}

/**
 * Formats a report object into a professional plain-text civic report for copying.
 */
export function formatReportForClipboard(report) {
  const parts = [];

  parts.push(`[GROUNDTRUTH CIVIC REPORT]`);
  parts.push(`TITLE: ${report.title || 'Untitled Report'}`);
  parts.push(`CATEGORY: ${report.category || 'Public Space'}`);
  parts.push(`LOCATION: ${report.location || 'Not Specified'}`);
  if (report.createdAt || report.generatedAt) {
    parts.push(`RECORDED: ${formatDate(report.createdAt || report.generatedAt)}`);
  }
  parts.push('');
  parts.push('DESCRIPTION:');
  parts.push(report.description || 'No description provided.');
  parts.push('');
  parts.push('SUGGESTED NEXT STEP:');
  parts.push(report.suggestedAction || 'Review and submit to the responsible facility management team.');

  if (Array.isArray(report.missingInformation) && report.missingInformation.length > 0) {
    parts.push('');
    parts.push('ITEMS TO VERIFY BEFORE SUBMISSION:');
    report.missingInformation.forEach((item) => {
      parts.push(`* ${item}`);
    });
  }

  parts.push('');
  parts.push('----------------------------------------');
  parts.push('Generated via GroundTruth Civic Reporting Assistant');
  parts.push('Notice it. Document it. Do something about it.');

  return parts.join('\n');
}
