import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENWEATHERMAP_API_KEY = Deno.env.get('OPENWEATHERMAP_API_KEY');
    if (!OPENWEATHERMAP_API_KEY) {
      throw new Error('OPENWEATHERMAP_API_KEY não configurada');
    }

    const { lat, lon, city } = await req.json();
    
    let url: string;
    if (lat && lon) {
      url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric&lang=pt_br`;
    } else if (city) {
      url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHERMAP_API_KEY}&units=metric&lang=pt_br`;
    } else {
      throw new Error('Forneça lat/lon ou city');
    }

    console.log("Fetching weather from:", url.replace(OPENWEATHERMAP_API_KEY, 'HIDDEN'));

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error("OpenWeatherMap error:", data);
      throw new Error(data.message || 'Erro ao buscar clima');
    }

    console.log("Weather data received:", JSON.stringify(data));

    // Format response
    const weatherResult = {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      location: data.name,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      feels_like: Math.round(data.main.feels_like),
      api_response: data,
    };

    // Optionally save to cache
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('weather_cache').insert({
      temperature: weatherResult.temperature,
      condition: weatherResult.condition,
      description: weatherResult.description,
      icon: weatherResult.icon,
      location: weatherResult.location,
      api_response: weatherResult.api_response,
    });

    return new Response(JSON.stringify(weatherResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in get-weather function:', error);
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
