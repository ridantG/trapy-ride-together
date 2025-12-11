import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Search, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useApp } from '@/contexts/AppContext';
import { indianCities } from '@/lib/mockData';
import { format } from 'date-fns';

interface SearchWidgetProps {
  variant?: 'hero' | 'compact';
}

export default function SearchWidget({ variant = 'hero' }: SearchWidgetProps) {
  const navigate = useNavigate();
  const { searchParams, setSearchParams } = useApp();
  const [from, setFrom] = useState(searchParams.from);
  const [to, setTo] = useState(searchParams.to);
  const [date, setDate] = useState<Date | undefined>(
    searchParams.date ? new Date(searchParams.date) : undefined
  );
  const [passengers, setPassengers] = useState(searchParams.passengers);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const handleSearch = () => {
    setSearchParams({
      from,
      to,
      date: date ? format(date, 'yyyy-MM-dd') : '',
      passengers,
    });
    navigate('/search');
  };

  const swapLocations = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const filteredFromCities = indianCities.filter((city) =>
    city.toLowerCase().includes(from.toLowerCase())
  );

  const filteredToCities = indianCities.filter((city) =>
    city.toLowerCase().includes(to.toLowerCase())
  );

  const isHero = variant === 'hero';

  return (
    <div
      className={`${
        isHero
          ? 'bg-card shadow-soft rounded-2xl p-6 md:p-8 border border-border'
          : 'bg-card rounded-xl p-4 border border-border'
      }`}
    >
      <div className={`grid gap-4 ${isHero ? 'md:grid-cols-5' : 'md:grid-cols-4'}`}>
        {/* From */}
        <div className={isHero ? 'md:col-span-1' : ''}>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Leaving from
          </label>
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
                      className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-2"
                      onClick={() => {
                        setFrom(city);
                        setFromOpen(false);
                      }}
                    >
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {city}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            )}
          </Popover>
        </div>

        {/* Swap Button (Hero only) */}
        {isHero && (
          <div className="hidden md:flex items-end justify-center pb-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={swapLocations}
              className="rounded-full"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* To */}
        <div className={isHero ? 'md:col-span-1' : ''}>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Going to
          </label>
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
                      className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-2"
                      onClick={() => {
                        setTo(city);
                        setToOpen(false);
                      }}
                    >
                      <MapPin className="w-4 h-4 text-primary" />
                      {city}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            )}
          </Popover>
        </div>

        {/* Date */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 justify-start text-left font-normal"
              >
                <Calendar className="w-5 h-5 mr-2 text-muted-foreground" />
                {date ? format(date, 'MMM d, yyyy') : 'Pick a date'}
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

        {/* Passengers */}
        <div>
          <label className="text-sm font-medium text-muted-foreground mb-2 block">
            Passengers
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full h-12 justify-start text-left font-normal"
              >
                <Users className="w-5 h-5 mr-2 text-muted-foreground" />
                {passengers} {passengers === 1 ? 'passenger' : 'passengers'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48" align="start">
              <div className="flex items-center justify-between">
                <span className="text-sm">Passengers</span>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                  >
                    -
                  </Button>
                  <span className="w-6 text-center font-medium">{passengers}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setPassengers(Math.min(4, passengers + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Search Button (Hero only) */}
        {isHero && (
          <div className="md:col-span-5 md:flex md:justify-center mt-2">
            <Button size="xl" className="w-full md:w-auto md:px-12" onClick={handleSearch}>
              <Search className="w-5 h-5 mr-2" />
              Search Rides
            </Button>
          </div>
        )}
      </div>

      {!isHero && (
        <Button className="w-full mt-4" onClick={handleSearch}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
      )}
    </div>
  );
}
