import { useState } from 'react';
import { Filter, SlidersHorizontal, X, Users, PawPrint, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import SearchWidget from '@/components/SearchWidget';
import RideCard from '@/components/RideCard';
import { mockRides } from '@/lib/mockData';
import { useApp } from '@/contexts/AppContext';

export default function Search() {
  const { searchParams } = useApp();
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [departureTime, setDepartureTime] = useState<string[]>([]);
  const [womenOnly, setWomenOnly] = useState(false);
  const [petFriendly, setPetFriendly] = useState(false);
  const [instantApproval, setInstantApproval] = useState(false);

  const timeSlots = [
    { id: 'early', label: '6am - 9am' },
    { id: 'morning', label: '9am - 12pm' },
    { id: 'afternoon', label: '12pm - 6pm' },
    { id: 'evening', label: '6pm - 10pm' },
  ];

  const filteredRides = mockRides.filter((ride) => {
    if (ride.price < priceRange[0] || ride.price > priceRange[1]) return false;
    if (womenOnly && !ride.womenOnly) return false;
    if (petFriendly && !ride.petFriendly) return false;
    if (instantApproval && !ride.instantApproval) return false;
    return true;
  });

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <Label className="text-base font-semibold mb-4 block">Price Range</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={setPriceRange}
            max={1000}
            step={50}
            className="mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>₹{priceRange[0]}</span>
            <span>₹{priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Departure Time */}
      <div>
        <Label className="text-base font-semibold mb-4 block">Departure Time</Label>
        <div className="grid grid-cols-2 gap-2">
          {timeSlots.map((slot) => (
            <Button
              key={slot.id}
              variant={departureTime.includes(slot.id) ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                if (departureTime.includes(slot.id)) {
                  setDepartureTime(departureTime.filter((t) => t !== slot.id));
                } else {
                  setDepartureTime([...departureTime, slot.id]);
                }
              }}
            >
              {slot.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-pink-500" />
            <Label htmlFor="women-only">Women Only</Label>
          </div>
          <Switch id="women-only" checked={womenOnly} onCheckedChange={setWomenOnly} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="pet-friendly">Pet Friendly</Label>
          </div>
          <Switch id="pet-friendly" checked={petFriendly} onCheckedChange={setPetFriendly} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald" />
            <Label htmlFor="instant">Instant Approval</Label>
          </div>
          <Switch id="instant" checked={instantApproval} onCheckedChange={setInstantApproval} />
        </div>
      </div>

      {/* Clear Filters */}
      <Button
        variant="ghost"
        className="w-full"
        onClick={() => {
          setPriceRange([0, 1000]);
          setDepartureTime([]);
          setWomenOnly(false);
          setPetFriendly(false);
          setInstantApproval(false);
        }}
      >
        <X className="w-4 h-4 mr-2" />
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 pt-20">
      <div className="container px-4 py-6">
        {/* Search Widget */}
        <div className="mb-6">
          <SearchWidget variant="compact" />
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {searchParams.from || 'Mumbai'} → {searchParams.to || 'Pune'}
            </h1>
            <p className="text-muted-foreground">
              {filteredRides.length} rides available
            </p>
          </div>

          {/* Mobile Filter Button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Desktop Filters */}
          <div className="hidden md:block">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5" />
                <h2 className="font-semibold">Filters</h2>
              </div>
              <FilterContent />
            </div>
          </div>

          {/* Results */}
          <div className="md:col-span-3 space-y-4">
            {filteredRides.length > 0 ? (
              filteredRides.map((ride) => <RideCard key={ride.id} ride={ride} />)
            ) : (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <p className="text-muted-foreground">No rides found matching your criteria</p>
                <Button variant="link" onClick={() => {
                  setPriceRange([0, 1000]);
                  setWomenOnly(false);
                  setPetFriendly(false);
                  setInstantApproval(false);
                }}>
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
