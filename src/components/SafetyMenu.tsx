import { Shield, Phone, Share2, MapPin, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface SafetyMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function SafetyMenu({ open, onClose }: SafetyMenuProps) {
  const safetyActions = [
    {
      icon: Share2,
      label: 'Share Ride Details',
      description: 'Send your trip info to trusted contacts',
      action: () => {
        if (navigator.share) {
          navigator.share({
            title: 'My Trapy Ride',
            text: 'Track my ride on Trapy',
            url: window.location.href,
          });
        }
      },
    },
    {
      icon: Phone,
      label: 'Call Police (100)',
      description: 'Connect to emergency services',
      action: () => window.open('tel:100'),
      emergency: true,
    },
    {
      icon: Phone,
      label: 'Women Helpline (181)',
      description: '24x7 Women Safety Helpline',
      action: () => window.open('tel:181'),
    },
    {
      icon: MapPin,
      label: 'Share Live Location',
      description: 'Let contacts track your journey',
      action: () => {},
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetHeader className="text-left pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-light flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald" />
            </div>
            <div>
              <SheetTitle className="text-xl">Safety Shield</SheetTitle>
              <p className="text-sm text-muted-foreground">Your safety is our priority</p>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-3 pb-6">
          {safetyActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[0.99] active:scale-[0.97] ${
                action.emergency
                  ? 'bg-destructive/10 hover:bg-destructive/20 border border-destructive/20'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  action.emergency ? 'bg-destructive/20' : 'bg-emerald-light'
                }`}
              >
                <action.icon
                  className={`w-5 h-5 ${
                    action.emergency ? 'text-destructive' : 'text-emerald'
                  }`}
                />
              </div>
              <div className="text-left">
                <p className={`font-semibold ${action.emergency ? 'text-destructive' : ''}`}>
                  {action.label}
                </p>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            In an emergency, always prioritize your safety. Move to a safe location and call for help immediately.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
