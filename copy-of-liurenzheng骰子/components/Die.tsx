import React, { useMemo, useState, useEffect, useRef } from 'react';
import { DiceValue } from '../types';

interface DieProps {
  value: DiceValue;
  rollTrigger: number;
}

const Die: React.FC<DieProps> = ({ value, rollTrigger }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const isFirstRender = useRef(true);

  // Target rotations to bring each face to the front (0,0,1)
  // Based on the initial transforms defined in the JSX below
  const faceRotations: Record<number, { x: number; y: number }> = useMemo(() => ({
    1: { x: 0, y: 0 },    // Front face (Y0) -> Needs 0
    2: { x: 90, y: 0 },   // Bottom face (X-90) -> Needs X+90 to face front
    3: { x: 0, y: 90 },   // Left face visually (Y-90) -> Needs Y+90 to face front
    4: { x: 0, y: -90 },  // Right face visually (Y90) -> Needs Y-90 to face front
    5: { x: -90, y: 0 },  // Top face (X90) -> Needs X-90 to face front
    6: { x: 180, y: 0 },  // Back face (Y180) -> Needs Y180
  }), []);

  // Distinct background colors for each face
  const faceColors: Record<number, string> = {
    1: 'radial-gradient(circle at center, #fee2e2 0%, #fca5a5 100%)', // Red
    2: 'radial-gradient(circle at center, #dbeafe 0%, #93c5fd 100%)', // Blue
    3: 'radial-gradient(circle at center, #dcfce7 0%, #86efac 100%)', // Green
    4: 'radial-gradient(circle at center, #fef9c3 0%, #fde047 100%)', // Yellow
    5: 'radial-gradient(circle at center, #f3e8ff 0%, #d8b4fe 100%)', // Purple
    6: 'radial-gradient(circle at center, #ffedd5 0%, #fdba74 100%)', // Orange
  };

  useEffect(() => {
    // Skip animation on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const target = faceRotations[value];

    setRotation(current => {
      // We want to spin the die 3 to 6 times (1080 to 2160 degrees) randomly
      // This ensures a vigorous roll feeling
      const minSpins = 3;
      const spinVariance = 3;
      
      const spinsX = minSpins + Math.random() * spinVariance;
      const spinsY = minSpins + Math.random() * spinVariance;
      
      // Calculate delta to add. We multiply by 360 to keep phase alignment conceptually
      // but we will adjust precisely below.
      const deltaX = spinsX * 360;
      const deltaY = spinsY * 360;

      // Function to find the target angle that is:
      // 1. significantly larger than current (moving forward in time/rotation)
      // 2. equivalent to the target face angle (mod 360)
      const calculateNextRotation = (currentAngle: number, addedRotation: number, targetFaceAngle: number) => {
        const roughTarget = currentAngle + addedRotation;
        
        // We want result % 360 === targetFaceAngle % 360
        // Find the nearest multiple of 360 relative to roughTarget
        const base = Math.floor(roughTarget / 360) * 360;
        
        // Add the target offset
        let result = base + targetFaceAngle;
        
        // Ensure we are always moving forward (increasing rotation value)
        // If the calculation resulted in a value less than roughTarget, add another 360
        if (result < roughTarget) {
           result += 360;
        }
        
        return result;
      };

      return {
        x: calculateNextRotation(current.x, deltaX, target.x),
        y: calculateNextRotation(current.y, deltaY, target.y)
      };
    });
  }, [value, rollTrigger, faceRotations]);

  // Define dot positions for each face
  const renderFace = (faceValue: number) => {
    const dots: number[] = [];
    switch (faceValue) {
        case 1: dots.push(4); break;
        case 2: dots.push(0, 8); break;
        case 3: dots.push(0, 4, 8); break;
        case 4: dots.push(0, 2, 6, 8); break;
        case 5: dots.push(0, 2, 4, 6, 8); break;
        case 6: dots.push(0, 2, 3, 5, 6, 8); break;
    }

    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-1 w-full h-full p-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="flex justify-center items-center">
             {dots.includes(i) && <div className="dot w-4 h-4 sm:w-6 sm:h-6 bg-slate-800 rounded-full shadow-inner" />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="scene w-32 h-32 sm:w-48 sm:h-48 mx-auto">
      <div 
        className="cube" 
        style={{ 
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` 
        }}
      >
        {/* Face 1: Front */}
        <div className="cube__face" style={{ transform: 'rotateY(0deg) translateZ(var(--face-translate))', background: faceColors[1] }}>
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">{renderFace(1)}</div>
        </div>
        {/* Face 2: Bottom */}
        <div className="cube__face" style={{ transform: 'rotateX(-90deg) translateZ(var(--face-translate))', background: faceColors[2] }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">{renderFace(2)}</div>
        </div>
        {/* Face 3: Right (visually Left in code due to -90, but handled by logic) */}
        <div className="cube__face" style={{ transform: 'rotateY(-90deg) translateZ(var(--face-translate))', background: faceColors[3] }}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">{renderFace(3)}</div>
        </div>
        {/* Face 4: Left (visually Right in code due to 90) */}
        <div className="cube__face" style={{ transform: 'rotateY(90deg) translateZ(var(--face-translate))', background: faceColors[4] }}>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">{renderFace(4)}</div>
        </div>
        {/* Face 5: Top */}
        <div className="cube__face" style={{ transform: 'rotateX(90deg) translateZ(var(--face-translate))', background: faceColors[5] }}>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">{renderFace(5)}</div>
        </div>
        {/* Face 6: Back */}
        <div className="cube__face" style={{ transform: 'rotateY(180deg) translateZ(var(--face-translate))', background: faceColors[6] }}>
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">{renderFace(6)}</div>
        </div>
      </div>
       
       <style>{`
         .scene {
           --face-translate: 4rem;
         }
         @media (min-width: 640px) {
           .scene {
             --face-translate: 6rem;
           }
         }
       `}</style>
    </div>
  );
};

export default Die;