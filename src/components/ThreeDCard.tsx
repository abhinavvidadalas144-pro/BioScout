import React, { useState, useRef, useEffect } from "react";

interface ThreeDCardProps {
  children: React.ReactNode;
  className?: string;
  depth?: number; // Maximum rotation in degrees
  scale?: number; // Scale on hover
  glareOpacity?: number; // Maximum glare opacity
}

export default function ThreeDCard({
  children,
  className = "",
  depth = 12,
  scale = 1.03,
  glareOpacity = 0.2
}: ThreeDCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate normalized mouse positions (-1 to 1) relative to center of card
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const x = (mouseX / width - 0.5) * 2; // -1 to 1
    const y = (mouseY / height - 0.5) * 2; // -1 to 1
    
    setCoords({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  // Convert coords into rotation degrees
  // Tilts around X axis based on Y movement, and around Y axis based on X movement
  const rotateY = coords.x * depth;
  const rotateX = -coords.y * depth;

  // Glare position coordinates for CSS radial-gradient
  const glareX = ((coords.x + 1) / 2) * 100;
  const glareY = ((coords.y + 1) / 2) * 100;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative select-none transition-transform duration-500 ease-out [perspective:1000px] ${className}`}
      style={{
        transform: isHovered ? `scale(${scale})` : "scale(1)",
        willChange: "transform",
      }}
    >
      <div
        className="w-full h-full relative transition-all duration-300 ease-out"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Shiny glare surface */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] z-30 transition-opacity duration-300 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, ${glareOpacity}) 0%, rgba(255, 255, 255, 0) 75%)`,
            opacity: isHovered ? 1 : 0,
            borderRadius: "inherit",
          }}
        />

        {/* Shadow that updates based on tilt coordinates */}
        <div
          className="absolute inset-0 -z-10 rounded-[inherit] opacity-40 transition-shadow duration-300"
          style={{
            boxShadow: isHovered
              ? `${-coords.x * 20}px ${-coords.y * 20}px 32px -4px rgba(0, 0, 0, 0.25), 0 10px 15px -3px rgba(0, 0, 0, 0.1)`
              : "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
        />

        {/* Content Container preserving 3D depth */}
        <div className="w-full h-full [transform-style:preserve-3d]">
          {children}
        </div>
      </div>
    </div>
  );
}
