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

export interface RequestListItem {
  id: number;
  kind: string;
  title: string;
  status: string;
  purpose: string | null;
  return_by: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  created_at: string;
  approved_at: string | null;
  facility_id: number | null;
  facility_code: string | null;
  facility_name: string | null;
  requester_name: string;
}

export interface RequestDetail {
  request: RequestListItem & {
    description: string | null;
    requester_id: number;
    requester_email: string;
    sponsor_id: number | null;
    sponsor_name: string | null;
    sponsor_email: string | null;
    sponsor_dept: string | null;
    facility_category: string | null;
    submitted_at: string | null;
    completed_at: string | null;
  };
  items: Array<{
    id: number;
    item_type: string;
    quantity: number;
    unit: string;
    notes: string | null;
    menu_item_name: string | null;
    price_cents: number | null;
    inventory_item_name: string | null;
    sku: string | null;
  }>;
  approvals: Array<{
    id: number;
    decision: string;
    comments: string | null;
    decided_at: string;
    approver_role: string;
    approver_name: string;
  }>;
}

export async function getRequests(params?: { user_id?: number; status?: string }): Promise<RequestListItem[]> {
  const url = new URL(`${API_BASE}/api/requests`);
  if (params?.user_id) url.searchParams.set('user_id', String(params.user_id));
  if (params?.status) url.searchParams.set('status', params.status);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch requests: ${res.status}`);
  const data = await res.json();
  return data.requests ?? [];
}

export async function getRequestDetail(id: number): Promise<RequestDetail | null> {
  const res = await fetch(`${API_BASE}/api/requests/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch request: ${res.status}`);
  return res.json();
}