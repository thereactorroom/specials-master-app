import { Phone, Building2, MessageCircle, MapPin, Globe, Facebook, AtSign, Instagram } from "lucide-react";
import { getGlobalBridge } from "@/lib/fusionBridge";
import { FUSION_CONFIG } from "@/lib/fusionConfig";

// Maps a business's contact fields to the buttons offered in the contact
// chooser, in the order they are shown. Fields with no value are left out.
const OPTION_DEFS = [
  { key: "contact_number", label: "Mobile", icon: Phone, channel: "number" },
  { key: "office_number", label: "Office", icon: Building2, channel: "number" },
  { key: "google_url", label: "Google Listing", icon: MapPin, channel: "url" },
  { key: "website_url", label: "Website", icon: Globe, channel: "url" },
  { key: "facebook_url", label: "Facebook", icon: Facebook, channel: "url" },
  { key: "x_url", label: "X", icon: AtSign, channel: "url" },
  { key: "instagram_url", label: "Instagram", icon: Instagram, channel: "url" },
];

// Social fields often hold just a handle — build the profile URL from these.
const SOCIAL_BASES = {
  facebook_url: "https://facebook.com",
  x_url: "https://x.com",
  instagram_url: "https://instagram.com",
};

// Country dial codes used to turn a local WhatsApp number into an
// international one. Covers the app's region plus common destinations.
const DIAL_CODES = {
  ZW: "263", ZA: "27", ZM: "260", BW: "267", MZ: "258", MW: "265",
  NA: "264", TZ: "255", KE: "254", GB: "44", US: "1", CA: "1",
  AU: "61", IN: "91", AE: "971",
};

// The business's country field holds either a dial code ("+27") or an ISO
// country code ("ZA") — accept both.
function dialPrefix(countryCode) {
  const raw = text(countryCode);
  if (/^\+\d{1,4}$/.test(raw)) return raw.slice(1);
  return DIAL_CODES[raw.toUpperCase()] || "";
}

const text = (v) => (typeof v === "string" ? v.trim() : "");

// tel: href — keeps a leading +, drops spaces, dashes and brackets.
const phoneHref = (v) => text(v).replace(/[^\d+]/g, "").replace(/(?!^)\+/g, "");

// wa.me needs an international number: keep a full number as it is, otherwise
// replace the local leading 0 with the business's country dial code.
function whatsappHref(v, countryCode) {
  const raw = text(v);
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (raw.startsWith("+") || raw.startsWith("00")) return digits.replace(/^00/, "");
  const dial = dialPrefix(countryCode);
  if (digits.startsWith("0") && dial) return dial + digits.slice(1);
  return digits;
}

// Web href — accepts a full URL, a bare domain, or a social handle. Values with
// spaces aren't links (some records hold a business name in a URL field), so
// those are left out and the button is not offered.
function webHref(v, socialBase) {
  const raw = text(v);
  if (!raw || /\s/.test(raw)) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.includes(".")) return `https://${raw.replace(/^\/+/, "")}`;
  const handle = raw.replace(/^@/, "").replace(/^\/+/, "");
  if (!handle) return "";
  return socialBase ? `${socialBase}/${handle}` : `https://${handle}`;
}

// Builds the ordered list of contact options a business actually offers.
// Number options (contact/office) carry two actions — call and WhatsApp — from
// the same number, so the store's separate WhatsApp field is never used here.
// Each option: { key, label, value, icon, href?, channel?, actions? }.
export function buildContactOptions(business) {
  if (!business) return [];
  return OPTION_DEFS.map((def) => {
    const raw = text(business[def.key]);
    if (!raw) return null;

    if (def.channel === "number") {
      const actions = [];
      const tel = phoneHref(raw);
      if (tel) {
        actions.push({ channel: "phone", href: `tel:${tel}` });
        const wa = whatsappHref(raw, business.country_code);
        if (wa) actions.push({ channel: "whatsapp", href: `https://wa.me/${wa}` });
        actions.push({ channel: "sms", href: `sms:${tel}` });
      }
      if (!actions.length) return null;
      return { key: def.key, label: def.label, value: raw, icon: def.icon, actions };
    }

    const href = webHref(raw, SOCIAL_BASES[def.key]);
    if (!href) return null;
    return { key: def.key, label: def.label, value: raw, href, icon: def.icon, channel: def.channel };
  }).filter(Boolean);
}

// Opens a target in a new tab so the app — and the open contact chooser — is
// still there when the user comes back.
function openInNewTab(href) {
  const link = document.createElement("a");
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

// Hands the action to the Fusion app when it exposes a native bridge (the app's
// own dialler / WhatsApp keeps this view alive), otherwise opens a new tab.
export function launchContact(option) {
  const nativeBridge = getGlobalBridge(FUSION_CONFIG.NATIVE_BRIDGE_NAME);

  if (option.channel === "phone") {
    if (nativeBridge && typeof nativeBridge.openPhone === "function") {
      nativeBridge.openPhone({ tel: option.href.replace(/^tel:/, "") });
      return;
    }
    openInNewTab(option.href);
    return;
  }

  if (option.channel === "whatsapp") {
    if (nativeBridge && typeof nativeBridge.openWhatsApp === "function") {
      nativeBridge.openWhatsApp({ uri: option.href });
      return;
    }
    const fusionBridge = getGlobalBridge(FUSION_CONFIG.FUSION_BRIDGE_NAME);
    if (fusionBridge && typeof fusionBridge.openWhatsApp === "function") {
      fusionBridge.openWhatsApp(option.href);
      return;
    }
    openInNewTab(option.href);
    return;
  }

  openInNewTab(option.href);
}