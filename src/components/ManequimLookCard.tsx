import { useState } from 'react';
import { ClothingItem, ClothingCategory } from '@/types/clothing';
import { useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Check, X, Plus, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SlotType, slotTypeToCategories as slotCategories } from '@/constants/slotCategories';
import { Silhouette } from './ui/Silhouettes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Re-export SlotType for backward compat
export type { SlotType };

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

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative touch-action-none cursor-grab active:cursor-grabbing w-full h-full ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <img
        src={item.image_url}
        alt={item.description}
        className="w-full h-full object-cover rounded-md"
        draggable={false}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-0 right-0 w-5 h-5 bg-destructive/90 rounded-full flex items-center justify-center text-white hover:bg-destructive transition-colors z-10"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
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
}

function DroppableSlot({ slotId, slotType, item, onRemoveItem, onAddItem, activeId, activeCategory }: DroppableSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ 
    id: slotId,
    data: { slotType, acceptedCategories: slotCategories[slotType] }
  });

  // Check if the active item can be dropped here
  const canAcceptDrop = activeCategory && slotCategories[slotType].includes(activeCategory);
  const showDropIndicator = isOver && canAcceptDrop;
  const showInvalidDrop = isOver && !canAcceptDrop;

  return (
    <div
      ref={setNodeRef}
      className={`w-full h-full rounded-md transition-all duration-200 flex items-center justify-center ${
        showDropIndicator 
          ? 'ring-2 ring-primary bg-primary/20 scale-105' 
          : showInvalidDrop
            ? 'ring-2 ring-destructive bg-destructive/10'
            : item 
              ? '' 
              : 'hover:bg-primary/10 cursor-pointer'
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
        <div className="w-full h-full flex items-center justify-center pointer-events-none">
          <Plus className="w-4 h-4 text-primary/50" />
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
  onRegenerate: () => void;
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
  onRegenerate,
  activeId,
  activeCategory 
}: ManequimLookCardProps) {
  const [gender, setGender] = useState<'man' | 'woman'>('woman');
  const [isDressActive, setIsDressActive] = useState(false);

  // Organize items by slot
  const headItem = items.find(i => 
    i.category === 'accessory' && 
    (i.sub_category === 'bone' || i.sub_category === 'oculos')
  );
  
  const dressItem = items.find(i => i.category === 'dress');
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

  const slotContent: Partial<Record<SlotType, React.ReactNode>> = {
    head: <DroppableSlot slotId={`${id}-head`} slotType="head" item={headItem} onRemoveItem={onRemoveItem} onAddItem={onAddItem} activeId={activeId} activeCategory={activeCategory} />,
    shoes: <DroppableSlot slotId={`${id}-shoes`} slotType="shoes" item={shoesItem} onRemoveItem={onRemoveItem} onAddItem={onAddItem} activeId={activeId} activeCategory={activeCategory} />,
    'accessory-left': <DroppableSlot slotId={`${id}-accessory-left`} slotType="accessory-left" item={leftAccessory} onRemoveItem={onRemoveItem} onAddItem={onAddItem} activeId={activeId} activeCategory={activeCategory} />,
    'accessory-right': <DroppableSlot slotId={`${id}-accessory-right`} slotType="accessory-right" item={rightAccessory} onRemoveItem={onRemoveItem} onAddItem={onAddItem} activeId={activeId} activeCategory={activeCategory} />,
  };

  if (gender === 'woman' && isDressActive) {
    slotContent.body = <DroppableSlot slotId={`${id}-body`} slotType="body" item={dressItem} onRemoveItem={onRemoveItem} onAddItem={onAddItem} activeId={activeId} activeCategory={activeCategory} />;
  } else {
    slotContent.top = <DroppableSlot slotId={`${id}-top`} slotType="top" item={topItem} onRemoveItem={onRemoveItem} onAddItem={onAddItem} activeId={activeId} activeCategory={activeCategory} />;
    slotContent.bottom = <DroppableSlot slotId={`${id}-bottom`} slotType="bottom" item={bottomItem} onRemoveItem={onRemoveItem} onAddItem={onAddItem} activeId={activeId} activeCategory={activeCategory} />;
  }

  return (
    <motion.div
      className="flex-1 glass-card p-3 rounded-xl flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-2 mb-3 border-b border-border/50 pb-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm text-foreground">{title}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-primary"
              onClick={onRegenerate}
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground">{items.length} peças</span>
          </div>
        </div>

        {/* Gender and Dress Toggles */}
        <div className="flex flex-wrap gap-4 items-center mt-1">
          <div className="flex items-center space-x-2">
            <Label htmlFor="gender-toggle" className="text-xs text-muted-foreground">Homem</Label>
            <Switch 
              id="gender-toggle" 
              checked={gender === 'woman'}
              onCheckedChange={(checked) => {
                setGender(checked ? 'woman' : 'man');
                if (!checked) setIsDressActive(false);
              }}
            />
            <Label htmlFor="gender-toggle" className="text-xs text-muted-foreground">Mulher</Label>
          </div>

          {gender === 'woman' && (
            <div className="flex items-center space-x-2 border-l border-border/50 pl-4">
              <Label htmlFor="dress-toggle" className="text-xs text-muted-foreground">Multi Peças</Label>
              <Switch 
                id="dress-toggle" 
                checked={isDressActive}
                onCheckedChange={setIsDressActive}
              />
              <Label htmlFor="dress-toggle" className="text-xs text-muted-foreground">Vestido</Label>
            </div>
          )}
        </div>
      </div>

      {/* Silhouette Layout */}
      <div className="flex-1 flex items-center justify-center py-4">
        <Silhouette 
          gender={gender} 
          isDressActive={isDressActive}
          activeSlot={null as any}
          onSlotClick={(slot) => {
            const item = slot === 'head' ? headItem :
                         slot === 'top' ? topItem :
                         slot === 'bottom' ? bottomItem :
                         slot === 'body' ? dressItem :
                         slot === 'shoes' ? shoesItem :
                         slot === 'accessory-left' ? leftAccessory :
                         slot === 'accessory-right' ? rightAccessory : null;
            if (!item) {
              onAddItem(slot);
            }
          }}
          slotContent={slotContent}
        />
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
