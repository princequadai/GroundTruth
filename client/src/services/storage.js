/**
 * LocalStorage service for GroundTruth reports.
 * All reports are persisted client-side in the user's browser with zero external DB tracking.
 */

const STORAGE_KEY = 'groundtruth_saved_reports_v1';

export function generateReportId() {
  return 'gt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
}

export function getSavedReports() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(item => item && typeof item === 'object' && item.id);
  } catch (err) {
    console.error('Failed to parse saved reports from localStorage:', err);
    return [];
  }
}

export function saveReportToStorage(report) {
  try {
    const existing = getSavedReports();
    const id = report.id || generateReportId();
    const createdAt = report.createdAt || new Date().toISOString();

    const newReport = {
      ...report,
      id,
      createdAt,
      lastModified: new Date().toISOString()
    };

    // If already exists, replace it, otherwise prepend
    const index = existing.findIndex(item => item.id === id);
    let updated;
    if (index >= 0) {
      updated = [...existing];
      updated[index] = newReport;
    } else {
      updated = [newReport, ...existing];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newReport;
  } catch (err) {
    console.error('Failed to save report to localStorage:', err);
    throw new Error('Could not persist report to browser localStorage.');
  }
}

export function deleteReportFromStorage(reportId) {
  try {
    const existing = getSavedReports();
    const filtered = existing.filter(item => item.id !== reportId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Failed to delete report from localStorage:', err);
    throw new Error('Could not delete report from browser localStorage.');
  }
}

export function clearAllReportsFromStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (err) {
    console.error('Failed to clear reports from localStorage:', err);
    throw new Error('Could not clear reports from browser localStorage.');
  }
}
