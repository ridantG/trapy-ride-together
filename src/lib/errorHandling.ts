import { toast } from '@/hooks/use-toast';

interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number) => void;
}

export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries = 2, retryDelay = 1000, onRetry } = options;
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt + 1);
        }
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }
  }

  throw lastError;
}

export function handleError(error: any, customMessage?: string) {
  const message = error?.message || customMessage || 'An unexpected error occurred';
  
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
  });

  // Still log to console for debugging
  console.error('Error:', error);
}

export function handleSuccess(title: string, description?: string) {
  toast({
    title,
    description,
  });
}

export function isNetworkError(error: any): boolean {
  return (
    error?.message?.toLowerCase().includes('network') ||
    error?.message?.toLowerCase().includes('fetch') ||
    error?.message?.toLowerCase().includes('connection') ||
    !navigator.onLine
  );
}

export function getErrorMessage(error: any): string {
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }
  
  return error?.message || 'An unexpected error occurred';
}
