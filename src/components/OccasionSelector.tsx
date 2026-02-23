import { ClothingOccasion } from '@/types/clothing';
import { motion } from 'framer-motion';
import { Briefcase, PartyPopper, Coffee, Sparkles, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const occasions: { value: ClothingOccasion; label: string; icon: typeof Briefcase }[] = [
  { value: 'trabalho', label: 'Trabalho', icon: Briefcase },
  { value: 'casual', label: 'Casual', icon: Coffee },
  { value: 'diario', label: 'Diário', icon: Sparkles },
  { value: 'especiais', label: 'Especiais', icon: PartyPopper },
];

interface OccasionSelectorProps {
  selected: ClothingOccasion | null;
  onSelect: (occasion: ClothingOccasion | null) => void;
  title?: string;
}

export function OccasionSelector({ selected, onSelect, title = 'Ocasiões' }: OccasionSelectorProps) {
  const navigate = useNavigate();
  const handleClick = (value: ClothingOccasion) => {
    onSelect(selected === value ? null : value);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/api-keys')}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <Key className="w-3.5 h-3.5" />
          Minhas Chaves
        </motion.button>
      </div>
      <div className="flex gap-2">
        {occasions.map(({ value, label, icon: Icon }) => {
          const isActive = selected === value;
          return (
            <motion.button
              key={value}
              onClick={() => handleClick(value)}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-medium transition-all border ${
                isActive
                  ? 'bg-primary text-primary-foreground border-primary shadow-md'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
