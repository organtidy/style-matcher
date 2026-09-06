import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SlotType } from '@/constants/slotCategories';

interface ThreeDMannequinCanvasProps {
  gender: 'man' | 'woman';
  isDressActive?: boolean;
  activeSlot?: SlotType;
  onSlotClick: (slot: SlotType) => void;
  slotContent?: Partial<Record<SlotType, React.ReactNode>>;
}

export function ThreeDMannequinCanvas({
  gender,
  isDressActive,
  activeSlot,
  onSlotClick,
  slotContent,
}: ThreeDMannequinCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<SlotType | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth || 220;
    const height = containerRef.current.clientHeight || 440;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    // Lights setup for glossy studio mannequin look
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xa5b4fc, 0.6);
    dirLight2.position.set(-5, -5, -2);
    scene.add(dirLight2);

    // Texture & Mesh setup
    const textureLoader = new THREE.TextureLoader();
    const imageSrc = gender === 'woman' ? '/mannequin-female.jpg' : '/mannequin-male.jpg';

    textureLoader.load(imageSrc, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      
      const geometry = new THREE.PlaneGeometry(2.1, 4.2, 32, 64);
      
      // Add subtle 3D curvature to plane for true 3D volumetric feel
      const positionAttribute = geometry.attributes.position;
      for (let i = 0; i < positionAttribute.count; i++) {
        const x = positionAttribute.getX(i);
        const z = -Math.pow(x, 2) * 0.18;
        positionAttribute.setZ(i, z);
      }
      geometry.computeVertexNormals();

      const material = new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        roughness: 0.15,
        metalness: 0.1,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      meshRef.current = mesh;
      scene.add(mesh);
    });

    // Animation Loop
    let animationFrameId: number;
    let autoRotateAngle = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (meshRef.current && !isDraggingRef.current) {
        autoRotateAngle += 0.005;
        meshRef.current.rotation.y = Math.sin(autoRotateAngle) * 0.15;
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [gender]);

  // Mouse / Touch Drag handlers for 3D rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !meshRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    meshRef.current.rotation.y += deltaX * 0.01;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Slot overlay coordinates (normalized percentage for overlay placement)
  const getSlotPosition = (slot: SlotType) => {
    switch (slot) {
      case 'head':
        return { top: '8%', left: '50%', width: '38%', height: '14%' };
      case 'body':
        return { top: '23%', left: '50%', width: '60%', height: '52%' };
      case 'top':
        return { top: '23%', left: '50%', width: '58%', height: '28%' };
      case 'bottom':
        return { top: '51%', left: '50%', width: '54%', height: '32%' };
      case 'shoes':
        return { top: '85%', left: '50%', width: '52%', height: '12%' };
      case 'accessory-left':
        return { top: '44%', left: '20%', width: '22%', height: '12%' };
      case 'accessory-right':
        return { top: '44%', left: '80%', width: '22%', height: '12%' };
      default:
        return { top: '50%', left: '50%', width: '30%', height: '30%' };
    }
  };

  const slotsToRender: SlotType[] = [
    'head',
    ...(gender === 'woman' && isDressActive ? (['body'] as SlotType[]) : (['top', 'bottom'] as SlotType[])),
    'shoes',
    'accessory-left',
    'accessory-right',
  ];

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[240px] aspect-[1/2] mx-auto select-none overflow-hidden rounded-xl bg-gradient-to-b from-card/60 via-card/30 to-card/70 border border-border/40 shadow-inner"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Interactive 3D HTML Slots */}
      {slotsToRender.map((slot) => {
        const pos = getSlotPosition(slot);
        const isHovered = hoveredSlot === slot;
        const isActive = activeSlot === slot;
        const content = slotContent?.[slot];

        return (
          <div
            key={slot}
            onClick={(e) => {
              e.stopPropagation();
              onSlotClick(slot);
            }}
            onMouseEnter={() => setHoveredSlot(slot)}
            onMouseLeave={() => setHoveredSlot(null)}
            style={{
              top: pos.top,
              left: pos.left,
              width: pos.width,
              height: pos.height,
              transform: 'translate(-50%, -50%)',
            }}
            className={`absolute rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border ${
              isActive
                ? 'border-primary bg-primary/25 shadow-[0_0_15px_rgba(147,51,234,0.5)] scale-105'
                : isHovered
                ? 'border-primary/80 bg-primary/15 shadow-[0_0_10px_rgba(147,51,234,0.3)] scale-102'
                : content
                ? 'border-transparent'
                : 'border-dashed border-primary/30 bg-primary/5 hover:border-primary/60'
            }`}
          >
            {content ? (
              <div className="w-full h-full p-1">{content}</div>
            ) : (
              <span className="text-[10px] font-medium text-primary/70 uppercase tracking-wider bg-background/80 px-2 py-0.5 rounded-full border border-primary/20 backdrop-blur-sm pointer-events-none">
                {slot}
              </span>
            )}
          </div>
        );
      })}

      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-muted-foreground/70 pointer-events-none px-1">
        <span>3D Manequim</span>
        <span>Arraste para girar 🔄</span>
      </div>
    </div>
  );
}
