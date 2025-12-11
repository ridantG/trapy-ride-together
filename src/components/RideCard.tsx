import { Link } from 'react-router-dom';
import { Star, Shield, Zap, PawPrint, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Ride } from '@/lib/mockData';

interface RideCardProps {
  ride: Ride;
}

export default function RideCard({ ride }: RideCardProps) {
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
                  <p className="font-semibold text-lg">{ride.departureTime}</p>
                  <p className="text-sm text-muted-foreground truncate">{ride.from}</p>
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-lg">{ride.arrivalTime}</p>
                  <p className="text-sm text-muted-foreground truncate">{ride.to}</p>
                </div>
                <p className="text-sm text-muted-foreground">{ride.duration}</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border my-4" />

            {/* Driver Info and Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={ride.driverPhoto}
                    alt={ride.driverName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {ride.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald rounded-full flex items-center justify-center">
                      <Shield className="w-3 h-3 text-secondary-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium text-sm">{ride.driverName}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-warning text-warning" />
                    <span className="text-xs font-medium">{ride.driverRating}</span>
                    <span className="text-xs text-muted-foreground">
                      ({ride.driverReviews})
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-2xl font-bold text-primary">₹{ride.price}</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {ride.instantApproval && (
                <Badge variant="secondary" className="bg-emerald-light text-emerald border-0">
                  <Zap className="w-3 h-3 mr-1" />
                  Instant
                </Badge>
              )}
              {ride.womenOnly && (
                <Badge variant="secondary" className="bg-pink-100 text-pink-700 border-0">
                  <Users className="w-3 h-3 mr-1" />
                  Women Only
                </Badge>
              )}
              {ride.petFriendly && (
                <Badge variant="secondary">
                  <PawPrint className="w-3 h-3 mr-1" />
                  Pet Friendly
                </Badge>
              )}
              <Badge variant="outline" className="text-muted-foreground">
                {ride.seatsAvailable} seats left
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
