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
import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

export default function Publish() {
  const navigate = useNavigate();
  const { user, setAuthModalOpen } = useApp();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Form state
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('');
  const [maxTwoInBack, setMaxTwoInBack] = useState(true);
  const [seats, setSeats] = useState(3);
  const [price, setPrice] = useState(400);
  const [smokingAllowed, setSmokingAllowed] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  const [chatty, setChatty] = useState<'quiet' | 'moderate' | 'chatty'>('moderate');

  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const filteredFromCities = indianCities.filter((city) =>
    city.toLowerCase().includes(from.toLowerCase())
  );
  const filteredToCities = indianCities.filter((city) =>
    city.toLowerCase().includes(to.toLowerCase())
  );

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

  const handlePublish = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    toast({
      title: 'Ride Published!',
      description: 'Your ride has been published successfully. Passengers can now book seats.',
    });
    navigate('/');
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return from && to;
      case 2:
        return date && time;
      case 3:
        return true;
      case 4:
        return price > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const suggestedPrice = 400;

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

                <div className="bg-muted rounded-xl p-6 text-center">
                  <div className="relative inline-block">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="text-center text-4xl font-bold h-20 w-48 pl-10"
                    />
                  </div>
                  <p className="text-muted-foreground mt-2">per seat</p>
                </div>

                <div className="bg-emerald-light border border-emerald/20 rounded-xl p-4">
                  <p className="text-sm text-emerald font-medium">
                    💡 Suggested price: ₹{suggestedPrice} based on similar rides
                  </p>
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
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex-1"
              >
                {step === totalSteps ? (
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
