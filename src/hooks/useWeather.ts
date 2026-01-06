import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WeatherData } from '@/types/clothing';

interface WeatherApiResponse {
  temperature: number;
  condition: string;
  description: string;
  icon: string;
  location: string;
  humidity: number;
  wind_speed: number;
  feels_like: number;
}

const mapCondition = (condition: string): WeatherData['condition'] => {
  const lower = condition.toLowerCase();
  if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('thunder')) return 'rainy';
  if (lower.includes('cloud') || lower.includes('overcast') || lower.includes('mist') || lower.includes('fog')) return 'cloudy';
  if (lower.includes('snow') || lower.includes('sleet') || lower.includes('hail')) return 'cold';
  if (lower.includes('clear') || lower.includes('sun')) return 'sunny';
  return 'sunny';
};

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeatherByCoords = useCallback(async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching weather for coords:', lat, lon);
      
      const { data, error: fnError } = await supabase.functions.invoke('get-weather', {
        body: { lat, lon }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Erro ao buscar clima');
      }

      const apiData = data as WeatherApiResponse;
      
      const weatherData: WeatherData = {
        temperature: apiData.temperature,
        condition: mapCondition(apiData.condition),
        description: apiData.description,
        icon: apiData.icon,
      };

      setWeather(weatherData);
      setLocation(apiData.location);
      console.log('Weather fetched successfully:', weatherData, 'Location:', apiData.location);
      
      return weatherData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Error fetching weather:', message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeatherByCity = useCallback(async (city: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching weather for city:', city);
      
      const { data, error: fnError } = await supabase.functions.invoke('get-weather', {
        body: { city }
      });

      if (fnError) {
        throw new Error(fnError.message || 'Erro ao buscar clima');
      }

      const apiData = data as WeatherApiResponse;
      
      const weatherData: WeatherData = {
        temperature: apiData.temperature,
        condition: mapCondition(apiData.condition),
        description: apiData.description,
        icon: apiData.icon,
      };

      setWeather(weatherData);
      setLocation(apiData.location);
      
      return weatherData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Error fetching weather:', message);
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestGeolocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada');
      setLoading(false);
      // Fallback to São Paulo
      fetchWeatherByCity('São Paulo');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude);
      },
      (geoError) => {
        console.warn('Geolocation error:', geoError.message);
        // Fallback to São Paulo if user denies or error
        fetchWeatherByCity('São Paulo');
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000, // Cache for 10 minutes
      }
    );
  }, [fetchWeatherByCoords, fetchWeatherByCity]);

  useEffect(() => {
    requestGeolocation();
  }, [requestGeolocation]);

  return {
    weather,
    location,
    loading,
    error,
    refresh: requestGeolocation,
  };
}
