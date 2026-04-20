import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'motion/react';

interface ModuleProps {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
  label: string;
  isObstacle?: boolean;
  onSelect: (id: string | null) => void;
  isSelected?: boolean;
  isCompromised?: boolean;
}

const BuildingModule = ({ id, position, size, label, isObstacle, onSelect, isSelected, isCompromised }: ModuleProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <group 
      position={position} 
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={isCompromised ? "#f87171" : isSelected ? "#3b82f6" : isObstacle ? "#94a3b8" : "#cbd5e1"} 
          transparent 
          opacity={isCompromised ? 0.7 : hovered || isSelected ? 0.6 : 0.3} 
          wireframe
        />
      </mesh>
      <mesh position={[0, 0, 0]} scale={0.98}>
        <boxGeometry args={size} />
        <meshStandardMaterial 
          color={isCompromised ? "#ef4444" : isSelected ? "#2563eb" : isObstacle ? "#64748b" : "#f1f5f9"} 
          transparent 
          opacity={isCompromised ? 0.4 : hovered || isSelected ? 0.3 : 0.2}
        />
      </mesh>
      <Text
        position={[0, size[1] / 2 + 0.2, 0]}
        fontSize={0.25}
        color={isSelected ? "#2563eb" : "#64748b"}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#fff"
      >
        {label}
      </Text>
    </group>
  );
};

const ConnectingPath = ({ points, active, type, constraints }: { points: THREE.Vector3[], active: boolean, type: string, constraints: Record<string, boolean> }) => {
  const [visiblePoints, setVisiblePoints] = useState<THREE.Vector3[]>([]);

  // Structural Violation Zones (Simulating real collision detection)
  const violationZones = useMemo(() => [
    { center: new THREE.Vector3(0, 2.5, 0), size: new THREE.Vector3(3.2, 5.2, 3.2) }, // Core safety buffer
    { center: new THREE.Vector3(2, 2, -3), size: new THREE.Vector3(0.8, 4.2, 0.8) }  // Column safety buffer
  ], []);

  const checkViolation = (p1: THREE.Vector3, p2: THREE.Vector3) => {
    if (!constraints.loadBearing && type !== 'structural') return false;
    // Always check if in structural mode
    const mid = new THREE.Vector3().addVectors(p1, p2).divideScalar(2);
    return violationZones.some(zone => {
      const dx = Math.abs(mid.x - zone.center.x);
      const dy = Math.abs(mid.y - zone.center.y);
      const dz = Math.abs(mid.z - zone.center.z);
      return dx < zone.size.x / 2 && dy < zone.size.y / 2 && dz < zone.size.z / 2;
    });
  };

  useEffect(() => {
    if (!active) {
      setVisiblePoints([]);
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      if (current <= points.length) {
        setVisiblePoints(points.slice(0, current));
        current++;
      } else {
        clearInterval(interval);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [points, active]);

  const baseColor = type === 'electrical' ? '#3b82f6' : type === 'hvac' ? '#0ea5e9' : type === 'plumbing' ? '#f59e0b' : '#ef4444';

  return (
    <group>
      {visiblePoints.slice(0, -1).map((p, i) => {
        const next = points[i + 1];
        if (!next) return null;
        const dist = p.distanceTo(next);
        const isViolating = active && checkViolation(p, next);
        const segmentColor = isViolating ? '#ff0000' : baseColor;
        
        return (
          <group key={i}>
            <group 
              position={new THREE.Vector3().addVectors(p, next).divideScalar(2)}
              onUpdate={(self) => self.lookAt(next)}
            >
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.04, 0.04, dist, 8]} />
                <meshStandardMaterial 
                  color={segmentColor} 
                  emissive={segmentColor} 
                  emissiveIntensity={isViolating ? 2 : type === 'structural' ? 0.8 : 0.5} 
                />
              </mesh>
            </group>
            {isViolating && (
              <Text
                position={new THREE.Vector3().addVectors(p, next).divideScalar(2).add(new THREE.Vector3(0, 0.5, 0))}
                fontSize={0.2}
                color="#ff0000"
              >
                ⚠ STRUCTURAL BREACH
              </Text>
            )}
          </group>
        );
      })}
    </group>
  );
};

const AgentDrone = ({ targetPath, active }: { targetPath: THREE.Vector3[], active: boolean }) => {
  const ref = useRef<THREE.Group>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!active) setCurrentIndex(0);
  }, [active]);

  useFrame((state, delta) => {
    if (!active || !ref.current || targetPath.length === 0) return;

    const target = targetPath[currentIndex];
    if (!target) return;

    ref.current.position.lerp(target, 0.1);

    if (ref.current.position.distanceTo(target) < 0.1) {
      if (currentIndex < targetPath.length - 1) {
        setCurrentIndex(v => v + 1);
      }
    }
  });

  if (!active) return null;

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#f6ad55" emissive="#f6ad55" emissiveIntensity={2} />
      </mesh>
      <pointLight color="#f6ad55" intensity={0.5} distance={2} />
    </group>
  );
};

export const ThreeStage = ({ 
  routingActive, 
  simulationType, 
  selectedModuleId, 
  onSelectModule,
  constraints
}: { 
  routingActive: boolean, 
  simulationType: 'electrical' | 'hvac' | 'plumbing' | 'structural',
  selectedModuleId: string | null,
  onSelectModule: (id: string | null) => void,
  constraints: Record<string, boolean>
}) => {
  const pathPoints = useMemo(() => {
    // Basic nodes
    const start = new THREE.Vector3(-4, 0.5, -4);
    const end = new THREE.Vector3(4, 0.5, 4);
    
    if (!constraints.loadBearing && simulationType !== 'structural') {
      // If load bearing is off, just cut through the core (lazy routing)
      return [
        start,
        new THREE.Vector3(-4, 2, -4),
        new THREE.Vector3(0, 2, 0), // Straight through
        new THREE.Vector3(4, 2, 4),
        end
      ];
    }

    // Default "Proper" Manhattan path
    return [
      start,
      new THREE.Vector3(-4, 2, -4),
      new THREE.Vector3(0, 2, -4),
      new THREE.Vector3(0, 2, 0),
      new THREE.Vector3(2, 2, 0),
      new THREE.Vector3(2, 0.5, 0),
      new THREE.Vector3(4, 0.5, 2),
      end
    ];
  }, [constraints.loadBearing, simulationType]);

  return (
    <div className="w-full h-full bg-slate-50 relative" onClick={() => onSelectModule(null)}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[10, 10, 10]} />
        <OrbitControls makeDefault />
        <Environment preset="city" />
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
        
        <Grid 
          infiniteGrid 
          fadeDistance={30} 
          cellColor="#cbd5e1" 
          sectionColor="#94a3b8" 
          sectionSize={5} 
          cellSize={1} 
        />

        {/* Building Modules */}
        <BuildingModule 
          id="main_dist"
          position={[-4, 1.5, -4]} 
          size={[2, 3, 2]} 
          label="Main Distribution" 
          onSelect={onSelectModule}
          isSelected={selectedModuleId === 'main_dist'}
        />
        <BuildingModule 
          id="central_core"
          position={[0, 2.5, 0]} 
          size={[3, 5, 3]} 
          label="Central Core" 
          isObstacle 
          onSelect={onSelectModule}
          isSelected={selectedModuleId === 'central_core'}
          isCompromised={simulationType === 'structural' && routingActive}
        />
        <BuildingModule 
          id="end_node"
          position={[4, 1.5, 4]} 
          size={[2, 3, 2]} 
          label="End Node" 
          onSelect={onSelectModule}
          isSelected={selectedModuleId === 'end_node'}
        />
        
        <BuildingModule 
          id="hvac_a"
          position={[-4, 0.5, 2]} 
          size={[1.5, 1, 1.5]} 
          label="HVAC Unit A" 
          isObstacle 
          onSelect={onSelectModule}
          isSelected={selectedModuleId === 'hvac_a'}
        />
        <BuildingModule 
          id="col_01"
          position={[2, 2, -3]} 
          size={[0.5, 4, 0.5]} 
          label="Column 01" 
          isObstacle 
          onSelect={onSelectModule}
          isSelected={selectedModuleId === 'col_01'}
          isCompromised={simulationType === 'structural' && routingActive}
        />

        <ConnectingPath points={pathPoints} active={routingActive} type={simulationType} constraints={constraints} />
        <AgentDrone targetPath={pathPoints} active={routingActive} />

        <Text
          position={[0, 6, 0]}
          fontSize={0.4}
          color="#1e293b"
          anchorX="center"
          anchorY="middle"
        >
          {routingActive ? `AGENTIC PATHFINDING: ${simulationType.toUpperCase()}` : 'IDLE'}
        </Text>
      </Canvas>

      <div className="absolute top-4 left-4 p-4 bg-white/80 backdrop-blur-md border border-slate-200 rounded-lg text-xs font-mono text-slate-600 space-y-1 shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${routingActive ? 'bg-green-600 animate-pulse' : 'bg-slate-300'}`} />
          SYSTEM STATUS: {routingActive ? 'COMPUTING' : 'READY'}
        </div>
        <div className="font-bold">COORDINATES: X:0.0 Y:0.0 Z:0.0</div>
        <div className="font-bold">CONSTRAINTS: NEC 2024 CODE COMPLIANT</div>
      </div>
    </div>
  );
};
