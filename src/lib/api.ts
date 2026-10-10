const API_BASE = import.meta.env.VITE_API_URL ?? '';

export interface Facility {
  id: number;
  code: string;
  name: string;
  category: string;
  kind: string;
  description: string;
  contact: string | null;
  equipment: string[];
  location: string;
  capacity: number;
  open_hours: string | null;
  status: string;
}

export interface HealthResponse {
  status: string;
  environment: string;
  facilities: number;
  time: string;
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export async function getFacilities(params?: { category?: string; q?: string }): Promise<Facility[]> {
  const url = new URL(`${API_BASE}/api/facilities`);
  if (params?.category) url.searchParams.set('category', params.category);
  if (params?.q) url.searchParams.set('q', params.q);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch facilities: ${res.status}`);
  const data = await res.json();
  return data.facilities ?? [];
}

export async function getFacility(id: number): Promise<Facility | null> {
  const res = await fetch(`${API_BASE}/api/facilities/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch facility: ${res.status}`);
  const data = await res.json();
  return data.facility ?? null;
}