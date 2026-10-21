import Dashboard from "./Dashboard";
import CommunityView from "./CommunityView";
import { getParamCaseInsensitive } from "@/lib/urlParams";

export default function Home() {
  const viewParam = getParamCaseInsensitive("View");
  const viewValue = viewParam ? viewParam.toLowerCase() : null;
  const createParam = getParamCaseInsensitive("create");
  const createValue = createParam ? createParam.toLowerCase() : null;

  // URL params are authoritative for this load. When the URL explicitly picks
  // a mode, clear any stale session state left by a previous context that ran
  // in the same reused iframe, so it can never leak into this one.
  if (viewValue === "true") {
    // View=True → read-only dashboard: list business specials, preview only.
    sessionStorage.setItem("app_view_mode", "true");
    sessionStorage.removeItem("app_create_mode");
    return <Dashboard viewOnly />;
  }
  if (viewValue === "false") {
    sessionStorage.removeItem("app_view_mode");
  }
  if (createValue === "true") {
    sessionStorage.setItem("app_create_mode", "true");
    sessionStorage.removeItem("app_view_mode");
    return <Dashboard />;
  }
  if (createValue === "false") {
    // Community mode is not business-scoped: drop any business context saved
    // by a previous business-owner session in the same iframe.
    sessionStorage.removeItem("app_create_mode");
    sessionStorage.removeItem("app_view_mode");
    sessionStorage.removeItem("app_business");
    return <CommunityView />;
  }

  // No param: fall back to persisted mode so back-navigation from sub-pages
  // (create/history/preview) returns to the dashboard for business owners.
  if (sessionStorage.getItem("app_view_mode") === "true") {
    return <Dashboard viewOnly />;
  }
  if (sessionStorage.getItem("app_create_mode") === "true") {
    return <Dashboard />;
  }

  sessionStorage.removeItem("app_business");
  return <CommunityView />;
}