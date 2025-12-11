import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Shield,
  Phone,
  MapPin,
  Clock,
  Car,
  Users,
  Snowflake,
  MessageCircle,
  Zap,
  PawPrint,
  Cigarette,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockRides } from '@/lib/mockData';
import { useApp } from '@/contexts/AppContext';

export default function RideDetails() {
  const { id } = useParams();
  const { user, setAuthModalOpen } = useApp();

  const ride = mockRides.find((r) => r.id === id) || mockRides[0];

  const handleBook = () => {
    if (!user) {
      setAuthModalOpen(true);
    }
  };

  const chattyLabels = {
    quiet: 'Prefers quiet rides',
    moderate: 'Happy to chat',
    chatty: 'Loves to chat',
  };

  return (
    <div className="min-h-screen bg-muted/30 pt-16 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-16 z-40">
        <div className="container px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/search">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold">
                {ride.fromCity} → {ride.toCity}
              </h1>
              <p className="text-sm text-muted-foreground">{ride.date}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Placeholder */}
            <div className="bg-gradient-to-br from-indigo-100 to-emerald-50 rounded-2xl h-48 md:h-64 flex items-center justify-center border border-border">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Route Map</p>
              </div>
            </div>

            {/* Route Details */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-6">Trip Details</h2>

              <div className="flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center py-1">
                  <div className="w-4 h-4 rounded-full bg-primary" />
                  <div className="w-0.5 flex-1 bg-border my-2" />
                  <div className="w-4 h-4 rounded-full border-2 border-primary bg-background" />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-6">
                  <div>
                    <p className="text-2xl font-bold">{ride.departureTime}</p>
                    <p className="text-muted-foreground">{ride.from}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{ride.duration}</span>
                  </div>

                  <div>
                    <p className="text-2xl font-bold">{ride.arrivalTime}</p>
                    <p className="text-muted-foreground">{ride.to}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Car Details */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Vehicle</h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                  <Car className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{ride.carModel}</p>
                  <p className="text-sm text-muted-foreground">{ride.carColor}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {ride.hasAC && (
                      <Badge variant="secondary">
                        <Snowflake className="w-3 h-3 mr-1" />
                        AC
                      </Badge>
                    )}
                    {ride.maxTwoInBack && (
                      <Badge variant="secondary">
                        <Users className="w-3 h-3 mr-1" />
                        Max 2 in back
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Ride Preferences</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Cigarette
                    className={`w-5 h-5 ${ride.smokingAllowed ? 'text-foreground' : 'text-muted-foreground/40'}`}
                  />
                  <span className={ride.smokingAllowed ? '' : 'text-muted-foreground'}>
                    {ride.smokingAllowed ? 'Smoking OK' : 'No smoking'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint
                    className={`w-5 h-5 ${ride.petFriendly ? 'text-foreground' : 'text-muted-foreground/40'}`}
                  />
                  <span className={ride.petFriendly ? '' : 'text-muted-foreground'}>
                    {ride.petFriendly ? 'Pets OK' : 'No pets'}
                  </span>
                </div>
                <div className="flex items-center gap-2 col-span-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span>{chattyLabels[ride.chatty]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img
                    src={ride.driverPhoto}
                    alt={ride.driverName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  {ride.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg">{ride.driverName}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="font-medium">{ride.driverRating}</span>
                    <span className="text-muted-foreground">({ride.driverReviews} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Verification Badges */}
              <div className="space-y-2 mb-4">
                {ride.isAadhaarVerified && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald" />
                    <span>Aadhaar Verified</span>
                  </div>
                )}
                {ride.isPhoneVerified && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald" />
                    <span>Phone Verified</span>
                  </div>
                )}
              </div>

              <Button variant="outline" className="w-full">
                <Phone className="w-4 h-4 mr-2" />
                Contact Driver
              </Button>
            </div>

            {/* Booking Card - Desktop */}
            <div className="hidden md:block bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Price per seat</span>
                <span className="text-3xl font-bold text-primary">₹{ride.price}</span>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{ride.seatsAvailable} seats available</span>
              </div>

              {ride.instantApproval && (
                <div className="flex items-center gap-2 mb-4 text-emerald">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-medium">Instant Approval</span>
                </div>
              )}

              <Button className="w-full" size="lg" onClick={handleBook}>
                Book {ride.seatsAvailable > 1 ? 'Seats' : 'Seat'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 md:hidden z-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">₹{ride.price}</p>
            <p className="text-sm text-muted-foreground">{ride.seatsAvailable} seats left</p>
          </div>
          <Button size="lg" onClick={handleBook}>
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
