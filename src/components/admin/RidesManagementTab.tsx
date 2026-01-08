import { useState } from 'react';
import { Car, MapPin, Calendar, Users, Eye, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Ride {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  price_per_seat: number;
  seats_available: number;
  status: string;
  driver_id: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    phone: string | null;
  } | null;
}

interface RidesManagementTabProps {
  rides: Ride[];
  onRefresh: () => void;
}

export function RidesManagementTab({ rides, onRefresh }: RidesManagementTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelRide = async (rideId: string) => {
    setCancellingId(rideId);
    try {
      const { error } = await supabase
        .from('rides')
        .update({ status: 'cancelled' })
        .eq('id', rideId);

      if (error) throw error;

      toast({
        title: 'Ride Cancelled',
        description: 'The ride has been cancelled successfully.',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel ride',
        variant: 'destructive',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const activeRides = rides.filter(ride => ride.status !== 'cancelled');
  const cancelledRides = rides.filter(ride => ride.status === 'cancelled');

  const filterRides = (rideList: Ride[]) => {
    return rideList.filter(ride => {
      const matchesSearch = 
        ride.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ride.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || ride.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const filteredActiveRides = filterRides(activeRides);
  const filteredCancelledRides = cancelledRides.filter(ride => {
    return ride.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald text-white">Active</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500 text-white">In Progress</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const RideTable = ({ rideList, showCancel = true }: { rideList: Ride[]; showCancel?: boolean }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Route</th>
            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Driver</th>
            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Price</th>
            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Seats</th>
            <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
            {showCancel && <th className="text-left p-3 text-sm font-medium text-muted-foreground">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rideList.map((ride) => (
            <tr key={ride.id} className="border-b border-border hover:bg-muted/30">
              <td className="p-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{ride.origin}</p>
                    <p className="text-xs text-muted-foreground">→ {ride.destination}</p>
                  </div>
                </div>
              </td>
              <td className="p-3">
                <p className="text-sm">{ride.profiles?.full_name || 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{ride.profiles?.phone || '-'}</p>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(ride.departure_time), 'MMM d, h:mm a')}
                </div>
              </td>
              <td className="p-3 text-sm font-medium">₹{ride.price_per_seat}</td>
              <td className="p-3">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="w-3 h-3" />
                  {ride.seats_available}
                </div>
              </td>
              <td className="p-3">{getStatusBadge(ride.status || 'active')}</td>
              {showCancel && (
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    {ride.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleCancelRide(ride.id)}
                        disabled={cancellingId === ride.id}
                      >
                        {cancellingId === ride.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {rideList.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No rides found
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Active Rides */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Active Rides ({filteredActiveRides.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search rides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <RideTable rideList={filteredActiveRides} showCancel={true} />
        </CardContent>
      </Card>

      {/* Cancelled Rides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <X className="w-5 h-5" />
            Cancelled Rides ({filteredCancelledRides.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RideTable rideList={filteredCancelledRides} showCancel={false} />
        </CardContent>
      </Card>
    </div>
  );
}
