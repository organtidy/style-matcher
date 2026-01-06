import { WeatherData } from '@/types/clothing';
import { Cloud, CloudRain, Sun, Snowflake, Thermometer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeatherWidgetProps {
  weather: WeatherData;
  greeting?: string;
}

const getWeatherStyles = (condition: WeatherData['condition'], temperature: number) => {
  // Based on temperature and condition, return appropriate gradient and icon color
  if (condition === 'cold' || temperature < 15) {
    return {
      gradient: 'bg-gradient-to-br from-blue-500/20 via-cyan-400/15 to-blue-600/10',
      iconColor: 'text-blue-400',
      textColor: 'text-blue-200',
    };
  }
  
  if (condition === 'rainy') {
    return {
      gradient: 'bg-gradient-to-br from-slate-500/20 via-blue-400/15 to-slate-600/10',
      iconColor: 'text-blue-400',
      textColor: 'text-slate-300',
    };
  }
  
  if (condition === 'cloudy' || (temperature >= 15 && temperature < 25)) {
    return {
      gradient: 'bg-gradient-to-br from-slate-400/20 via-gray-400/15 to-slate-500/10',
      iconColor: 'text-slate-400',
      textColor: 'text-slate-300',
    };
  }
  
  if (condition === 'hot' || temperature >= 30) {
    return {
      gradient: 'bg-gradient-to-br from-red-500/20 via-orange-400/15 to-amber-500/10',
      iconColor: 'text-orange-400',
      textColor: 'text-orange-200',
    };
  }
  
  // Sunny / warm (25-30)
  return {
    gradient: 'bg-gradient-to-br from-amber-400/20 via-yellow-400/15 to-orange-400/10',
    iconColor: 'text-amber-400',
    textColor: 'text-amber-200',
  };
};

const getWeatherIcon = (condition: WeatherData['condition'], iconColor: string) => {
  const iconClass = cn('w-8 h-8', iconColor);
  
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
      'glass-card p-4 flex items-center justify-between border border-white/10',
      styles.gradient
    )}>
      <div className="flex flex-col">
        <span className="text-muted-foreground text-sm">{greeting || getGreeting()}</span>
        <span className="text-2xl font-semibold">{weather.temperature}°C</span>
        <span className="text-muted-foreground text-sm">{weather.description}</span>
      </div>
      <div className="flex items-center gap-2">
        {getWeatherIcon(weather.condition, styles.iconColor)}
      </div>
    </div>
  );
}
