import { ClothingItem } from '@/types/clothing';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface LaundryItemProps {
  item: ClothingItem;
  isSelected: boolean;
  onToggle: () => void;
}

export function LaundryItem({ item, isSelected, onToggle }: LaundryItemProps) {
  return (
    <motion.div
      onClick={onToggle}
      className="clothing-item cursor-pointer"
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <img
        src={item.image_url}
        alt={item.description}
        className={`clothing-item-image transition-all ${isSelected ? 'opacity-60' : ''}`}
      />
      {isSelected && (
        <motion.div
          className="checkbox-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-5 h-5 text-primary-foreground" />
          </div>
        </motion.div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <span className="text-xs text-white/90">{item.description}</span>
      </div>
    </motion.div>
  );
}
