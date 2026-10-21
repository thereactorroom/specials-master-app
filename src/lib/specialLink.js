// ── specialLink ─────────────────────────────────────────────────────────────
// The link users share for a special. It points at the app's own address for
// that special's consumer view — the origin is taken from wherever the app is
// currently running, so a shared link always matches the domain the app is
// served from. No viewer, business or admin context is attached: the recipient
// gets the plain consumer view.
export function buildSpecialLink(specialId) {
  return `${window.location.origin}/specials/view/${specialId}?create=false`;
}

// Copies text to the clipboard. Uses the async Clipboard API where it is
// available, and falls back to a hidden textarea — the app also runs inside the
// Fusion WebView, where the Clipboard API is often missing or blocked.
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the textarea approach
  }

  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);
    const copied = document.execCommand("copy");
    area.remove();
    return copied;
  } catch {
    return false;
  }
}