import { useState } from 'react';
import { ClothingItem, ClothingCategory } from '@/types/clothing';
import { useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { Check, X, Plus, RefreshCw, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SlotType, slotTypeToCategories as slotCategories } from '@/constants/slotCategories';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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

  const isAccessorySlot = slotType.startsWith('accessory-');
  const isHeadSlot = slotType === 'head';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative touch-action-none cursor-grab active:cursor-grabbing rounded-md overflow-hidden ${
        isDragging ? 'opacity-50' : ''
      } ${isAccessorySlot ? 'w-16 h-16' : isHeadSlot ? 'w-20 h-20' : 'w-full h-full'}`}
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
        className="absolute top-1 right-1 w-5 h-5 bg-destructive/90 rounded-full flex items-center justify-center text-white hover:bg-destructive transition-colors z-10"
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
  label: string;
  className?: string;
}

function DroppableSlot({
  slotId,
  slotType,
  item,
  onRemoveItem,
  onAddItem,
  activeId,
  activeCategory,
  label,
  className = '',
}: DroppableSlotProps) {
  const { setNodeRef, isOver } = useDroppable({ 
    id: slotId,
    data: { slotType, acceptedCategories: slotCategories[slotType] }
  });

  const canAcceptDrop = activeCategory && slotCategories[slotType]?.includes(activeCategory);
  const showDropIndicator = isOver && canAcceptDrop;
  const showInvalidDrop = isOver && !canAcceptDrop;

  const isAccessorySlot = slotType.startsWith('accessory-');
  const isHeadSlot = slotType === 'head';
  const isBodySlot = slotType === 'body';

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
            : isBodySlot
              ? 'w-32 h-48 mx-auto'
              : 'w-full aspect-square'
      } ${className}`}
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
        <div className="flex flex-col items-center justify-center gap-1 p-2 text-center">
          <Plus className="w-4 h-4 text-muted-foreground/50" />
          <span className="text-[10px] text-muted-foreground/50 leading-tight">
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
  
  // Accessories for sides
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

        {/* Dress Toggle */}
        <div className="flex items-center space-x-2 mt-1">
          <Label htmlFor={`${id}-dress-toggle`} className="text-xs text-muted-foreground">Multi Peças</Label>
          <Switch 
            id={`${id}-dress-toggle`} 
            checked={isDressActive}
            onCheckedChange={setIsDressActive}
          />
          <Label htmlFor={`${id}-dress-toggle`} className="text-xs text-muted-foreground">Vestido</Label>
        </div>
      </div>

      {/* Slots Layout */}
      {isDressActive ? (
        /* Vestido Mode: ONLY 2 SLOTS (Vestido e Sapatos) */
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4">
          <DroppableSlot
            slotId={`${id}-body`}
            slotType="body"
            item={dressItem}
            onRemoveItem={onRemoveItem}
            onAddItem={onAddItem}
            activeId={activeId}
            activeCategory={activeCategory}
            label="Vestido"
          />

          <div className="w-24">
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
      ) : (
        /* Multi Peças Mode: Original Square Slots Layout */
        <div className="relative flex-1 flex flex-col items-center gap-2 py-2">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <User className="w-32 h-48 text-foreground" />
          </div>

          {/* Head slot */}
          <DroppableSlot
            slotId={`${id}-head`}
            slotType="head"
            item={headItem}
            onRemoveItem={onRemoveItem}
            onAddItem={onAddItem}
            activeId={activeId}
            activeCategory={activeCategory}
            label="Boné / Óculos"
          />

          {/* Middle row: Pulso - Camisa - Jóias */}
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

          {/* Bottom row: Calça */}
          <div className="flex items-center gap-2 w-full justify-center">
            <div className="w-16" />
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
            <div className="w-16" />
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
      )}

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
