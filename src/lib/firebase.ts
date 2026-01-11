// Firebase Cloud Messaging Configuration for Trapy
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBhsKxV7S2VaVkQ1n9Fq7_fVmHl1JvKxXc", // This is a public API key, safe to include
  authDomain: "trapy-6cb9a.firebaseapp.com",
  projectId: "trapy-6cb9a",
  storageBucket: "trapy-6cb9a.firebasestorage.app",
  messagingSenderId: "123456789", // Replace with actual sender ID from Firebase console
  appId: "1:123456789:web:abc123", // Replace with actual app ID from Firebase console
};

// VAPID key for web push - get this from Firebase Console > Project Settings > Cloud Messaging
const VAPID_KEY = ""; // TODO: Add VAPID key from Firebase Console

let messaging: unknown = null;

export async function initializeFirebaseMessaging(): Promise<unknown> {
  if (typeof window === "undefined") return null;
  
  try {
    // Dynamically import Firebase modules
    const { initializeApp, getApps, getApp } = await import("firebase/app");
    const { getMessaging, isSupported } = await import("firebase/messaging");
    
    // Check if messaging is supported in this browser
    const supported = await isSupported();
    if (!supported) {
      console.log("Firebase Messaging is not supported in this browser");
      return null;
    }
    
    // Initialize Firebase app if not already initialized
    const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
    
    // Get messaging instance
    messaging = getMessaging(app);
    
    return messaging;
  } catch (error) {
    console.error("Error initializing Firebase Messaging:", error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }
    
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
}

export async function getFCMToken(): Promise<string | null> {
  try {
    if (!messaging) {
      await initializeFirebaseMessaging();
    }
    
    if (!messaging) {
      console.log("Messaging not initialized");
      return null;
    }
    
    const { getToken } = await import("firebase/messaging");
    
    // Get registration token
    const token = await getToken(messaging as Parameters<typeof getToken>[0], {
      vapidKey: VAPID_KEY || undefined,
    });
    
    if (token) {
      console.log("FCM Token obtained");
      return token;
    } else {
      console.log("No FCM token available");
      return null;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

export async function onForegroundMessage(callback: (payload: unknown) => void): Promise<() => void> {
  try {
    if (!messaging) {
      await initializeFirebaseMessaging();
    }
    
    if (!messaging) {
      return () => {};
    }
    
    const { onMessage } = await import("firebase/messaging");
    
    const unsubscribe = onMessage(messaging as Parameters<typeof onMessage>[0], callback);
    
    return unsubscribe;
  } catch (error) {
    console.error("Error setting up foreground message handler:", error);
    return () => {};
  }
}

export { FIREBASE_CONFIG };