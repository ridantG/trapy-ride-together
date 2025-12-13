// Business Constants for Trapy

// Maximum price per km (regulatory compliance)
export const MAX_PRICE_PER_KM = 5;

// Platform fee percentage
export const PLATFORM_FEE_PERCENTAGE = 10;

// Free tier booking fee
export const FREE_TIER_BOOKING_FEE = 40;

// Premium subscription price
export const PREMIUM_SUBSCRIPTION_PRICE = 99;

// Calculate platform fee
export const calculatePlatformFee = (driverPrice: number): number => {
  return Math.round(driverPrice * (PLATFORM_FEE_PERCENTAGE / 100));
};

// Calculate final price for passenger
export const calculateFinalPrice = (driverPrice: number): number => {
  return driverPrice + calculatePlatformFee(driverPrice);
};

// Calculate max price based on distance
export const calculateMaxPrice = (distanceKm: number): number => {
  return Math.round(distanceKm * MAX_PRICE_PER_KM);
};

// Suggest price based on distance (₹4 per km as suggested price)
export const suggestPrice = (distanceKm: number): number => {
  return Math.round(distanceKm * 4);
};

// Validate price against max allowed
export const validatePrice = (price: number, distanceKm: number): boolean => {
  return price <= calculateMaxPrice(distanceKm);
};

// Calculate total price with platform fee for multiple seats
export const calculateTotalPrice = (pricePerSeat: number, seats: number): { totalPrice: number; platformFee: number } => {
  const subtotal = pricePerSeat * seats;
  const platformFee = Math.round(subtotal * (PLATFORM_FEE_PERCENTAGE / 100));
  return {
    totalPrice: subtotal + platformFee,
    platformFee,
  };
};
