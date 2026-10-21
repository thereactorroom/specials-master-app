import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

// ── updateBusinessFromFusion ─────────────────────────────────────────────────
// Remote endpoint for Fusion onQ: POST { business_id, updates: { ...changed
// fields } } with "Authorization: Bearer <token>" to update the matching
// Business record. Only fields defined on the Business entity are accepted and
// business_id can never be changed.
//
// URL: https://<this-app>.base44.app/functions/updateBusinessFromFusion

// Fields Fusion onQ may update, grouped by type.
const STRING_FIELDS = [
  'content_id', 'business_name', 'country_code', 'contact_number', 'office_number',
  'email', 'person_name', 'person_surname', 'description', 'logo', 'whatsapp',
  'google_url', 'website_url', 'facebook_url', 'x_url', 'instagram_url',
];
const INT_FIELDS = ['unique_key_id', 'user_key_id', 'user_id', 'community_id'];
// Never writable through this endpoint.
const PROTECTED_FIELDS = ['business_id', 'id', 'created_by_id', 'created_date', 'updated_date'];

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

function json(data, status) {
  return Response.json(data, { status, headers: CORS_HEADERS });
}

// Constant-time comparison so the token check doesn't leak timing information.
function safeEqual(a, b) {
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return diff === 0;
}

export default async function(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ status: 'error', error: 'Method not allowed. Use POST.' }, 405);
  }

  try {
    // ── 1. Bearer token authentication ──
    const header = req.headers.get('authorization') || '';
    const provided = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    const expected = (secrets.get('FUSION_UPDATE_TOKEN') || '').trim();
    if (!expected || !provided || !safeEqual(provided, expected)) {
      return json({ status: 'error', error: 'Unauthorized: missing or invalid bearer token' }, 401);
    }

    // ── 2. Payload validation ──
    let body;
    try {
      body = await req.json();
    } catch {
      return json({ status: 'error', error: 'Invalid JSON body' }, 400);
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return json({ status: 'error', error: 'Body must be a JSON object' }, 400);
    }

    const businessId = Number(body.business_id);
    if (!Number.isInteger(businessId) || businessId <= 0) {
      return json({ status: 'error', error: 'business_id is required and must be a positive integer' }, 400);
    }

    // Changed fields come from `updates`; otherwise any other top-level keys.
    let raw = body.updates && typeof body.updates === 'object' && !Array.isArray(body.updates) ? body.updates : {};
    if (Object.keys(raw).length === 0) {
      raw = {};
      for (const [key, value] of Object.entries(body)) {
        if (key !== 'business_id' && key !== 'updates') raw[key] = value;
      }
    }

    // ── 3. Restrict updates to supported Business fields ──
    const patch = {};
    const unknownFields = [];
    for (const [key, value] of Object.entries(raw)) {
      if (PROTECTED_FIELDS.includes(key)) {
        unknownFields.push(key);
        continue;
      }
      if (STRING_FIELDS.includes(key)) {
        if (value === null || value === undefined) {
          patch[key] = ''; // clear the stored value
          continue;
        }
        if (typeof value !== 'string') {
          return json({ status: 'error', error: `Field "${key}" must be a string` }, 400);
        }
        patch[key] = value;
      } else if (INT_FIELDS.includes(key)) {
        const num = Number(value);
        if (value === null || value === undefined || !Number.isInteger(num)) {
          return json({ status: 'error', error: `Field "${key}" must be an integer` }, 400);
        }
        patch[key] = num;
      } else {
        unknownFields.push(key);
      }
    }

    if (Object.keys(patch).length === 0) {
      return json({ status: 'error', error: 'No valid fields to update', unknown_fields: unknownFields }, 400);
    }

    // ── 4. Find and update the business record ──
    const base44 = createClientFromRequest(req);
    const { items } = await base44.asServiceRole.entities.Business.filter({ business_id: businessId }, { limit: 1 });
    if (!items || items.length === 0) {
      return json({ status: 'error', error: `No business found with business_id ${businessId}` }, 404);
    }

    const updated = await base44.asServiceRole.entities.Business.update(items[0].id, patch);

    return json({
      status: 'success',
      business_id: businessId,
      updated_fields: Object.keys(patch),
      unknown_fields: unknownFields,
      business: updated,
    }, 200);
  } catch (error) {
    return json({ status: 'error', error: error.message }, 500);
  }
}