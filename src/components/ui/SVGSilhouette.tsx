import React from 'react';
import { SlotType } from '@/constants/slotCategories';

interface SVGSilhouetteProps {
  gender: 'man' | 'woman';
  isDressActive?: boolean;
  activeSlot?: SlotType;
  onSlotClick: (slot: SlotType) => void;
  slotContent?: Partial<Record<SlotType, React.ReactNode>>;
}

export function SVGSilhouette({ gender, isDressActive, activeSlot, onSlotClick, slotContent }: SVGSilhouetteProps) {
  const getPathClass = (slot: SlotType) => {
    return `cursor-pointer transition-all duration-200 stroke-2 stroke-muted-foreground/30 ${
      activeSlot === slot ? 'fill-primary/20 stroke-primary' : 'fill-muted/20 hover:fill-primary/10 hover:stroke-primary/50'
    }`;
  };

  return (
    <div className="relative w-full max-w-[200px] aspect-[1/2] mx-auto">
      <svg viewBox="0 0 200 400" className="w-full h-full drop-shadow-sm">
        <defs>
          <clipPath id="head-clip">
            <circle cx="100" cy="40" r="30" />
          </clipPath>
          <clipPath id="torso-clip">
            {gender === 'woman' ? (
              <path d="M70,80 C70,70 130,70 130,80 L140,150 C120,200 80,200 60,150 Z" />
            ) : (
              <path d="M60,80 C60,70 140,70 140,80 L150,150 C150,200 50,200 50,150 Z" />
            )}
          </clipPath>
          <clipPath id="legs-clip">
            {gender === 'woman' ? (
              <path d="M75,180 C100,180 100,180 125,180 L140,320 L110,320 L100,220 L90,320 L60,320 Z" />
            ) : (
              <path d="M70,180 C100,180 100,180 130,180 L145,320 L115,320 L100,220 L85,320 L55,320 Z" />
            )}
          </clipPath>
          <clipPath id="dress-clip">
            <path d="M70,80 C70,70 130,70 130,80 L150,250 C150,300 50,300 50,250 Z" />
          </clipPath>
          <clipPath id="shoes-clip">
            <path d="M55,330 C70,330 90,330 90,330 C90,350 55,350 55,330 M110,330 C130,330 145,330 145,330 C145,350 110,350 110,330" />
          </clipPath>
          <clipPath id="acc-left-clip">
            <path d="M30,160 C30,150 50,150 50,160 C50,170 30,170 30,160" />
          </clipPath>
          <clipPath id="acc-right-clip">
            <path d="M150,160 C150,150 170,150 170,160 C170,170 150,170 150,160" />
          </clipPath>
        </defs>

        {/* HEAD */}
        {!(gender === 'woman' && isDressActive) && (
          <g onClick={() => onSlotClick('head')}>
            <circle cx="100" cy="40" r="30" className={getPathClass('head')} />
            {slotContent?.head && (
              <foreignObject x="70" y="10" width="60" height="60" clipPath="url(#head-clip)">
                <div className="w-full h-full pointer-events-none">{slotContent.head}</div>
              </foreignObject>
            )}
          </g>
        )}

        {/* BODY / TORSO + LEGS */}
        {gender === 'woman' && isDressActive ? (
          <g onClick={() => onSlotClick('body')}>
            <path d="M70,80 C70,70 130,70 130,80 L150,250 C150,300 50,300 50,250 Z" className={getPathClass('body')} />
            {slotContent?.body && (
              <foreignObject x="50" y="70" width="100" height="230" clipPath="url(#dress-clip)">
                <div className="w-full h-full pointer-events-none">{slotContent.body}</div>
              </foreignObject>
            )}
          </g>
        ) : (
          <>
            {/* TORSO */}
            <g onClick={() => onSlotClick('top')}>
              {gender === 'woman' ? (
                <path d="M70,80 C70,70 130,70 130,80 L140,150 C120,200 80,200 60,150 Z" className={getPathClass('top')} />
              ) : (
                <path d="M60,80 C60,70 140,70 140,80 L150,150 C150,200 50,200 50,150 Z" className={getPathClass('top')} />
              )}
              {slotContent?.top && (
                <foreignObject x="50" y="70" width="100" height="130" clipPath="url(#torso-clip)">
                  <div className="w-full h-full pointer-events-none">{slotContent.top}</div>
                </foreignObject>
              )}
            </g>

            {/* LEGS */}
            <g onClick={() => onSlotClick('bottom')}>
              {gender === 'woman' ? (
                <path d="M75,180 C100,180 100,180 125,180 L140,320 L110,320 L100,220 L90,320 L60,320 Z" className={getPathClass('bottom')} />
              ) : (
                <path d="M70,180 C100,180 100,180 130,180 L145,320 L115,320 L100,220 L85,320 L55,320 Z" className={getPathClass('bottom')} />
              )}
              {slotContent?.bottom && (
                <foreignObject x="50" y="180" width="100" height="140" clipPath="url(#legs-clip)">
                  <div className="w-full h-full pointer-events-none">{slotContent.bottom}</div>
                </foreignObject>
              )}
            </g>
          </>
        )}

        {/* SHOES */}
        <g onClick={() => onSlotClick('shoes')}>
          <path d="M55,330 C70,330 90,330 90,330 C90,350 55,350 55,330 M110,330 C130,330 145,330 145,330 C145,350 110,350 110,330" className={getPathClass('shoes')} />
          {slotContent?.shoes && (
            <foreignObject x="50" y="325" width="100" height="30" clipPath="url(#shoes-clip)">
              <div className="w-full h-full pointer-events-none">{slotContent.shoes}</div>
            </foreignObject>
          )}
        </g>

        {/* ACCESSORY LEFT (Wrists) */}
        {!(gender === 'woman' && isDressActive) && (
          <g onClick={() => onSlotClick('accessory-left')}>
            <path d="M30,160 C30,150 50,150 50,160 C50,170 30,170 30,160 Z" className={getPathClass('accessory-left')} />
            {slotContent?.['accessory-left'] && (
              <foreignObject x="25" y="145" width="30" height="30" clipPath="url(#acc-left-clip)">
                <div className="w-full h-full pointer-events-none">{slotContent['accessory-left']}</div>
              </foreignObject>
            )}
          </g>
        )}

        {/* ACCESSORY RIGHT (Necklace / Earrings) */}
        {!(gender === 'woman' && isDressActive) && (
          <g onClick={() => onSlotClick('accessory-right')}>
            <path d="M150,160 C150,150 170,150 170,160 C170,170 150,170 150,160 Z" className={getPathClass('accessory-right')} />
            {slotContent?.['accessory-right'] && (
              <foreignObject x="145" y="145" width="30" height="30" clipPath="url(#acc-right-clip)">
                <div className="w-full h-full pointer-events-none">{slotContent['accessory-right']}</div>
              </foreignObject>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}
