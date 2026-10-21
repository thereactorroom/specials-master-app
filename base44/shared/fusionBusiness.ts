// ── fusionBusiness ──────────────────────────────────────────────────────────
// Shared Fusion service-directory helpers used by more than one backend
// function: fetchFusionBusiness (a single business) and getBusinessContacts
// (a batch, for the contact chooser shown on specials).

export interface FusionBusinessResult {
  business?: any;
  error?: string;
  status?: number;
}

// Fetches one business from Fusion's public service-directory API.
// Returns { business } on success, or { error, status } when Fusion has no
// usable data (mirrors the responses getFusionBusiness returns to callers).
export async function fetchFusionBusiness(id: number, baseUrl: string): Promise<FusionBusinessResult> {
  const url = `${baseUrl}/modules/module_dev/service_directory/v2/businesses/get?id=${id}`;
  console.log('[fusionBusiness] Requesting URL:', url);
  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  console.log('[fusionBusiness] Response status:', res.status);
  if (!res.ok) {
    return { error: `Fusion API failed: ${res.status}`, status: 404 };
  }
  // Some ids return an HTML error page instead of JSON — treat as not found.
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return { error: 'No business data returned', status: 404 };
  }
  const json = await res.json().catch(() => null);
  if (!json || json.status !== true || !json.data) {
    return { error: 'No business data returned', status: 404 };
  }
  return { business: json.data };
}

// Maps the raw Fusion business payload to our Business entity shape.
export function mapBusinessToEntity(b: any) {
  return {
    business_id: b.id,
    unique_key_id: b.unique_key_id ?? 0,
    user_key_id: b.user_key_id ?? 0,
    user_id: b.user_id ?? 0,
    community_id: b.community_id ?? 0,
    content_id: b.content_id ?? "",
    business_name: b.business_name ?? "",
    country_code: b.country_code ?? "",
    contact_number: b.contact_number ?? "",
    office_number: b.office_number ?? "",
    email: b.email ?? "",
    person_name: b.person_name ?? "",
    person_surname: b.person_surname ?? "",
    description: b.description ?? "",
    logo: b.logo ?? "",
    whatsapp: b.whatsapp ?? "",
    google_url: b.google_url ?? "",
    website_url: b.website_url ?? "",
    facebook_url: b.facebook_url ?? "",
    x_url: b.x_url ?? "",
    instagram_url: b.instagram_url ?? "",
  };
}

// The fields the contact chooser needs. Kept here so the batch endpoint and the
// business mapping stay in step.
export const BUSINESS_CONTACT_FIELDS = [
  "business_id",
  "business_name",
  "country_code",
  "contact_number",
  "office_number",
  "whatsapp",
  "google_url",
  "website_url",
  "facebook_url",
  "x_url",
  "instagram_url",
] as const;

// Narrows a Business record down to just the contact fields.
export function pickBusinessContacts(b: any) {
  const out: Record<string, any> = {};
  for (const field of BUSINESS_CONTACT_FIELDS) {
    out[field] = b?.[field] ?? (field === "business_id" ? 0 : "");
  }
  return out;
}