const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api';

async function getEnvelope(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, payload };
}

async function getJson(path, fallback = []) {
  try {
    const { ok, status, payload } = await getEnvelope(path);
    if (!ok) {
      throw new Error(`Request failed with status ${status}`);
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    if (Array.isArray(payload?.Data)) {
      return payload.Data;
    }

    if (Array.isArray(payload?.items)) {
      return payload.items;
    }

    if (Array.isArray(payload?.Items)) {
      return payload.Items;
    }

    return payload ?? fallback;
  } catch (error) {
    console.error(`Live API Error (${path}):`, error);
    return fallback;
  }
}

export const liveApiService = {
  getIncidents: () => getJson('/incidents'),
  getAlerts: () => getJson('/alerts'),
  getTableFreshness: () => getJson('/table-freshness'),
  getKubernetesEvents: () => getJson('/live/kubernetes'),
  getInfrastructurePosture: () => getJson('/live/posture'),
  getPostureFindings: () => getJson('/live/posture-findings'),
  getApiStatus: async () => {
    try {
      const { ok, payload } = await getEnvelope('/table-freshness');
      return {
        connected: ok,
        status: payload?.Status || payload?.status || (ok ? 'ok' : 'error'),
        warning: payload?.Warning || payload?.warning || null,
      };
    } catch (error) {
      console.error('Live API Status Error:', error);
      return { connected: false, status: 'offline', warning: error.message };
    }
  },
};

export { API_BASE_URL };
