import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SlotType } from '@/constants/slotCategories';
import { ThreeDMannequinCanvas } from './ThreeDMannequinCanvas';
import { SVGSilhouette } from './SVGSilhouette';

interface SilhouetteProps {
  gender: 'man' | 'woman';
  isDressActive?: boolean;
  activeSlot?: SlotType;
  onSlotClick: (slot: SlotType) => void;
  slotContent?: Partial<Record<SlotType, React.ReactNode>>;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class SilhouetteErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Three.js render error, falling back to SVG mannequin:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function Silhouette(props: SilhouetteProps) {
  const fallback = <SVGSilhouette {...props} />;

  return (
    <SilhouetteErrorBoundary fallback={fallback}>
      <ThreeDMannequinCanvas {...props} />
    </SilhouetteErrorBoundary>
  );
}
