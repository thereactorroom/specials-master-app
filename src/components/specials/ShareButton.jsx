import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildSpecialLink, copyToClipboard } from "@/lib/specialLink";

// Copies a direct link to this special so it can be pasted into any message.
// `labeled` renders the full text version (used on the special's own page);
// otherwise it is a compact icon button for the cards.
export default function ShareButton({ specialId, labeled = false, stopPropagation = false, className }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e) => {
    // Cards are clickable as a whole — sharing must not open the special too.
    if (stopPropagation) e.stopPropagation();

    const ok = await copyToClipboard(buildSpecialLink(specialId));
    if (!ok) {
      toast.error("Couldn't copy the link. Please try again.");
      return;
    }
    setCopied(true);
    toast.success("Link copied — paste it into any message to share this special");
    setTimeout(() => setCopied(false), 2000);
  };

  const Icon = copied ? Check : Share2;

  if (!labeled) {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={handleShare}
        aria-label="Share this special"
        title="Share this special"
        className={cn("h-9 w-9 rounded-full shrink-0", className)}
      >
        <Icon className={cn("w-4 h-4", copied && "text-teal-700")} />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleShare}
      aria-label="Share this special"
      className={cn(
        "h-11 rounded-full px-4 gap-2 text-sm font-semibold bg-white/95 text-slate-700 border-slate-200 shadow-sm hover:bg-white",
        className
      )}
    >
      <Icon className="w-4 h-4" />
      {copied ? "Link copied" : "Share"}
    </Button>
  );
}