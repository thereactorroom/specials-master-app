import { base44 } from "@/api/base44Client";
import { getFusionHostUrl } from "@/lib/fusionBridge";

// Resolves the contact details for a set of businesses in one request. The
// backend reads its cached Business records and fills any gaps from Fusion.
// Returns a map keyed by business_id.
export async function fetchBusinessContacts(businessIds) {
  const ids = [...new Set((businessIds || []).map((id) => parseInt(id, 10)).filter((id) => id > 0))];
  if (!ids.length) return {};

  const res = await base44.functions.invoke("getBusinessContacts", {
    business_ids: ids,
    host: getFusionHostUrl(),
  });
  const data = res?.data || res;

  const map = {};
  (data?.businesses || []).forEach((b) => { map[b.business_id] = b; });
  return map;
}