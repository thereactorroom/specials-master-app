import { resolveFusionHost } from "../../shared/fusionHost.ts";
import { fetchFusionBusiness } from "../../shared/fusionBusiness.ts";

// ── getFusionBusiness ───────────────────────────────────────────────────────
// Fetches a single business record from Fusion's public service-directory API
// and returns it for storage in the Business entity.
//
// Payload: { business_id: number, host?: string }
// The host defaults to the UAT endpoint provided by Fusion. Returns
// { business } on success, or { error } when the API fails / returns no data.
export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const { business_id, host } = body || {};
    const id = parseInt(business_id, 10);
    if (!id || isNaN(id)) {
      return Response.json({ error: 'Missing or invalid business_id' }, { status: 400 });
    }

    const baseUrl = resolveFusionHost(host);
    if (!baseUrl) {
      return Response.json({ error: 'Invalid host' }, { status: 400 });
    }

    const result = await fetchFusionBusiness(id, baseUrl);
    if (result.error || !result.business) {
      return Response.json({ error: result.error || 'No business data returned' }, { status: result.status ?? 404 });
    }
    return Response.json({ business: result.business });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}