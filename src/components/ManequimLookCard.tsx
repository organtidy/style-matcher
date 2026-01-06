import { ClothingItem, ClothingCategory } from '@/types/clothing';
import { useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Check, X, User, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Slot types for the mannequin
type SlotType = 'head' | 'top' | 'bottom' | 'shoes' | 'accessory-left' | 'accessory-right';

// Export SlotType for external use
export type { SlotType };

// Map category to slot
const categoryToSlot: Record<ClothingCategory, SlotType> = {
  accessory: 'head', // Default, will be overridden for non-head accessories
  outerwear: 'top',
  top: 'top',
  bottom: 'bottom',
  shoes: 'shoes',
};

// Categories that can go in each slot
const slotCategories: Record<SlotType, ClothingCategory[]> = {
  'head': ['accessory'], // bones, óculos
  'top': ['top', 'outerwear'],
  'bottom': ['bottom'],
  'shoes': ['shoes'],
  'accessory-left': ['accessory'], // pulseiras, relógios
  'accessory-right': ['accessory'], // brincos, colares
};

interface DraggableSlotItemProps {
  item: ClothingItem;
  slotType: SlotType;
  onRemove: () => void;
  isDragging?: boolean;
}

function DraggableSlotItem({ item, slotType, onRemove, isDragging }: DraggableSlotItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: item.id,
    data: { category: item.category, slotType }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isAccessorySlot = slotType.startsWith('accessory-');
  const isHeadSlot = slotType === 'head';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative touch-action-none cursor-grab active:cursor-grabbing rounded-lg overflow-hidden ${
        isDragging ? 'opacity-50 scale-105' : ''
      } ${isAccessorySlot ? 'w-16 h-16' : isHeadSlot ? 'w-20 h-20' : 'w-full h-full'}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 1.02 }}
    >
      <img
        src={item.image_url}
        alt={item.description}
        className="w-full h-full object-cover"
        draggable={false}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 w-5 h-5 bg-destructive/90 rounded-full flex items-center justify-center text-white hover:bg-destructive transition-colors z-10"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

interface DroppableSlotProps {
  slotId: string;
  slotType: SlotType;
  item?: ClothingItem;
  onRemoveItem: (itemId: string) => void;
  onAddItem: (slotType: SlotType) => void;
  activeId?: string | null;
  activeCategory?: ClothingCategory | null;
  label: string;
}

function DroppableSlot({ slotId, slotType, item, onRemoveItem, onAddItem, activeId, activeCategory, label }: DroppableSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ 
    id: slotId,
    data: { slotType, acceptedCategories: slotCategories[slotType] }
  });

  // Check if the active item can be dropped here
  const canAcceptDrop = activeCategory && slotCategories[slotType].includes(activeCategory);
  const showDropIndicator = isOver && canAcceptDrop;
  const showInvalidDrop = isOver && !canAcceptDrop;

  const isAccessorySlot = slotType.startsWith('accessory-');
  const isHeadSlot = slotType === 'head';

  return (
    <div
      ref={setNodeRef}
      className={`relative flex items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200 ${
        showDropIndicator 
          ? 'border-primary bg-primary/20 scale-105' 
          : showInvalidDrop
            ? 'border-destructive bg-destructive/10'
            : item 
              ? 'border-transparent' 
              : 'border-muted-foreground/30 bg-muted/20 hover:border-primary/50 hover:bg-primary/10 cursor-pointer'
      } ${
        isAccessorySlot 
          ? 'w-16 h-16' 
          : isHeadSlot 
            ? 'w-20 h-20 mx-auto' 
            : 'w-full aspect-square'
      }`}
      onClick={() => {
        if (!item) {
          onAddItem(slotType);
        }
      }}
    >
      {item ? (
        <DraggableSlotItem
          item={item}
          slotType={slotType}
          onRemove={() => onRemoveItem(item.id)}
          isDragging={activeId === item.id}
        />
      ) : (
        <div className="flex flex-col items-center justify-center gap-1">
          <Plus className="w-4 h-4 text-muted-foreground/50" />
          <span className="text-[10px] text-muted-foreground/50 text-center px-1">
            {label}
          </span>
        </div>
      )}
    </div>
  );
}

interface ManequimLookCardProps {
  id: string;
  title: string;
  items: ClothingItem[];
  onRemoveItem: (itemId: string) => void;
  onAddItem: (slotType: SlotType) => void;
  onConfirm: () => void;
  activeId?: string | null;
  activeCategory?: ClothingCategory | null;
}

export function ManequimLookCard({ 
  id, 
  title, 
  items, 
  onRemoveItem, 
  onAddItem,
  onConfirm, 
  activeId,
  activeCategory 
}: ManequimLookCardProps) {
  // Organize items by slot
  const headItem = items.find(i => 
    i.category === 'accessory' && 
    (i.sub_category === 'bone' || i.sub_category === 'oculos')
  );
  
  const topItem = items.find(i => i.category === 'top' || i.category === 'outerwear');
  const bottomItem = items.find(i => i.category === 'bottom');
  const shoesItem = items.find(i => i.category === 'shoes');
  
  // Accessories for sides (excluding head accessories)
  const sideAccessories = items.filter(i => 
    i.category === 'accessory' && 
    i.sub_category !== 'bone' && 
    i.sub_category !== 'oculos'
  );
  const leftAccessory = sideAccessories.find(i => 
    i.sub_category === 'pulseira' || i.sub_category === 'relogio'
  );
  const rightAccessory = sideAccessories.find(i => 
    i.sub_category === 'brinco' || i.sub_category === 'colar' || i.sub_category === 'outro'
  );

  return (
    <motion.div
      className="flex-1 glass-card p-3 rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm text-foreground">{title}</h3>
        <span className="text-xs text-muted-foreground">{items.length} peças</span>
      </div>

      {/* Mannequin Layout */}
      <div className="relative flex flex-col items-center gap-2 py-2">
        {/* Mannequin silhouette background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <User className="w-32 h-48 text-foreground" />
        </div>

        {/* Head/Hat slot */}
        <DroppableSlot
          slotId={`${id}-head`}
          slotType="head"
          item={headItem}
          onRemoveItem={onRemoveItem}
          onAddItem={onAddItem}
          activeId={activeId}
          activeCategory={activeCategory}
          label="Boné"
        />

        {/* Middle row: Left Accessory - Top - Right Accessory */}
        <div className="flex items-center gap-2 w-full justify-center">
          <DroppableSlot
            slotId={`${id}-accessory-left`}
            slotType="accessory-left"
            item={leftAccessory}
            onRemoveItem={onRemoveItem}
            onAddItem={onAddItem}
            activeId={activeId}
            activeCategory={activeCategory}
            label="Pulso"
          />
          
          <div className="w-24">
            <DroppableSlot
              slotId={`${id}-top`}
              slotType="top"
              item={topItem}
              onRemoveItem={onRemoveItem}
              onAddItem={onAddItem}
              activeId={activeId}
              activeCategory={activeCategory}
              label="Camisa"
            />
          </div>
          
          <DroppableSlot
            slotId={`${id}-accessory-right`}
            slotType="accessory-right"
            item={rightAccessory}
            onRemoveItem={onRemoveItem}
            onAddItem={onAddItem}
            activeId={activeId}
            activeCategory={activeCategory}
            label="Jóias"
          />
        </div>

        {/* Bottom row: Left padding - Bottom - Right padding */}
        <div className="flex items-center gap-2 w-full justify-center">
          <div className="w-16" /> {/* Spacer for alignment */}
          
          <div className="w-24">
            <DroppableSlot
              slotId={`${id}-bottom`}
              slotType="bottom"
              item={bottomItem}
              onRemoveItem={onRemoveItem}
              onAddItem={onAddItem}
              activeId={activeId}
              activeCategory={activeCategory}
              label="Calça"
            />
          </div>
          
          <div className="w-16" /> {/* Spacer for alignment */}
        </div>

        {/* Shoes slot */}
        <div className="w-20">
          <DroppableSlot
            slotId={`${id}-shoes`}
            slotType="shoes"
            item={shoesItem}
            onRemoveItem={onRemoveItem}
            onAddItem={onAddItem}
            activeId={activeId}
            activeCategory={activeCategory}
            label="Calçado"
          />
        </div>
      </div>

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
