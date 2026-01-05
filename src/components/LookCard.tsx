import { ClothingItem } from '@/types/clothing';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { DraggableClothingCard } from './DraggableClothingCard';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface LookCardProps {
  id: string;
  title: string;
  items: ClothingItem[];
  onRemoveItem: (itemId: string) => void;
  onConfirm: () => void;
  activeId?: string | null;
}

export function LookCard({ id, title, items, onRemoveItem, onConfirm, activeId }: LookCardProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <motion.div
      ref={setNodeRef}
      className={`look-card flex-1 transition-all duration-200 ${
        isOver ? 'drop-target' : ''
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{items.length} peças</span>
      </div>
      
      <SortableContext items={items.map(i => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {items.map((item) => (
            <DraggableClothingCard
              key={item.id}
              item={item}
              onRemove={() => onRemoveItem(item.id)}
              isDragging={activeId === item.id}
            />
          ))}
        </div>
      </SortableContext>

      <Button
        onClick={onConfirm}
        className="w-full mt-3 bg-primary hover:bg-primary/90"
        size="sm"
      >
        <Check className="w-4 h-4 mr-2" />
        Usar {title}
      </Button>
    </motion.div>
  );
}
