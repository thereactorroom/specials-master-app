import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { buildContactOptions } from "@/lib/contactOptions";
import ContactOptions from "./ContactOptions";

// Opens the contact chooser for a business. Renders nothing when the business
// has no contact details, so no button ever leads to an empty popup.
export default function ContactButton({ business, className, stopPropagation = false }) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const options = buildContactOptions(business);

  if (!options.length) return null;

  const businessName = business?.business_name || "this business";
  const title = `Contact ${businessName}`;
  const handleOpen = (e) => {
    if (stopPropagation) e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpen}
        aria-label={`Contact ${businessName}`}
        className={cn("rounded-xl gap-1.5", className)}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        Contact
      </Button>

      {isMobile ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="px-4 pb-6" onClick={(e) => e.stopPropagation()}>
            <DrawerHeader className="px-0 text-left">
              <DrawerTitle className="text-base font-bold">{title}</DrawerTitle>
              <DrawerDescription className="text-xs">
                Pick how to get in touch, then close to go back to the specials.
              </DrawerDescription>
            </DrawerHeader>
            <div className="max-h-[70vh] overflow-y-auto pt-1">
              <ContactOptions options={options} onClose={() => setOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">{title}</DialogTitle>
              <DialogDescription className="text-xs">
                Pick how to get in touch, then close to go back to the specials.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-y-auto">
              <ContactOptions options={options} onClose={() => setOpen(false)} />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}