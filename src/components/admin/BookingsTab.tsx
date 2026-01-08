import { DollarSign, User, Car, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface Booking {
  id: string;
  ride_id: string;
  passenger_id: string;
  seats_booked: number;
  total_price: number;
  platform_fee: number;
  status: string;
  payment_status: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    phone: string | null;
  } | null;
  rides?: {
    origin: string;
    destination: string;
    departure_time: string;
  } | null;
}

interface BookingsTabProps {
  bookings: Booking[];
}

export function BookingsTab({ bookings }: BookingsTabProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-emerald text-white">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-white">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="secondary" className="bg-emerald/10 text-emerald">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-warning/10 text-warning">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge variant="secondary">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const totalRevenue = bookings
    .filter(b => b.payment_status === 'completed')
    .reduce((sum, b) => sum + (b.platform_fee || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Bookings
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Platform Revenue</p>
            <p className="text-xl font-bold text-emerald">₹{totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Passenger</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Route</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Seats</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Fee</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Payment</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border hover:bg-muted/30">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{booking.profiles?.full_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{booking.profiles?.phone || '-'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm">{booking.rides?.origin || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">→ {booking.rides?.destination || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(booking.created_at), 'MMM d, yyyy')}
                    </div>
                  </td>
                  <td className="p-3 text-sm">{booking.seats_booked}</td>
                  <td className="p-3 text-sm font-medium">₹{booking.total_price}</td>
                  <td className="p-3 text-sm text-emerald font-medium">₹{booking.platform_fee}</td>
                  <td className="p-3">{getStatusBadge(booking.status || 'pending')}</td>
                  <td className="p-3">{getPaymentBadge(booking.payment_status || 'pending')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {bookings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No bookings found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
