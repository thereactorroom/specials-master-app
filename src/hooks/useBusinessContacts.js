import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBusinessContacts } from "@/lib/businessContacts";

// Contact details for the businesses behind a list of specials, keyed by
// business_id. Cached for a few minutes so cards sharing a business cost
// nothing extra.
export function useBusinessContacts(businessIds) {
  const key = useMemo(
    () => [...new Set((businessIds || []).map((id) => parseInt(id, 10)).filter((id) => id > 0))].sort((a, b) => a - b).join(","),
    [businessIds]
  );

  const { data = {} } = useQuery({
    queryKey: ["business-contacts", key],
    queryFn: () => fetchBusinessContacts(key.split(",").map(Number)),
    enabled: key.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return data;
}