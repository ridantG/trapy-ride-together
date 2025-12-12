import { Shield, CreditCard, Users, Car, MapPin, Clock, Wallet, ArrowRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SearchWidget from '@/components/SearchWidget';
import { popularRoutes } from '@/lib/mockData';

export default function Index() {
  const trustBadges = [
    { icon: Shield, label: 'Verified IDs', description: 'Aadhaar & DL Verified' },
    { icon: CreditCard, label: 'Secure Payments', description: 'UPI & Cards Accepted' },
    { icon: Users, label: 'Women-Only Option', description: 'Safe rides for women' },
  ];

  const steps = [
    { icon: MapPin, title: 'Search', description: 'Enter your route and find available rides' },
    { icon: Car, title: 'Book', description: 'Choose your ride and book a seat instantly' },
    { icon: Wallet, title: 'Save', description: 'Pay less and travel comfortably' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800" />
        
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald/20 rounded-full blur-3xl animate-float delay-200" />
        </div>

        <div className="container relative z-10 px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-4 animate-slide-up">
              Ride Together,{' '}
              <span className="text-emerald-300">Save Together</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 animate-slide-up delay-100">
              India's trusted carpooling platform. Share rides, split costs, and travel comfortably.
            </p>
          </div>

          {/* Search Widget */}
          <div className="max-w-4xl mx-auto animate-slide-up delay-200">
            <SearchWidget variant="hero" />
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-10 animate-slide-up delay-300">
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-primary-foreground/10 backdrop-blur-sm rounded-full px-5 py-3"
              >
                <badge.icon className="w-5 h-5 text-emerald-300" />
                <div>
                  <p className="text-sm font-semibold text-primary-foreground">{badge.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="hsl(var(--background))"
            />
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Trapy Works</h2>
            <p className="text-muted-foreground text-lg">Travel made simple in 3 easy steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center group">
                <div className="w-20 h-20 rounded-2xl bg-indigo-light flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>
                <div className="absolute top-8 left-1/2 w-full h-0.5 bg-border -z-10 hidden md:block last:hidden" />
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Routes */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Popular Routes</h2>
            <p className="text-muted-foreground text-lg">Most traveled routes on Trapy</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {popularRoutes.map((route, index) => (
              <Link key={index} to="/search">
                <div className="bg-card border border-border rounded-xl p-4 hover:shadow-soft hover:border-primary/20 transition-all cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="w-0.5 h-6 bg-border" />
                        <div className="w-2 h-2 rounded-full border-2 border-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{route.from}</p>
                        <p className="text-muted-foreground text-sm">{route.to}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">₹{route.price}</p>
                      <p className="text-xs text-muted-foreground">per seat</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-2 ml-auto group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Trapy */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose <span className="text-gradient">Trapy?</span>
              </h2>
              <div className="space-y-4">
                {[
                  'Save up to 75% compared to trains & buses',
                  'Verified drivers with Aadhaar & DL check',
                  'Women-only ride options for safety',
                  'Flexible pickup points',
                  'Instant booking confirmation',
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald flex-shrink-0" />
                    <p className="text-muted-foreground">{item}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-8">
                <Link to="/search">
                  <Button size="lg">Find a Ride</Button>
                </Link>
                <Link to="/publish">
                  <Button variant="outline" size="lg">Offer a Ride</Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/10 to-emerald/10 rounded-3xl p-8">
                <div className="bg-card rounded-2xl shadow-soft p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-light flex items-center justify-center">
                      <Shield className="w-6 h-6 text-emerald" />
                    </div>
                    <div>
                      <p className="font-semibold">Safety First</p>
                      <p className="text-sm text-muted-foreground">All rides are monitored</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-light flex items-center justify-center">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">On-Time Guarantee</p>
                      <p className="text-sm text-muted-foreground">98% rides on schedule</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-warning" />
                    </div>
                    <div>
                      <p className="font-semibold">Best Prices</p>
                      <p className="text-sm text-muted-foreground">Lowest fare guarantee</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary to-indigo-dark">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Join 10 lakh+ travelers who trust Trapy. India's Most Trusted Ride Network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search">
              <Button size="xl" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                Find a Ride
              </Button>
            </Link>
            <Link to="/publish">
              <Button size="xl" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Publish a Ride
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-foreground text-background">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Trapy</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2024 Trapy. Made with ❤️ in India
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
