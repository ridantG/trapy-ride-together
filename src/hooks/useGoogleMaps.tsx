import { useState, useEffect, useCallback } from 'react';
import { loadGoogleMapsAPI, LatLng, RouteInfo, calculateRoute, getCityCoordinates } from '@/lib/googleMaps';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface UseGoogleMapsReturn {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  getRoute: (origin: string, destination: string) => Promise<RouteInfo | null>;
  getCoordinates: (address: string) => Promise<LatLng | null>;
}

// Extend window type
const win = window as unknown as { google?: { maps?: unknown } };

export const useGoogleMaps = (): UseGoogleMapsReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key not configured');
      return;
    }

    // Check if already loaded
    if (win.google?.maps) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    loadGoogleMapsAPI(GOOGLE_MAPS_API_KEY)
      .then(() => {
        setIsLoaded(true);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load Google Maps');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const getRoute = useCallback(async (origin: string, destination: string): Promise<RouteInfo | null> => {
    if (!isLoaded) return null;
    return calculateRoute(origin + ', India', destination + ', India');
  }, [isLoaded]);

  const getCoordinates = useCallback(async (address: string): Promise<LatLng | null> => {
    return getCityCoordinates(address);
  }, []);

  return {
    isLoaded,
    isLoading,
    error,
    getRoute,
    getCoordinates,
  };
};

export default useGoogleMaps;
