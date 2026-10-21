import { Switch } from "@/components/ui/switch";
import { Share2 } from "lucide-react";

// Admin toggle for tenant features. Shared options live on the draft config
// and are applied to the live app when the admin saves the Branding Engine.
export default function FeaturesSection({ draft, onChange }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-slate-400" />
            <span className="font-jakarta text-sm font-semibold text-white">Special sharing</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Show the share button on specials so users can copy a direct link.
          </p>
        </div>
        <Switch
          checked={!!draft.enable_sharing}
          onCheckedChange={(checked) => onChange("enable_sharing", checked)}
          className="data-[state=checked]:bg-emerald-500 mt-0.5"
        />
      </div>
    </div>
  );
}