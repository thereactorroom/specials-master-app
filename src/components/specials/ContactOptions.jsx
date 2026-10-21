import { ExternalLink, Phone, MessageSquareText } from "lucide-react";
import WhatsAppIcon from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { launchContact } from "@/lib/contactOptions";

// The list of ways to reach a business, plus the Close control that returns the
// user to the specials. Launched methods open alongside this view, so the list
// is still here when the user comes back to pick another.
export default function ContactOptions({ options, onClose }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {options.map((option) => {
          const Icon = option.icon;
          // Number options offer two actions from one entry: call and WhatsApp.
          if (option.actions) {
            return (
              <div
                key={option.key}
                className="w-full flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5"
              >
                <span className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-teal-700" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
                  <span className="block text-xs text-slate-500 truncate">{option.value}</span>
                </span>
                <span className="flex items-center gap-1.5 shrink-0">
                  {option.actions.map((action) => {
                    const ActionIcon =
                      action.channel === "whatsapp" ? WhatsAppIcon : action.channel === "sms" ? MessageSquareText : Phone;
                    const styles =
                      action.channel === "whatsapp"
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : action.channel === "sms"
                          ? "bg-sky-50 text-sky-600 hover:bg-sky-100"
                          : "bg-teal-50 text-teal-700 hover:bg-teal-100";
                    const label =
                      action.channel === "whatsapp"
                        ? `WhatsApp ${option.value}`
                        : action.channel === "sms"
                          ? `SMS ${option.value}`
                          : `Call ${option.value}`;
                    return (
                      <button
                        key={action.channel}
                        type="button"
                        onClick={() => launchContact(action)}
                        aria-label={label}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${styles}`}
                      >
                        <ActionIcon className="w-4 h-4" />
                      </button>
                    );
                  })}
                </span>
              </div>
            );
          }
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => launchContact(option)}
              className="w-full flex items-center gap-3 rounded-xl border border-slate-200 px-3.5 py-3 text-left hover:bg-slate-50 active:bg-slate-100 transition-colors"
            >
              <span className="w-9 h-9 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-teal-700" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">{option.label}</span>
                <span className="block text-xs text-slate-500 truncate">{option.value}</span>
              </span>
              <ExternalLink className="w-4 h-4 text-slate-300 shrink-0" />
            </button>
          );
        })}
      </div>

      <Button
        variant="outline"
        onClick={onClose}
        className="w-full h-11 rounded-xl font-semibold"
      >
        Close
      </Button>
    </div>
  );
}