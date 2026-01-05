import { ClothingItem, ClothingCategory, AccessorySubCategory } from '@/types/clothing';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryLabels: Record<ClothingCategory, string> = {
  top: 'Camisa',
  bottom: 'Calça',
  shoes: 'Calçado',
  outerwear: 'Casaco',
  accessory: 'Acessório',
};

const subCategoryLabels: Record<AccessorySubCategory, string> = {
  bone: 'Boné',
  brinco: 'Brinco',
  pulseira: 'Pulseira',
  relogio: 'Relógio',
  oculos: 'Óculos',
  colar: 'Colar',
  outro: 'Acessório',
};

const getCategoryLabel = (item: ClothingItem): string => {
  if (item.category === 'accessory' && item.sub_category) {
    return subCategoryLabels[item.sub_category];
  }
  return categoryLabels[item.category];
};

interface DraggableClothingCardProps {
  item: ClothingItem;
  onRemove?: () => void;
  isDragging?: boolean;
}

export function DraggableClothingCard({ item, onRemove, isDragging }: DraggableClothingCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`clothing-item touch-action-none cursor-grab active:cursor-grabbing ${
        isDragging ? 'dragging-item' : ''
      }`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileTap={{ scale: 1.05 }}
    >
      <img
        src={item.image_url}
        alt={item.description}
        className="clothing-item-image"
        draggable={false}
      />
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="remove-button"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <span className="text-xs text-white/90 capitalize">
          {getCategoryLabel(item)}
        </span>
      </div>
    </motion.div>
  );
}
