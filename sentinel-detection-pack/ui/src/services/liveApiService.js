const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7071/api';

async function getJson(path, fallback = []) {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const payload = await response.json();
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
};

export { API_BASE_URL };
