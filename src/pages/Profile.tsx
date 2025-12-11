import { useState } from 'react';
import {
  User,
  Shield,
  Wallet,
  Car,
  Calendar,
  Upload,
  CheckCircle,
  Clock,
  ChevronRight,
  LogOut,
  Phone,
  CreditCard,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApp } from '@/contexts/AppContext';
import { mockRides } from '@/lib/mockData';

export default function Profile() {
  const { user, setUser, setAuthModalOpen } = useApp();
  const [activeTab, setActiveTab] = useState('rides');

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 pt-20 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Login to view your profile</h2>
          <p className="text-muted-foreground mb-6">Access your rides, wallet, and verification status</p>
          <Button onClick={() => setAuthModalOpen(true)}>Login</Button>
        </div>
      </div>
    );
  }

  const upcomingRides = mockRides.slice(0, 2);

  const verificationItems = [
    {
      icon: Phone,
      label: 'Phone Number',
      verified: user.isPhoneVerified,
      action: 'Verified',
    },
    {
      icon: FileText,
      label: 'Aadhaar Card',
      verified: user.isAadhaarVerified,
      action: 'Upload',
    },
    {
      icon: CreditCard,
      label: 'Driving License',
      verified: false,
      action: 'Upload',
    },
  ];

  return (
    <div className="min-h-screen bg-muted/30 pt-16">
      <div className="container px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-10 h-10 text-primary" />
                </div>
                {user.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                <p className="text-muted-foreground">+91 {user.phone}</p>
                {user.isVerified ? (
                  <Badge className="mt-2 bg-emerald-light text-emerald border-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified User
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="mt-2">
                    <Clock className="w-3 h-3 mr-1" />
                    Verification Pending
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Card */}
        <Card className="mb-6 bg-gradient-to-r from-primary to-indigo-dark text-primary-foreground">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm">Wallet Balance</p>
                <p className="text-3xl font-bold">₹{user.walletBalance.toLocaleString()}</p>
              </div>
              <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Wallet className="w-7 h-7" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button size="sm" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Add Money
              </Button>
              <Button size="sm" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Withdraw
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="rides">My Rides</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* My Rides */}
          <TabsContent value="rides" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Upcoming Rides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingRides.length > 0 ? (
                  upcomingRides.map((ride) => (
                    <div
                      key={ride.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <div className="w-0.5 h-4 bg-border" />
                          <div className="w-2 h-2 rounded-full border-2 border-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{ride.fromCity} → {ride.toCity}</p>
                          <p className="text-sm text-muted-foreground">{ride.date} · {ride.departureTime}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No upcoming rides</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Past Rides
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-muted-foreground py-8">No past rides</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification */}
          <TabsContent value="verification" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Identity Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Verify your identity to build trust with other travelers and unlock all features.
                </p>
                {verificationItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        item.verified ? 'bg-emerald-light' : 'bg-muted'
                      }`}>
                        <item.icon className={`w-5 h-5 ${item.verified ? 'text-emerald' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        {item.verified && (
                          <p className="text-sm text-emerald">Verified</p>
                        )}
                      </div>
                    </div>
                    {item.verified ? (
                      <CheckCircle className="w-5 h-5 text-emerald" />
                    ) : (
                      <Button size="sm" variant="outline">
                        <Upload className="w-4 h-4 mr-1" />
                        {item.action}
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span>Edit Profile</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-t">
                  <div className="flex items-center gap-3">
                    <Car className="w-5 h-5 text-muted-foreground" />
                    <span>My Vehicles</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
                <button className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-t">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <span>Payment Methods</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-muted transition-colors border-t text-destructive"
                  onClick={() => setUser(null)}
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </div>
                </button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
