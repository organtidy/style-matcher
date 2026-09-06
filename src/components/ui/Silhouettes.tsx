import React from 'react';
import { SlotType } from '@/constants/slotCategories';
import { ThreeDMannequinCanvas } from './ThreeDMannequinCanvas';

interface SilhouetteProps {
  gender: 'man' | 'woman';
  isDressActive?: boolean;
  activeSlot?: SlotType;
  onSlotClick: (slot: SlotType) => void;
  // Optional content for slots (e.g., uploaded images)
  slotContent?: Partial<Record<SlotType, React.ReactNode>>;
}

export function Silhouette({ gender, isDressActive, activeSlot, onSlotClick, slotContent }: SilhouetteProps) {
  return (
    <ThreeDMannequinCanvas
      gender={gender}
      isDressActive={isDressActive}
      activeSlot={activeSlot}
      onSlotClick={onSlotClick}
      slotContent={slotContent}
    />
  );
}

