/**
 * API client service for GroundTruth backend.
 * Reads base URL from VITE_API_BASE_URL.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) {
      return { ok: false, status: res.status };
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function generateReportApi(formData) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 35000);

  try {
    const res = await fetch(`${API_BASE_URL}/api/reports/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    let json;
    try {
      json = await res.json();
    } catch (parseErr) {
      throw new Error(`Server returned non-JSON response (${res.status} ${res.statusText})`);
    }

    if (!res.ok) {
      const message = json.message || json.error || `Request failed with HTTP status ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      err.code = json.code;
      err.details = json.details;
      throw err;
    }

    return json;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Report generation timed out. The AI server might be under heavy load, please try again.');
    }
    throw err;
  }
}
