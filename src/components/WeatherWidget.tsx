import { WeatherData } from '@/types/clothing';
import { Cloud, CloudRain, Sun, Snowflake, Thermometer } from 'lucide-react';

interface WeatherWidgetProps {
  weather: WeatherData;
  greeting?: string;
}

const getWeatherIcon = (condition: WeatherData['condition']) => {
  switch (condition) {
    case 'sunny':
    case 'hot':
      return <Sun className="w-8 h-8 text-primary" />;
    case 'cloudy':
      return <Cloud className="w-8 h-8 text-muted-foreground" />;
    case 'rainy':
      return <CloudRain className="w-8 h-8 text-blue-400" />;
    case 'cold':
      return <Snowflake className="w-8 h-8 text-blue-300" />;
    default:
      return <Thermometer className="w-8 h-8 text-muted-foreground" />;
  }
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};

export function WeatherWidget({ weather, greeting }: WeatherWidgetProps) {
  return (
    <div className="weather-widget weather-gradient">
      <div className="flex flex-col">
        <span className="text-muted-foreground text-sm">{greeting || getGreeting()}</span>
        <span className="text-2xl font-semibold">{weather.temperature}°C</span>
        <span className="text-muted-foreground text-sm">{weather.description}</span>
      </div>
      <div className="flex items-center gap-2">
        {getWeatherIcon(weather.condition)}
      </div>
    </div>
  );
}
