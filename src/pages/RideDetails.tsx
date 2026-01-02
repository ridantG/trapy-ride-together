import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
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
  Loader2,
  Music,
} from 'lucide-react';
import RideTracker from '@/components/RideTracker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { PLATFORM_FEE_PERCENTAGE, calculateTotalPrice } from '@/lib/constants';
import PickupPointsManager, { PickupPoint } from '@/components/PickupPointsManager';
import { retryAsync, handleError, handleSuccess } from '@/lib/errorHandling';

interface RideWithDriver {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  seats_available: number;
  price_per_seat: number;
  distance_km: number | null;
  car_model: string | null;
  car_number: string | null;
  is_women_only: boolean | null;
  is_pet_friendly: boolean | null;
  is_smoking_allowed: boolean | null;
  is_music_allowed: boolean | null;
  is_chatty: boolean | null;
  max_two_back_seat: boolean | null;
  driver_id: string;
  status: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
    rating: number | null;
    total_rides: number | null;
    is_aadhaar_verified: boolean | null;
    is_phone_verified: boolean | null;
    phone: string | null;
  } | null;
}

interface PickupPointData {
  id: string;
  name: string;
  address: string | null;
  sequence_order: number;
}

export default function RideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [ride, setRide] = useState<RideWithDriver | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [pickupPoints, setPickupPoints] = useState<PickupPointData[]>([]);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<string | null>(null);
  const [hasBooking, setHasBooking] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRide();
      if (user) {
        checkUserBooking();
      }
    }
  }, [id, user]);

  const fetchRide = useCallback(async () => {
    try {
      await retryAsync(async () => {
        const { data, error } = await supabase
          .from('rides')
          .select(`
            *,
            profiles!rides_driver_id_fkey (
              full_name,
              avatar_url,
              rating,
              total_rides,
              is_aadhaar_verified,
              is_phone_verified,
              phone
            )
          `)
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        
        // Check if user can view women-only ride
        if (data?.is_women_only && profile?.gender !== 'female') {
          toast({
            title: 'Access Denied',
            description: 'This is a women-only ride.',
            variant: 'destructive',
          });
          navigate('/search');
          return;
        }

        setRide(data);

        // Fetch pickup points
        if (data) {
          const { data: pickupData, error: pickupError } = await supabase
            .from('pickup_points')
            .select('*')
            .eq('ride_id', data.id)
            .order('sequence_order', { ascending: true });
          
          if (pickupError) {
            // Pickup points are optional - log for debugging but don't fail
            console.error('Error fetching pickup points (non-critical):', pickupError);
          } else if (pickupData) {
            setPickupPoints(pickupData);
          }
        }
      }, {
        maxRetries: 2,
        retryDelay: 1000,
      });
    } catch (error) {
      handleError(error, 'Failed to load ride details');
      navigate('/search');
    } finally {
      setLoading(false);
    }
  }, [id, profile?.gender, navigate]);

  const checkUserBooking = async () => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id')
        .eq('ride_id', id)
        .eq('passenger_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .maybeSingle();
      
      if (error) throw error;
      setHasBooking(!!data);
    } catch (error) {
      console.error('Error checking booking:', error);
    }
  };

  const handleStatusChange = () => {
    fetchRide();
  };

  const handleBook = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!ride) return;

    // Prevent multiple rapid clicks
    if (booking) return;

    // Check if user is trying to book their own ride
    if (ride.driver_id === user.id) {
      toast({
        title: 'Not Allowed',
        description: 'You cannot book your own ride.',
        variant: 'destructive',
      });
      return;
    }

    // Check women-only restriction
    if (ride.is_women_only && profile?.gender !== 'female') {
      toast({
        title: 'Not Allowed',
        description: 'This ride is for women only.',
        variant: 'destructive',
      });
      return;
    }

    if (seatsToBook > ride.seats_available) {
      toast({
        title: 'Not Enough Seats',
        description: `Only ${ride.seats_available} seats available.`,
        variant: 'destructive',
      });
      return;
    }

    setBooking(true);

    try {
      await retryAsync(async () => {
        // Use atomic database function for race-condition-safe booking
        // Prices are now calculated server-side for security
        const { data, error } = await supabase.rpc('book_ride_atomic', {
          p_ride_id: ride.id,
          p_passenger_id: user.id,
          p_seats_requested: seatsToBook,
          p_pickup_point_id: selectedPickupPoint || null,
        });

        if (error) throw error;
      }, {
        maxRetries: 1,
        retryDelay: 1000,
      });

      handleSuccess('Booking Successful!', `You have booked ${seatsToBook} seat(s).`);
      navigate('/dashboard');
    } catch (error: any) {
      handleError(error, error.message || 'Failed to book ride. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 pt-16">
        <div className="bg-card border-b border-border sticky top-16 z-40">
          <div className="container px-4 py-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="flex-1">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </div>
        </div>
        <div className="container px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="rounded-2xl h-48 md:h-64" />
              <div className="bg-card border border-border rounded-xl p-6">
                <Skeleton className="h-6 w-32 mb-6" />
                <div className="space-y-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <Skeleton className="h-16 w-16 rounded-full mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-muted/30 pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Ride not found</p>
          <Link to="/search">
            <Button>Back to Search</Button>
          </Link>
        </div>
      </div>
    );
  }

  const departureDate = new Date(ride.departure_time);
  const formattedTime = format(departureDate, 'h:mm a');
  const formattedDate = format(departureDate, 'EEEE, MMMM d, yyyy');
  const { totalPrice, platformFee } = calculateTotalPrice(ride.price_per_seat, seatsToBook);

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
                {ride.origin} → {ride.destination}
              </h1>
              <p className="text-sm text-muted-foreground">{formattedDate}</p>
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
                    <p className="text-2xl font-bold">{formattedTime}</p>
                    <p className="text-muted-foreground">{ride.origin}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{ride.distance_km ? `~${ride.distance_km} km` : 'Distance N/A'}</span>
                  </div>

                  <div>
                    <p className="text-muted-foreground">{ride.destination}</p>
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
                  <p className="font-medium">{ride.car_model || 'Car details not provided'}</p>
                  {ride.car_number && (
                    <p className="text-sm text-muted-foreground">{ride.car_number}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {ride.max_two_back_seat && (
                      <Badge variant="secondary">
                        <Users className="w-3 h-3 mr-1" />
                        Max 2 in back
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Points */}
            {pickupPoints.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="font-semibold text-lg mb-4">Pickup Points</h2>
                <p className="text-sm text-muted-foreground mb-4">Select where you'd like to be picked up</p>
                <div className="space-y-2">
                  {pickupPoints.map((point, index) => (
                    <button
                      key={point.id}
                      onClick={() => setSelectedPickupPoint(point.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        selectedPickupPoint === point.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        selectedPickupPoint === point.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-sm">{point.name}</p>
                        {point.address && (
                          <p className="text-xs text-muted-foreground">{point.address}</p>
                        )}
                      </div>
                      {selectedPickupPoint === point.id && (
                        <CheckCircle className="w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="font-semibold text-lg mb-4">Ride Preferences</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Cigarette
                    className={`w-5 h-5 ${ride.is_smoking_allowed ? 'text-foreground' : 'text-muted-foreground/40'}`}
                  />
                  <span className={ride.is_smoking_allowed ? '' : 'text-muted-foreground'}>
                    {ride.is_smoking_allowed ? 'Smoking OK' : 'No smoking'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <PawPrint
                    className={`w-5 h-5 ${ride.is_pet_friendly ? 'text-foreground' : 'text-muted-foreground/40'}`}
                  />
                  <span className={ride.is_pet_friendly ? '' : 'text-muted-foreground'}>
                    {ride.is_pet_friendly ? 'Pets OK' : 'No pets'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Music
                    className={`w-5 h-5 ${ride.is_music_allowed ? 'text-foreground' : 'text-muted-foreground/40'}`}
                  />
                  <span className={ride.is_music_allowed ? '' : 'text-muted-foreground'}>
                    {ride.is_music_allowed ? 'Music OK' : 'No music'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle
                    className={`w-5 h-5 ${ride.is_chatty ? 'text-primary' : 'text-muted-foreground/40'}`}
                  />
                  <span className={ride.is_chatty ? '' : 'text-muted-foreground'}>
                    {ride.is_chatty ? 'Chatty' : 'Quiet ride'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ride Tracker - Show for driver or booked passengers */}
            {(ride.driver_id === user?.id || hasBooking) && ride.status !== 'completed' && (
              <RideTracker
                rideId={ride.id}
                status={ride.status || 'active'}
                origin={ride.origin}
                destination={ride.destination}
                isDriver={ride.driver_id === user?.id}
                onStatusChange={handleStatusChange}
              />
            )}
            {/* Driver Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  {ride.profiles?.avatar_url ? (
                    <img
                      src={ride.profiles.avatar_url}
                      alt={ride.profiles.full_name || 'Driver'}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-xl font-semibold">
                        {ride.profiles?.full_name?.charAt(0)?.toUpperCase() || 'D'}
                      </span>
                    </div>
                  )}
                  {ride.profiles?.is_aadhaar_verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald rounded-full flex items-center justify-center">
                      <Shield className="w-4 h-4 text-secondary-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-lg">{ride.profiles?.full_name || 'Driver'}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-warning text-warning" />
                    <span className="font-medium">{ride.profiles?.rating || 0}</span>
                    <span className="text-muted-foreground">({ride.profiles?.total_rides || 0} rides)</span>
                  </div>
                </div>
              </div>

              {/* Verification Badges */}
              <div className="space-y-2 mb-4">
                {ride.profiles?.is_aadhaar_verified && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald" />
                    <span>Aadhaar Verified</span>
                  </div>
                )}
                {ride.profiles?.is_phone_verified && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald" />
                    <span>Phone Verified</span>
                  </div>
                )}
              </div>

              {ride.profiles?.phone && (
                <a href={`tel:${ride.profiles.phone}`}>
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Driver
                  </Button>
                </a>
              )}
            </div>

            {/* Booking Card - Desktop */}
            <div className="hidden md:block bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">Price per seat</span>
                <span className="text-3xl font-bold text-primary">₹{ride.price_per_seat}</span>
              </div>

              {/* Seat selector */}
              <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Seats to book</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSeatsToBook(Math.max(1, seatsToBook - 1))}
                    disabled={seatsToBook <= 1}
                  >
                    -
                  </Button>
                  <span className="w-6 text-center font-bold">{seatsToBook}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSeatsToBook(Math.min(ride.seats_available, seatsToBook + 1))}
                    disabled={seatsToBook >= ride.seats_available}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>{ride.seats_available} seats available</span>
              </div>

              <div className="border-t border-border pt-4 mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Subtotal ({seatsToBook} seat{seatsToBook > 1 ? 's' : ''})</span>
                  <span>₹{ride.price_per_seat * seatsToBook}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Service fee ({PLATFORM_FEE_PERCENTAGE * 100}%)</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-primary">₹{totalPrice}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleBook}
                disabled={booking || ride.driver_id === user?.id}
              >
                {booking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : ride.driver_id === user?.id ? (
                  'Your Ride'
                ) : (
                  `Book ${seatsToBook} Seat${seatsToBook > 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 md:hidden z-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary">₹{totalPrice}</p>
            <p className="text-sm text-muted-foreground">{ride.seats_available} seats left</p>
          </div>
          <Button 
            size="lg" 
            onClick={handleBook}
            disabled={booking || ride.driver_id === user?.id}
          >
            {booking ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : ride.driver_id === user?.id ? (
              'Your Ride'
            ) : (
              'Book Now'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
