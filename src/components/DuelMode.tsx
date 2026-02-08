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
import { Button } from './ui/button';
import { Plus, X } from 'lucide-react';
import { LookId } from '@/store/wardrobeStore';
import { SlotType, slotTypeToCategories } from '@/constants/slotCategories';

// Categories that can be swapped together
const compatibleCategories: Record<ClothingCategory, ClothingCategory[]> = {
  top: ['top', 'outerwear'],
  outerwear: ['top', 'outerwear'],
  bottom: ['bottom'],
  shoes: ['shoes'],
  accessory: ['accessory'],
};

interface DuelModeProps {
  looks: { id: LookId; items: ClothingItem[] }[];
  visibleLooks: LookId[];
  onRemoveFromLook: (lookId: LookId, itemId: string) => void;
  onAddToLook: (lookId: LookId, slotType: SlotType) => void;
  onConfirmLook: (lookId: LookId) => void;
  onSwapItem: (fromLook: LookId, toLook: LookId, itemId: string) => void;
  onAddLook: (lookId: LookId) => void;
  onRemoveLook: (lookId: LookId) => void;
  onRegenerateLook: (lookId: LookId) => void;
}

export function DuelMode({
  looks,
  visibleLooks,
  onRemoveFromLook,
  onAddToLook,
  onConfirmLook,
  onSwapItem,
  onAddLook,
  onRemoveLook,
  onRegenerateLook,
}: DuelModeProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeLook, setActiveLook] = useState<LookId | null>(null);
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

  const allItems = looks.flatMap(l => l.items);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const itemId = active.id as string;
    setActiveId(itemId);
    
    // Find the item and its category
    for (const look of looks) {
      const item = look.items.find(i => i.id === itemId);
      if (item) {
        setActiveCategory(item.category);
        setActiveLook(look.id);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && activeLook && activeCategory) {
      const overId = over.id as string;
      const activeItem = allItems.find(i => i.id === active.id);
      
      if (!activeItem) {
        setActiveId(null);
        setActiveLook(null);
        setActiveCategory(null);
        return;
      }

      // Parse the drop target to understand where we're dropping
      const lookMatch = overId.match(/^look([A-D])-(.+)$/);
      
      if (lookMatch) {
        const targetLook = lookMatch[1] as LookId;
        const slotType = lookMatch[2];
        
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
    ? allItems.find(i => i.id === activeId)
    : null;

  const canAddC = !visibleLooks.includes('C');
  const canAddD = !visibleLooks.includes('D');

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Row 1: Look A and B - column on mobile, row on desktop */}
        <div className="flex flex-col md:flex-row gap-3 w-full">
          {looks.filter(l => l.id === 'A' || l.id === 'B').map(look => (
            <ManequimLookCard
              key={look.id}
              id={`look${look.id}`}
              title={`Look ${look.id}`}
              items={look.items}
              onRemoveItem={(itemId) => onRemoveFromLook(look.id, itemId)}
              onAddItem={(slotType) => onAddToLook(look.id, slotType)}
              onConfirm={() => onConfirmLook(look.id)}
              onRegenerate={() => onRegenerateLook(look.id)}
              activeId={activeId}
              activeCategory={activeCategory}
            />
          ))}
        </div>

        {/* Add buttons for C and D - column on mobile, row on desktop */}
        <div className="flex flex-col md:flex-row gap-3 w-full">
          {/* Button under Look A to add Look C */}
          <div className="flex-1">
            {canAddC ? (
              <Button
                variant="outline"
                className="w-full h-12 border-dashed border-2"
                onClick={() => onAddLook('C')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Look C
              </Button>
            ) : (
              <div className="space-y-2">
                {looks.filter(l => l.id === 'C').map(look => (
                  <div key={look.id} className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full bg-destructive text-destructive-foreground"
                      onClick={() => onRemoveLook('C')}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <ManequimLookCard
                      id={`look${look.id}`}
                      title={`Look ${look.id}`}
                      items={look.items}
                      onRemoveItem={(itemId) => onRemoveFromLook(look.id, itemId)}
                      onAddItem={(slotType) => onAddToLook(look.id, slotType)}
                      onConfirm={() => onConfirmLook(look.id)}
                      onRegenerate={() => onRegenerateLook(look.id)}
                      activeId={activeId}
                      activeCategory={activeCategory}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Button under Look B to add Look D */}
          <div className="flex-1">
            {canAddD ? (
              <Button
                variant="outline"
                className="w-full h-12 border-dashed border-2"
                onClick={() => onAddLook('D')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Look D
              </Button>
            ) : (
              <div className="space-y-2">
                {looks.filter(l => l.id === 'D').map(look => (
                  <div key={look.id} className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 z-10 h-6 w-6 rounded-full bg-destructive text-destructive-foreground"
                      onClick={() => onRemoveLook('D')}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    <ManequimLookCard
                      id={`look${look.id}`}
                      title={`Look ${look.id}`}
                      items={look.items}
                      onRemoveItem={(itemId) => onRemoveFromLook(look.id, itemId)}
                      onAddItem={(slotType) => onAddToLook(look.id, slotType)}
                      onConfirm={() => onConfirmLook(look.id)}
                      onRegenerate={() => onRegenerateLook(look.id)}
                      activeId={activeId}
                      activeCategory={activeCategory}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
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
