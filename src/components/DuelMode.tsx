import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { ClothingItem, ClothingCategory } from '@/types/clothing';
import { ManequimLookCard } from './ManequimLookCard';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// Categories that can be swapped together
const compatibleCategories: Record<ClothingCategory, ClothingCategory[]> = {
  top: ['top', 'outerwear'],
  outerwear: ['top', 'outerwear'],
  bottom: ['bottom'],
  shoes: ['shoes'],
  accessory: ['accessory'],
};

// Slot type to category mapping for drop validation
const slotTypeToCategories: Record<string, ClothingCategory[]> = {
  'head': ['accessory'],
  'top': ['top', 'outerwear'],
  'bottom': ['bottom'],
  'shoes': ['shoes'],
  'accessory-left': ['accessory'],
  'accessory-right': ['accessory'],
};

interface DuelModeProps {
  lookA: ClothingItem[];
  lookB: ClothingItem[];
  onRemoveFromA: (itemId: string) => void;
  onRemoveFromB: (itemId: string) => void;
  onConfirmA: () => void;
  onConfirmB: () => void;
  onSwapItem: (fromLook: 'A' | 'B', toLook: 'A' | 'B', itemId: string) => void;
}

export function DuelMode({
  lookA,
  lookB,
  onRemoveFromA,
  onRemoveFromB,
  onConfirmA,
  onConfirmB,
  onSwapItem,
}: DuelModeProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeLook, setActiveLook] = useState<'A' | 'B' | null>(null);
  const [activeCategory, setActiveCategory] = useState<ClothingCategory | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const itemId = active.id as string;
    setActiveId(itemId);
    
    // Find the item and its category
    const itemA = lookA.find(i => i.id === itemId);
    const itemB = lookB.find(i => i.id === itemId);
    const item = itemA || itemB;
    
    if (item) {
      setActiveCategory(item.category);
    }
    
    // Determine which look the item is from
    if (itemA) {
      setActiveLook('A');
    } else if (itemB) {
      setActiveLook('B');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && activeLook && activeCategory) {
      const overId = over.id as string;
      const activeItem = [...lookA, ...lookB].find(i => i.id === active.id);
      
      if (!activeItem) {
        setActiveId(null);
        setActiveLook(null);
        setActiveCategory(null);
        return;
      }

      // Parse the drop target to understand where we're dropping
      const isDropOnLookASlot = overId.startsWith('lookA-');
      const isDropOnLookBSlot = overId.startsWith('lookB-');
      
      if (isDropOnLookASlot || isDropOnLookBSlot) {
        const targetLook = isDropOnLookASlot ? 'A' : 'B';
        const slotType = overId.split('-').slice(1).join('-'); // e.g., 'top', 'bottom', 'accessory-left'
        
        // Check if the category is compatible with the slot
        const acceptedCategories = slotTypeToCategories[slotType];
        
        if (acceptedCategories && acceptedCategories.includes(activeCategory)) {
          // Valid drop - swap the item
          if (activeLook !== targetLook) {
            onSwapItem(activeLook, targetLook, active.id as string);
          }
        } else {
          // Invalid drop - show error toast
          toast.error('Categoria incompatível com este slot', {
            description: `Não é possível colocar ${getCategoryLabel(activeCategory)} nesta posição.`,
            icon: '⚠️',
          });
        }
      }
    }

    setActiveId(null);
    setActiveLook(null);
    setActiveCategory(null);
  };

  const activeItem = activeId
    ? [...lookA, ...lookB].find(i => i.id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 w-full">
        <ManequimLookCard
          id="lookA"
          title="Look A"
          items={lookA}
          onRemoveItem={onRemoveFromA}
          onConfirm={onConfirmA}
          activeId={activeId}
          activeCategory={activeCategory}
        />
        <ManequimLookCard
          id="lookB"
          title="Look B"
          items={lookB}
          onRemoveItem={onRemoveFromB}
          onConfirm={onConfirmB}
          activeId={activeId}
          activeCategory={activeCategory}
        />
      </div>

      <DragOverlay>
        {activeItem ? (
          <motion.div
            className="w-20 h-20 rounded-lg overflow-hidden shadow-2xl ring-2 ring-primary"
            initial={{ scale: 1 }}
            animate={{ scale: 1.1, rotate: 3 }}
          >
            <img
              src={activeItem.image_url}
              alt={activeItem.description}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// Helper function for error messages
function getCategoryLabel(category: ClothingCategory): string {
  const labels: Record<ClothingCategory, string> = {
    top: 'Camisa',
    bottom: 'Calça',
    shoes: 'Calçado',
    outerwear: 'Casaco',
    accessory: 'Acessório',
  };
  return labels[category];
}
