import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  Cigarette,
  PawPrint,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  Car,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { indianCities } from '@/lib/mockData';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MAX_PRICE_PER_KM } from '@/lib/constants';

export default function Publish() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const totalSteps = 5;

  // Form state
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('');
  const [maxTwoInBack, setMaxTwoInBack] = useState(true);
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState(400);
  const [distanceKm, setDistanceKm] = useState<number | undefined>();
  const [carModel, setCarModel] = useState('');
  const [carNumber, setCarNumber] = useState('');
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  const [musicAllowed, setMusicAllowed] = useState(true);
  const [chatty, setChatty] = useState<'quiet' | 'moderate' | 'chatty'>('moderate');
  const [womenOnly, setWomenOnly] = useState(false);

  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const filteredFromCities = indianCities.filter((city) =>
    city.toLowerCase().includes(from.toLowerCase())
  );
  const filteredToCities = indianCities.filter((city) =>
    city.toLowerCase().includes(to.toLowerCase())
  );

  // Calculate max allowed price based on distance
  const maxAllowedPrice = distanceKm ? distanceKm * MAX_PRICE_PER_KM : 750;
  const suggestedPrice = distanceKm ? Math.round(distanceKm * 4) : 400;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handlePublish();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePublish = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!date || !time) {
      toast({
        title: 'Missing Information',
        description: 'Please select a date and time for your ride.',
        variant: 'destructive',
      });
      return;
    }

    // Validate price cap
    if (price > maxAllowedPrice) {
      toast({
        title: 'Price Too High',
        description: `Maximum allowed price is ₹${maxAllowedPrice} (₹${MAX_PRICE_PER_KM}/km cap).`,
        variant: 'destructive',
      });
      return;
    }

    // Women-only rides can only be created by women
    if (womenOnly && profile?.gender !== 'female') {
      toast({
        title: 'Not Allowed',
        description: 'Only women can create women-only rides.',
        variant: 'destructive',
      });
      return;
    }

    setIsPublishing(true);

    try {
      // Combine date and time into departure_time
      const [hours, minutes] = time.split(':').map(Number);
      const departureTime = new Date(date);
      departureTime.setHours(hours, minutes, 0, 0);

      const { error } = await supabase.from('rides').insert({
        driver_id: user.id,
        origin: from,
        destination: to,
        departure_time: departureTime.toISOString(),
        seats_available: seats,
        price_per_seat: price,
        distance_km: distanceKm || null,
        car_model: carModel || null,
        car_number: carNumber || null,
        is_women_only: womenOnly,
        is_pet_friendly: petFriendly,
        is_smoking_allowed: smokingAllowed,
        is_music_allowed: musicAllowed,
        is_chatty: chatty !== 'quiet',
        max_two_back_seat: maxTwoInBack,
        status: 'active',
      });

      if (error) throw error;

      toast({
        title: 'Ride Published!',
        description: 'Your ride has been published successfully. Passengers can now book seats.',
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error publishing ride:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to publish ride. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return from && to && from !== to;
      case 2:
        return date && time;
      case 3:
        return seats > 0;
      case 4:
        return price > 0 && price <= maxAllowedPrice;
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pt-16">
      <div className="container px-4 py-8">
        <div className="max-w-xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Step {step} of {totalSteps}</span>
              <span className="text-sm font-medium">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
            {/* Step 1: Route */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-light flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Where are you going?</h2>
                  <p className="text-muted-foreground">Enter your route details</p>
                </div>

                <div>
                  <Label className="mb-2 block">Leaving from</Label>
                  <Popover open={fromOpen} onOpenChange={setFromOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          placeholder="Enter city"
                          value={from}
                          onChange={(e) => {
                            setFrom(e.target.value);
                            setFromOpen(true);
                          }}
                          className="pl-10 h-12"
                        />
                      </div>
                    </PopoverTrigger>
                    {fromOpen && from && filteredFromCities.length > 0 && (
                      <PopoverContent className="w-full p-0" align="start">
                        <div className="max-h-48 overflow-y-auto">
                          {filteredFromCities.slice(0, 6).map((city) => (
                            <button
                              key={city}
                              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
                              onClick={() => {
                                setFrom(city);
                                setFromOpen(false);
                              }}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    )}
                  </Popover>
                </div>

                <div>
                  <Label className="mb-2 block">Going to</Label>
                  <Popover open={toOpen} onOpenChange={setToOpen}>
                    <PopoverTrigger asChild>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                        <Input
                          placeholder="Enter city"
                          value={to}
                          onChange={(e) => {
                            setTo(e.target.value);
                            setToOpen(true);
                          }}
                          className="pl-10 h-12"
                        />
                      </div>
                    </PopoverTrigger>
                    {toOpen && to && filteredToCities.length > 0 && (
                      <PopoverContent className="w-full p-0" align="start">
                        <div className="max-h-48 overflow-y-auto">
                          {filteredToCities.slice(0, 6).map((city) => (
                            <button
                              key={city}
                              className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
                              onClick={() => {
                                setTo(city);
                                setToOpen(false);
                              }}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    )}
                  </Popover>
                </div>

                {/* Map Placeholder */}
                <div className="bg-gradient-to-br from-indigo-100 to-emerald-50 rounded-xl h-40 flex items-center justify-center border border-border">
                  <p className="text-muted-foreground text-sm">Map preview</p>
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-light flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">When are you leaving?</h2>
                  <p className="text-muted-foreground">Set your departure date and time</p>
                </div>

                <div>
                  <Label className="mb-2 block">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-12 justify-start">
                        <Calendar className="w-5 h-5 mr-2 text-muted-foreground" />
                        {date ? format(date, 'EEEE, MMMM d, yyyy') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label className="mb-2 block">Departure Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Comfort */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-light flex items-center justify-center mx-auto mb-4">
                    <Car className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Comfort Settings</h2>
                  <p className="text-muted-foreground">How many passengers can you take?</p>
                </div>

                <div className="bg-muted rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Available Seats</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSeats(Math.max(1, seats - 1))}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-bold text-xl">{seats}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setSeats(Math.min(4, seats + 1))}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="font-medium">Max 2 in back seat</p>
                      <p className="text-sm text-muted-foreground">More comfort for passengers</p>
                    </div>
                    <Switch checked={maxTwoInBack} onCheckedChange={setMaxTwoInBack} />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Price */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-light flex items-center justify-center mx-auto mb-4">
                    <IndianRupee className="w-8 h-8 text-emerald" />
                  </div>
                  <h2 className="text-2xl font-bold">Set Your Price</h2>
                  <p className="text-muted-foreground">Price per seat for this trip</p>
                </div>

                {/* Distance input for dynamic pricing */}
                <div>
                  <Label className="mb-2 block">Approximate Distance (km)</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 150"
                    value={distanceKm || ''}
                    onChange={(e) => {
                      const km = Number(e.target.value);
                      setDistanceKm(km || undefined);
                      if (km) {
                        setPrice(Math.min(Math.round(km * 4), km * MAX_PRICE_PER_KM));
                      }
                    }}
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used to calculate suggested price (max ₹{MAX_PRICE_PER_KM}/km cap)
                  </p>
                </div>

                <div className="bg-muted rounded-xl p-6 text-center">
                  <div className="relative inline-block">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Math.min(Number(e.target.value), maxAllowedPrice))}
                      max={maxAllowedPrice}
                      className="text-center text-4xl font-bold h-20 w-48 pl-10"
                    />
                  </div>
                  <p className="text-muted-foreground mt-2">per seat</p>
                  {distanceKm && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Max allowed: ₹{maxAllowedPrice}
                    </p>
                  )}
                </div>

                <div className="bg-emerald-light border border-emerald/20 rounded-xl p-4">
                  <p className="text-sm text-emerald font-medium">
                    💡 Suggested price: ₹{suggestedPrice} based on distance
                  </p>
                </div>

                {/* Car details */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h3 className="font-medium">Vehicle Details (Optional)</h3>
                  <div>
                    <Label className="mb-2 block">Car Model</Label>
                    <Input
                      placeholder="e.g., Maruti Swift"
                      value={carModel}
                      onChange={(e) => setCarModel(e.target.value)}
                      className="h-12"
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block">Car Number</Label>
                    <Input
                      placeholder="e.g., MH 12 AB 1234"
                      value={carNumber}
                      onChange={(e) => setCarNumber(e.target.value.toUpperCase())}
                      className="h-12"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Preferences */}
            {step === 5 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-light flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Your Preferences</h2>
                  <p className="text-muted-foreground">Let passengers know your rules</p>
                </div>

                <div className="space-y-4">
                  {profile?.gender === 'female' && (
                    <div className="flex items-center justify-between p-4 bg-pink-50 dark:bg-pink-950/20 rounded-xl border border-pink-200 dark:border-pink-800">
                      <div>
                        <p className="font-medium text-pink-700 dark:text-pink-300">Women-Only Ride</p>
                        <p className="text-sm text-pink-600 dark:text-pink-400">Only visible to women passengers</p>
                      </div>
                      <Switch checked={womenOnly} onCheckedChange={setWomenOnly} />
                    </div>
                  )}

                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div className="flex items-center gap-3">
                      <Cigarette className="w-5 h-5 text-muted-foreground" />
                      <span>Smoking allowed?</span>
                    </div>
                    <Switch checked={smokingAllowed} onCheckedChange={setSmokingAllowed} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div className="flex items-center gap-3">
                      <PawPrint className="w-5 h-5 text-muted-foreground" />
                      <span>Pets allowed?</span>
                    </div>
                    <Switch checked={petFriendly} onCheckedChange={setPetFriendly} />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-muted-foreground" />
                      <span>Music allowed?</span>
                    </div>
                    <Switch checked={musicAllowed} onCheckedChange={setMusicAllowed} />
                  </div>

                  <div className="p-4 bg-muted rounded-xl">
                    <p className="font-medium mb-3">How chatty are you?</p>
                    <RadioGroup value={chatty} onValueChange={(v) => setChatty(v as any)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="quiet" id="quiet" />
                        <Label htmlFor="quiet">I prefer quiet rides</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="moderate" id="moderate" />
                        <Label htmlFor="moderate">I'm happy to chat</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="chatty" id="chatty" />
                        <Label htmlFor="chatty">I love to chat!</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack} disabled={isPublishing} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || isPublishing}
                className="flex-1"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : step === totalSteps ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Publish Ride
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
