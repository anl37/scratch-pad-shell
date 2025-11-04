import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LocationRequest {
  latitude: number;
  longitude: number;
}

// Classify time of day based on hour
function getTimeOfDay(date: Date): string {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

// Classify day type
function getDayType(date: Date): string {
  const day = date.getDay();
  return (day === 0 || day === 6) ? 'weekend' : 'weekday';
}

// Detect place type using Google Maps Reverse Geocoding and Places API
async function detectPlaceType(lat: number, lng: number): Promise<string> {
  const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
  if (!apiKey) {
    console.warn('GOOGLE_MAPS_API_KEY not set, using default place type');
    return 'general';
  }

  try {
    // Use reverse geocoding to get nearby places
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.results && geocodeData.results.length > 0) {
      const types = geocodeData.results[0].types || [];
      
      // Map Google place types to our categories
      if (types.includes('cafe') || types.includes('coffee_shop')) return 'cafe';
      if (types.includes('gym') || types.includes('health')) return 'gym';
      if (types.includes('library') || types.includes('book_store')) return 'library';
      if (types.includes('bar') || types.includes('night_club')) return 'bar';
      if (types.includes('restaurant')) return 'restaurant';
      if (types.includes('park')) return 'park';
      if (types.includes('university') || types.includes('school')) return 'education';
      if (types.includes('store') || types.includes('shopping_mall')) return 'shopping';
      
      // Default based on broader categories
      if (types.includes('point_of_interest')) return 'poi';
      if (types.includes('establishment')) return 'establishment';
    }
  } catch (error) {
    console.error('Error detecting place type:', error);
  }

  return 'general';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { latitude, longitude }: LocationRequest = await req.json();

    if (!latitude || !longitude) {
      return new Response(JSON.stringify({ error: 'Missing latitude or longitude' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const timeOfDay = getTimeOfDay(now);
    const dayType = getDayType(now);
    const placeType = await detectPlaceType(latitude, longitude);

    console.log('Recording location visit:', { userId: user.id, placeType, timeOfDay, dayType });

    // Insert location visit (trigger will update activity_patterns)
    const { error: visitError } = await supabase
      .from('location_visits')
      .insert({
        user_id: user.id,
        lat: latitude,
        lng: longitude,
        place_type: placeType,
        time_of_day: timeOfDay,
        day_type: dayType,
        visited_at: now.toISOString(),
      });

    if (visitError) {
      console.error('Error inserting location visit:', visitError);
      throw visitError;
    }

    // Get updated activity patterns for this user
    const { data: patterns } = await supabase
      .from('activity_patterns')
      .select('*')
      .eq('user_id', user.id);

    // Build activity fingerprint
    const fingerprint: Record<string, any> = {};
    if (patterns) {
      patterns.forEach(pattern => {
        const key = `${pattern.place_type}_${pattern.time_of_day}_${pattern.day_type}`;
        fingerprint[key] = {
          visit_count: pattern.visit_count,
          frequency_score: pattern.frequency_score,
          last_visit: pattern.last_visit_at,
        };
      });
    }

    // Update profile with activity fingerprint
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ activity_fingerprint: fingerprint })
      .eq('id', user.id);

    if (profileError) {
      console.error('Error updating activity fingerprint:', profileError);
    }

    // Recalculate frequency scores
    const { error: recalcError } = await supabase.rpc('recalculate_frequency_scores', {
      target_user_id: user.id,
    });

    if (recalcError) {
      console.error('Error recalculating frequency scores:', recalcError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        placeType,
        timeOfDay,
        dayType,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in record-location:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
