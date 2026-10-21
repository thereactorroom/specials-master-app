import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { resolveFusionHost } from "../../shared/fusionHost.ts";
import {
  fetchFusionBusiness,
  mapBusinessToEntity,
  pickBusinessContacts,
} from "../../shared/fusionBusiness.ts";

// ── getBusinessContacts ─────────────────────────────────────────────────────
// Returns the contact details for a set of businesses, so the app can offer a
// contact chooser on specials without one request per card.
//
// Cached Business records are used as they are; businesses Fusion knows about
// but that aren't cached yet are fetched once and stored.
//
// Payload: { business_ids: number[], host?: string }
// Returns: { businesses: [{ business_id, business_name, contact_number, ... }] }
export default async function (req: Request): Promise<Response> {
  try {
    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body?.business_ids)
      ? [...new Set(body.business_ids.map((v: any) => parseInt(v, 10)).filter((v: number) => v > 0))]
      : [];
    if (!ids.length) {
      return Response.json({ businesses: [] });
    }

    const base44 = createClientFromRequest(req);
    const cached = await base44.asServiceRole.entities.Business.filter({ business_id: { $in: ids } });
    const byId = new Map<number, any>(cached.map((b: any) => [b.business_id, b]));

    // Fill the gaps from Fusion, caching what comes back for next time.
    const baseUrl = resolveFusionHost(body?.host);
    const missing = ids.filter((id: number) => !byId.has(id));
    if (baseUrl && missing.length) {
      console.log('[getBusinessContacts] fetching', missing.length, 'business(es) from Fusion');
      const fetched = await Promise.all(missing.map(async (id: number) => {
        const result = await fetchFusionBusiness(id, baseUrl);
        if (!result.business) return null;
        const entity = mapBusinessToEntity(result.business);
        try {
          return await base44.asServiceRole.entities.Business.create(entity);
        } catch (e: any) {
          // Caching is best-effort — return the mapped record either way.
          console.log('[getBusinessContacts] could not cache business', id, e?.message);
          return entity;
        }
      }));
      fetched.forEach((b: any) => { if (b) byId.set(b.business_id, b); });
    }

    const businesses = ids
      .map((id: number) => byId.get(id))
      .filter(Boolean)
      .map((b: any) => pickBusinessContacts(b));

    return Response.json({ businesses });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}