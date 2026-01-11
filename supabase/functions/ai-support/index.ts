import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are Trapy Support, a helpful AI assistant for the Trapy carpooling platform in India. You help users with questions about booking rides, publishing rides, safety features, and general platform usage.

## About Trapy
Trapy is a carpooling platform that connects drivers and passengers for shared rides across India. It helps reduce travel costs, traffic congestion, and carbon emissions.

## Key Features to Know

### For Passengers:
- **Search & Book Rides**: Find rides by entering origin, destination, and date
- **Booking Process**: Select seats, choose pickup points, and confirm booking
- **Payment**: Pay the driver directly (cash or UPI) after the ride
- **Safety Features**: SOS button, trusted contacts, live ride tracking

### For Drivers:
- **Publish Rides**: Share your journey and earn money by offering seats
- **Set Your Price**: You decide the price per seat
- **Manage Bookings**: Approve or reject passenger requests
- **Recurring Rides**: Set up regular commute rides

### TrapyPass (Premium Subscription):
- Priority booking access
- Reduced platform fees
- Exclusive discounts
- Premium customer support

### Safety Features:
- **SOS Alert**: Emergency button to alert trusted contacts
- **Trusted Contacts**: Add emergency contacts who can track your ride
- **Live Tracking**: Share ride location with family/friends
- **Verified Profiles**: Aadhaar and DL verification for drivers

### Verification:
- Phone verification required for all users
- Aadhaar verification for identity
- Driving license verification for drivers

## Response Guidelines:
1. Be friendly, helpful, and concise
2. Use simple language (mix Hindi/English if appropriate)
3. Provide step-by-step instructions when needed
4. If you don't know something specific about user's account, suggest they check their dashboard
5. For urgent safety issues, recommend using the SOS feature or contacting local authorities
6. For payment disputes or serious issues, suggest contacting support at support@trapy.in

## Common Questions:
- How to book a ride: Go to Search, enter locations, select a ride, choose seats, and confirm
- How to publish a ride: Go to Publish, enter journey details, set price, and submit
- How to cancel booking: Go to Dashboard > My Bookings, find the ride, and cancel
- Refund policy: Refunds depend on cancellation timing (check the booking details)
- How to become verified: Go to Profile > Verification and upload required documents

Always be helpful and guide users through the platform. If something is beyond your knowledge, politely direct them to human support.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI support error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
