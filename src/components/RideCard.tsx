import { Link } from 'react-router-dom';
import { Star, Shield, Zap, PawPrint, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface RideWithDriver {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  seats_available: number;
  price_per_seat: number;
  is_women_only: boolean | null;
  is_pet_friendly: boolean | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    rating: number | null;
    total_rides: number | null;
    is_aadhaar_verified: boolean | null;
    is_phone_verified: boolean | null;
  } | null;
}

interface RideCardProps {
  ride: RideWithDriver;
}

export default function RideCard({ ride }: RideCardProps) {
  const departureDate = new Date(ride.departure_time);
  const formattedTime = format(departureDate, 'h:mm a');
  const formattedDate = format(departureDate, 'EEE, MMM d');

  return (
    <Link to={`/ride/${ride.id}`}>
      <div className="bg-card border border-border rounded-xl p-4 hover:shadow-soft transition-all hover:border-primary/20 cursor-pointer">
        <div className="flex gap-4">
          {/* Timeline */}
          <div className="flex flex-col items-center py-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <div className="w-0.5 flex-1 bg-border my-1" />
            <div className="w-3 h-3 rounded-full border-2 border-primary bg-background" />
          </div>

          {/* Ride Details */}
          <div className="flex-1 min-w-0">
            {/* Times and Locations */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-lg">{formattedTime}</p>
                  <p className="text-sm text-muted-foreground truncate">{ride.origin}</p>
                </div>
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground truncate">{ride.destination}</p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border my-4" />

            {/* Driver Info and Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {ride.profiles?.avatar_url ? (
                    <img
                      src={ride.profiles.avatar_url}
                      alt={ride.profiles.full_name || 'Driver'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {ride.profiles?.full_name?.charAt(0)?.toUpperCase() || 'D'}
                      </span>
                    </div>
                  )}
                  {ride.profiles?.is_aadhaar_verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald rounded-full flex items-center justify-center">
                      <Shield className="w-3 h-3 text-secondary-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{ride.profiles?.full_name || 'Driver'}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-warning text-warning" />
                    <span className="text-xs font-medium">{ride.profiles?.rating || 0}</span>
                    <span className="text-xs text-muted-foreground">
                      ({ride.profiles?.total_rides || 0} rides)
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-2xl font-bold text-primary">₹{ride.price_per_seat}</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {ride.is_women_only && (
                <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-0">
                  <Users className="w-3 h-3 mr-1" />
                  Women Only
                </Badge>
              )}
              {ride.is_pet_friendly && (
                <Badge variant="secondary">
                  <PawPrint className="w-3 h-3 mr-1" />
                  Pet Friendly
                </Badge>
              )}
              <Badge variant="outline" className="text-muted-foreground">
                {ride.seats_available} seats left
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
