import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/hooks/useAuth";
import ErrorBoundary from "@/components/ErrorBoundary";
import { OfflineDetector } from "@/components/OfflineDetector";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import Search from "./pages/Search";
import RideDetails from "./pages/RideDetails";
import Publish from "./pages/Publish";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import TrapyPass from "./pages/TrapyPass";
import Verification from "./pages/Verification";
import Messages from "./pages/Messages";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppProvider>
            <Toaster />
            <Sonner />
            <OfflineDetector />
            <BrowserRouter>
              <Navbar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/search" element={<Search />} />
                <Route path="/ride/:id" element={<RideDetails />} />
                <Route path="/publish" element={<Publish />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/trapy-pass" element={<TrapyPass />} />
                <Route path="/verification" element={<Verification />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AppProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
