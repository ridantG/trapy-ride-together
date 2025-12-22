import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Car, Calendar, MapPin, Users, Check, X, 
  MessageCircle, Loader2, ChevronDown, ChevronUp, Star, Edit, XCircle, IndianRupee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Chat from './Chat';
import RatingModal from './RatingModal';
import { retryAsync, handleError, handleSuccess } from '@/lib/errorHandling';

interface Booking {
  id: string;
  seats_booked: number;
  total_price: number;
  status: string | null;
  created_at: string | null;
  pickup_point_id: string | null;
  passenger_id: string;
  profiles: {
    full_name: string | null;
    phone: string | null;
    rating: number | null;
  } | null;
  pickup_points: {
    name: string;
  } | null;
}

interface DriverRide {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  seats_available: number;
  price_per_seat: number;
  status: string | null;
  bookings: Booking[];
}

interface Rating {
  booking_id: string;
  rater_id: string;
}

export default function DriverRidesTab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState<DriverRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRide, setExpandedRide] = useState<string | null>(null);
  const [confirmingBooking, setConfirmingBooking] = useState<string | null>(null);
  const [activeChatBooking, setActiveChatBooking] = useState<Booking | null>(null);
  const [activeChatRide, setActiveChatRide] = useState<DriverRide | null>(null);
  const [ratingBooking, setRatingBooking] = useState<{ booking: Booking; ride: DriverRide } | null>(null);
  const [existingRatings, setExistingRatings] = useState<Rating[]>([]);
  const [showEarnings, setShowEarnings] = useState(false);
  const [earnings, setEarnings] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchDriverRides();
      fetchExistingRatings();
      fetchEarnings();
    }
  }, [user]);

  const fetchDriverRides = async () => {
    if (!user) return;

    try {
      await retryAsync(async () => {
        const { data, error } = await supabase
          .from('rides')
          .select(`
            id,
            origin,
            destination,
            departure_time,
            seats_available,
            price_per_seat,
            status,
            bookings (
              id,
              seats_booked,
              total_price,
              status,
              created_at,
              pickup_point_id,
              passenger_id,
              profiles!bookings_passenger_id_fkey (
                full_name,
                phone,
                rating
              ),
              pickup_points (
                name
              )
            )
          `)
          .eq('driver_id', user.id)
          .order('departure_time', { ascending: false });

        if (error) throw error;
        setRides(data as DriverRide[] || []);
      }, {
        maxRetries: 2,
        retryDelay: 1000,
      });
    } catch (error) {
      handleError(error, 'Failed to load your rides');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingRatings = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('ratings')
        .select('booking_id, rater_id')
        .eq('rater_id', user.id);
      
      if (data) {
        setExistingRatings(data);
      }
    } catch (error) {
      // Non-critical - ratings are used for display only, log for debugging
      console.error('Error fetching ratings (non-critical):', error);
    }
  };

  const fetchEarnings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('driver_earnings')
        .select('*')
        .eq('driver_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      setEarnings(data);
    } catch (error) {
      // Non-critical - earnings are for display only, log for debugging
      console.error('Error fetching earnings (non-critical):', error);
    }
  };

  const hasRated = (bookingId: string) => {
    return existingRatings.some(r => r.booking_id === bookingId);
  };

  const handleConfirmBooking = async (bookingId: string) => {
    setConfirmingBooking(bookingId);
    try {
      await retryAsync(async () => {
        const { error } = await supabase
          .from('bookings')
          .update({ status: 'confirmed' })
          .eq('id', bookingId);

        if (error) throw error;
      }, {
        maxRetries: 1,
        retryDelay: 1000,
      });

      handleSuccess('Booking Confirmed', 'The passenger has been notified.');
      fetchDriverRides();
      fetchEarnings();
    } catch (error) {
      handleError(error, 'Failed to confirm booking');
    } finally {
      setConfirmingBooking(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await retryAsync(async () => {
        // Use database function for atomic cancellation with seat restoration
        const { error } = await supabase.rpc('cancel_booking', {
          p_booking_id: bookingId,
        });

        if (error) throw error;
      }, {
        maxRetries: 1,
        retryDelay: 1000,
      });

      handleSuccess('Booking Cancelled', 'Seats have been restored.');
      fetchDriverRides();
    } catch (error: any) {
      handleError(error, 'Failed to cancel booking');
    }
  };

  const handleCancelRide = async (rideId: string) => {
    if (!window.confirm('Are you sure you want to cancel this ride? All bookings will be cancelled.')) {
      return;
    }

    try {
      await retryAsync(async () => {
        // Cancel all active bookings for this ride
        const { error: bookingsError } = await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('ride_id', rideId)
          .in('status', ['pending', 'confirmed']);

        if (bookingsError) throw bookingsError;

        // Cancel the ride
        const { error: rideError } = await supabase
          .from('rides')
          .update({ status: 'cancelled' })
          .eq('id', rideId);

        if (rideError) throw rideError;
      }, {
        maxRetries: 1,
        retryDelay: 1000,
      });

      handleSuccess('Ride Cancelled', 'Your ride has been cancelled. Passengers have been notified.');
      fetchDriverRides();
    } catch (error: any) {
      handleError(error, 'Failed to cancel ride');
    }
  };

  const now = new Date();

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading your rides...</p>
      </div>
    );
  }

  if (rides.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">You haven't published any rides yet</p>
        <Link to="/publish">
          <Button>Publish a Ride</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Earnings Summary Card */}
      {earnings && (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <IndianRupee className="w-5 h-5" />
              Your Earnings
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEarnings(!showEarnings)}
            >
              {showEarnings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
          {showEarnings && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold text-emerald">₹{earnings.total_earnings || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Rides</p>
                <p className="text-2xl font-bold">{earnings.total_rides || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bookings</p>
                <p className="text-2xl font-bold">{earnings.total_bookings || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seats Sold</p>
                <p className="text-2xl font-bold">{earnings.total_seats_sold || 0}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {rides.map((ride) => {
        const isPast = new Date(ride.departure_time) < now;
        const activeBookings = ride.bookings.filter(b => b.status !== 'cancelled');
        const hasBookings = activeBookings.length > 0;
        const canEdit = !isPast && ride.status === 'active';

        return (
          <div key={ride.id} className={`bg-card border border-border rounded-xl overflow-hidden ${isPast ? 'opacity-70' : ''}`}>
            {/* Ride Header */}
            <div className="p-4">
              <div 
                className="cursor-pointer hover:bg-muted/50 transition-colors rounded-lg p-2 -m-2"
                onClick={() => setExpandedRide(expandedRide === ride.id ? null : ride.id)}
              >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {format(new Date(ride.departure_time), 'EEE, MMM d')}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(ride.departure_time), 'h:mm a')}
                  </span>
                  {ride.status === 'cancelled' && (
                    <Badge variant="destructive">Cancelled</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {hasBookings && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {activeBookings.length} booking{activeBookings.length > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {expandedRide === ride.id ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="w-0.5 h-8 bg-border" />
                  <div className="w-2 h-2 rounded-full border-2 border-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{ride.origin}</p>
                  <p className="text-sm text-muted-foreground mt-4">{ride.destination}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">₹{ride.price_per_seat}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {ride.seats_available} seats left
                  </p>
                </div>
              </div>
              </div>

              {/* Ride Management Buttons */}
              {canEdit && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/publish?edit=${ride.id}`)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Ride
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelRide(ride.id);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Cancel Ride
                  </Button>
                </div>
              )}
            </div>

            {/* Expanded Bookings */}
            {expandedRide === ride.id && (
              <div className="border-t border-border bg-muted/30">
                {activeBookings.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No bookings yet
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {activeBookings.map((booking) => (
                      <div key={booking.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{booking.profiles?.full_name || 'Passenger'}</p>
                              {booking.profiles?.rating !== null && (
                                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-warning text-warning" />
                                  {booking.profiles.rating}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''} • ₹{booking.total_price}
                            </p>
                            {booking.pickup_points && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                Pickup: {booking.pickup_points.name}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={
                              booking.status === 'confirmed' ? 'default' :
                              booking.status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {booking.status}
                            </Badge>
                            <div className="flex gap-2">
                              {booking.status === 'pending' && !isPast && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8"
                                    onClick={() => handleConfirmBooking(booking.id)}
                                    disabled={confirmingBooking === booking.id}
                                  >
                                    {confirmingBooking === booking.id ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Check className="w-3 h-3" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-destructive hover:text-destructive"
                                    onClick={() => handleCancelBooking(booking.id)}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() => {
                                  setActiveChatBooking(booking);
                                  setActiveChatRide(ride);
                                }}
                              >
                                <MessageCircle className="w-3 h-3" />
                              </Button>
                              {isPast && booking.status === 'confirmed' && !hasRated(booking.id) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  onClick={() => setRatingBooking({ booking, ride })}
                                >
                                  <Star className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Chat Modal */}
      {activeChatBooking && activeChatRide && (
        <Chat
          bookingId={activeChatBooking.id}
          otherUserId={activeChatBooking.passenger_id}
          otherUserName={activeChatBooking.profiles?.full_name || 'Passenger'}
          onClose={() => {
            setActiveChatBooking(null);
            setActiveChatRide(null);
          }}
        />
      )}

      {/* Rating Modal */}
      {ratingBooking && (
        <RatingModal
          bookingId={ratingBooking.booking.id}
          ratedUserId={ratingBooking.booking.passenger_id}
          ratedUserName={ratingBooking.booking.profiles?.full_name || 'Passenger'}
          raterType="driver"
          onClose={() => setRatingBooking(null)}
          onRated={() => {
            setRatingBooking(null);
            fetchExistingRatings();
          }}
        />
      )}
    </div>
  );
}
