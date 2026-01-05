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
import { ClothingItem } from '@/types/clothing';
import { LookCard } from './LookCard';
import { motion } from 'framer-motion';

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
    setActiveId(active.id as string);
    
    // Determine which look the item is from
    if (lookA.find(i => i.id === active.id)) {
      setActiveLook('A');
    } else if (lookB.find(i => i.id === active.id)) {
      setActiveLook('B');
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && activeLook) {
      const overId = over.id as string;
      
      // Check if dropped on the other look container
      if (overId === 'lookA' && activeLook === 'B') {
        onSwapItem('B', 'A', active.id as string);
      } else if (overId === 'lookB' && activeLook === 'A') {
        onSwapItem('A', 'B', active.id as string);
      }
      // Check if dropped on an item in the other look
      else {
        const isOverInA = lookA.find(i => i.id === overId);
        const isOverInB = lookB.find(i => i.id === overId);
        
        if (isOverInA && activeLook === 'B') {
          onSwapItem('B', 'A', active.id as string);
        } else if (isOverInB && activeLook === 'A') {
          onSwapItem('A', 'B', active.id as string);
        }
      }
    }

    setActiveId(null);
    setActiveLook(null);
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
        <LookCard
          id="lookA"
          title="Look A"
          items={lookA}
          onRemoveItem={onRemoveFromA}
          onConfirm={onConfirmA}
          activeId={activeId}
        />
        <LookCard
          id="lookB"
          title="Look B"
          items={lookB}
          onRemoveItem={onRemoveFromB}
          onConfirm={onConfirmB}
          activeId={activeId}
        />
      </div>

      <DragOverlay>
        {activeItem ? (
          <motion.div
            className="clothing-item dragging-item w-24 h-24"
            initial={{ scale: 1 }}
            animate={{ scale: 1.1, rotate: 3 }}
          >
            <img
              src={activeItem.image_url}
              alt={activeItem.description}
              className="clothing-item-image"
            />
          </motion.div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
