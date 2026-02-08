import { WeatherData } from '@/types/clothing';
import { Cloud, CloudRain, Sun, Snowflake, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherWidgetProps {
  weather: WeatherData;
  greeting?: string;
}

const getWeatherStyles = (condition: WeatherData['condition'], temperature: number) => {
  // Cold: icy blues and teals
  if (condition === 'cold' || temperature < 15) {
    return {
      gradient: 'from-sky-600 via-cyan-500 to-blue-700',
      iconColor: 'text-white/90',
    };
  }
  
  // Rainy: moody blue-grays with a hint of deep blue
  if (condition === 'rainy') {
    return {
      gradient: 'from-slate-600 via-blue-700 to-gray-700',
      iconColor: 'text-white/90',
    };
  }
  
  // Cloudy: muted grays with subtle warmth
  if (condition === 'cloudy') {
    return {
      gradient: 'from-gray-500 via-slate-500 to-zinc-600',
      iconColor: 'text-white/80',
    };
  }
  
  // Hot: fiery reds and oranges
  if (condition === 'hot' || temperature >= 32) {
    return {
      gradient: 'from-red-500 via-orange-500 to-amber-500',
      iconColor: 'text-white/90',
    };
  }

  // Warm sunny (25-31): golden sunset tones
  if (condition === 'sunny' && temperature >= 25) {
    return {
      gradient: 'from-amber-500 via-orange-400 to-yellow-500',
      iconColor: 'text-white/90',
    };
  }
  
  // Mild sunny (15-24): soft warm greens and golds
  if (condition === 'sunny') {
    return {
      gradient: 'from-emerald-500 via-teal-400 to-cyan-500',
      iconColor: 'text-white/90',
    };
  }

  // Default: pleasant gradient
  return {
    gradient: 'from-indigo-500 via-purple-500 to-pink-400',
    iconColor: 'text-white/90',
  };
};

const getWeatherIcon = (condition: WeatherData['condition'], iconColor: string) => {
  const iconClass = cn('w-8 h-8 drop-shadow-md', iconColor);
  
  switch (condition) {
    case 'sunny':
    case 'hot':
      return <Sun className={iconClass} />;
    case 'cloudy':
      return <Cloud className={iconClass} />;
    case 'rainy':
      return <CloudRain className={iconClass} />;
    case 'cold':
      return <Snowflake className={iconClass} />;
    default:
      return <Thermometer className={iconClass} />;
  }
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

export function WeatherWidget({ weather, greeting }: WeatherWidgetProps) {
  const styles = getWeatherStyles(weather.condition, weather.temperature);
  
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl p-4 flex items-center justify-between',
      'bg-gradient-to-br',
      styles.gradient,
      'shadow-lg'
    )}>
      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
      
      <div className="relative flex flex-col z-10">
        <span className="text-white/80 text-sm font-medium drop-shadow-sm">
          {greeting || getGreeting()}
        </span>
        <span className="text-3xl font-bold text-white drop-shadow-md">
          {weather.temperature}°C
        </span>
        <span className="text-white/80 text-sm font-medium drop-shadow-sm">
          {weather.description}
        </span>
      </div>
      <div className="relative z-10 flex items-center gap-2">
        {getWeatherIcon(weather.condition, styles.iconColor)}
      </div>
    </div>
  );
}
