import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, Wallet, Settings, Clock, MapPin, Star, 
  Calendar, ChevronRight, Shield, AlertTriangle,
  Crown, Phone, CreditCard, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface BookingWithRide {
  id: string;
  seats_booked: number;
  total_price: number;
  status: string | null;
  created_at: string | null;
  rides: {
    id: string;
    origin: string;
    destination: string;
    departure_time: string;
    price_per_seat: number;
  } | null;
}

export default function Dashboard() {
  const { profile, user, signOut } = useAuth();
  const [showSOS, setShowSOS] = useState(false);
  const [bookings, setBookings] = useState<BookingWithRide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          seats_booked,
          total_price,
          status,
          created_at,
          rides (
            id,
            origin,
            destination,
            departure_time,
            price_per_seat
          )
        `)
        .eq('passenger_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data as BookingWithRide[] || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcomingBookings = bookings.filter(b => 
    b.rides && new Date(b.rides.departure_time) >= now && b.status !== 'cancelled'
  );
  const pastBookings = bookings.filter(b => 
    b.rides && (new Date(b.rides.departure_time) < now || b.status === 'cancelled')
  );

  return (
    <div className="min-h-screen bg-muted/30 pt-24 pb-24 md:pb-12">
      <div className="container px-4 max-w-4xl">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-indigo-dark flex items-center justify-center text-2xl font-bold text-primary-foreground">
              {profile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{profile?.full_name || 'User'}</h1>
                {profile?.subscription_tier === 'premium' && (
                  <Crown className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="flex items-center gap-3 mt-2">
                {profile?.is_aadhaar_verified && (
                  <span className="text-xs bg-emerald-light text-emerald px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Verified
                  </span>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {profile?.rating || 0} rating
                </span>
              </div>
            </div>
            <Link to="/profile">
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <Wallet className="w-6 h-6 text-primary mb-2" />
            <p className="text-2xl font-bold">₹{profile?.wallet_balance || 0}</p>
            <p className="text-xs text-muted-foreground">Wallet Balance</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <Car className="w-6 h-6 text-emerald mb-2" />
            <p className="text-2xl font-bold">{profile?.total_rides || 0}</p>
            <p className="text-xs text-muted-foreground">Total Rides</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <CreditCard className="w-6 h-6 text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{profile?.fuel_points || 0}</p>
            <p className="text-xs text-muted-foreground">Fuel Points</p>
          </div>
          <Link to="/trapy-pass" className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 text-white">
            <Crown className="w-6 h-6 mb-2" />
            <p className="text-sm font-bold">
              {profile?.subscription_tier === 'premium' ? 'Gold Member' : 'Get Gold'}
            </p>
            <p className="text-xs opacity-80">
              {profile?.subscription_tier === 'premium' ? 'Active' : 'Zero fees'}
            </p>
          </Link>
        </div>

        {/* Rides Tabs */}
        <Tabs defaultValue="upcoming" className="mb-6">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Loading your rides...</p>
              </div>
            ) : upcomingBookings.length > 0 ? (
              upcomingBookings.map((booking) => (
                <Link key={booking.id} to={`/ride/${booking.rides?.id}`}>
                  <div className="bg-card border border-border rounded-xl p-4 hover:shadow-soft transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {booking.rides ? format(new Date(booking.rides.departure_time), 'EEE, MMM d') : ''}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {booking.rides ? format(new Date(booking.rides.departure_time), 'h:mm a') : ''}
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="w-0.5 h-8 bg-border" />
                        <div className="w-2 h-2 rounded-full border-2 border-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{booking.rides?.origin}</p>
                        <p className="text-sm text-muted-foreground mt-4">{booking.rides?.destination}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">₹{booking.total_price}</p>
                        <p className="text-xs text-muted-foreground">{booking.seats_booked} seat(s)</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming rides</p>
                <Link to="/search">
                  <Button className="mt-4">Find a Ride</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4 space-y-4">
            {pastBookings.length > 0 ? (
              pastBookings.map((booking) => (
                <div key={booking.id} className="bg-card border border-border rounded-xl p-4 opacity-70">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {booking.rides ? format(new Date(booking.rides.departure_time), 'EEE, MMM d') : ''}
                      </span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'cancelled' 
                        ? 'bg-destructive/10 text-destructive' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {booking.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                      <div className="w-0.5 h-8 bg-border" />
                      <div className="w-2 h-2 rounded-full border-2 border-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{booking.rides?.origin}</p>
                      <p className="text-sm text-muted-foreground mt-4">{booking.rides?.destination}</p>
                    </div>
                    <p className="font-medium">₹{booking.total_price}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No past rides</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <div className="bg-card border border-border rounded-2xl divide-y divide-border">
          <Link to="/verification" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-emerald" />
              <span className="font-medium">Verification Center</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
          <Link to="/profile" className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="font-medium">Account Settings</span>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </Link>
          <button 
            onClick={signOut}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-destructive"
          >
            <span className="font-medium">Sign Out</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* SOS Floating Button (Mobile) */}
      <div className="fixed bottom-20 right-4 md:hidden z-50">
        <Button
          onClick={() => setShowSOS(!showSOS)}
          className="w-14 h-14 rounded-full bg-destructive hover:bg-destructive/90 shadow-lg"
        >
          <AlertTriangle className="w-6 h-6" />
        </Button>
      </div>

      {/* SOS Modal */}
      {showSOS && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setShowSOS(false)}>
          <div className="bg-card rounded-t-3xl md:rounded-3xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Emergency SOS</h3>
                <p className="text-sm text-muted-foreground">Get help quickly</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <a href="tel:100" className="flex items-center gap-4 p-4 bg-destructive/10 rounded-xl">
                <Phone className="w-5 h-5 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">Call Police (100)</p>
                  <p className="text-sm text-muted-foreground">Emergency services</p>
                </div>
              </a>
              <a href="tel:181" className="flex items-center gap-4 p-4 bg-pink-50 rounded-xl">
                <Phone className="w-5 h-5 text-pink-600" />
                <div>
                  <p className="font-semibold text-pink-600">Women Helpline (181)</p>
                  <p className="text-sm text-muted-foreground">24x7 support</p>
                </div>
              </a>
              <button 
                className="w-full flex items-center gap-4 p-4 bg-muted rounded-xl"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'My Location - Trapy SOS',
                      text: 'I need help! Here is my current location.',
                      url: window.location.href,
                    });
                  }
                }}
              >
                <MapPin className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="font-semibold">Share Live Location</p>
                  <p className="text-sm text-muted-foreground">Send to emergency contacts</p>
                </div>
              </button>
            </div>

            <Button variant="outline" className="w-full mt-6" onClick={() => setShowSOS(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
