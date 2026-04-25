'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import type { GraphNode, GraphEdge } from '@/lib/hooks/useKnowledgeGraph';
import * as THREE from 'three';

// Simple force-directed layout
function computeLayout(nodes: GraphNode[], edges: GraphEdge[]): Map<string, [number, number, number]> {
  const positions = new Map<string, [number, number, number]>();
  const n = nodes.length;
  
  // Initial placement: spiral
  nodes.forEach((node, i) => {
    const angle = (i / n) * Math.PI * 6;
    const radius = 3 + (i / n) * 8;
    const y = (Math.random() - 0.5) * 6;
    positions.set(node.id, [Math.cos(angle) * radius, y, Math.sin(angle) * radius]);
  });

  // Simple force simulation (few iterations)
  for (let iter = 0; iter < 50; iter++) {
    // Repulsion between all nodes
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const posA = positions.get(nodes[i].id)!;
        const posB = positions.get(nodes[j].id)!;
        const dx = posA[0] - posB[0], dy = posA[1] - posB[1], dz = posA[2] - posB[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
        const force = 2 / (dist * dist);
        const fx = (dx / dist) * force, fy = (dy / dist) * force, fz = (dz / dist) * force;
        posA[0] += fx; posA[1] += fy; posA[2] += fz;
        posB[0] -= fx; posB[1] -= fy; posB[2] -= fz;
      }
    }

    // Attraction along edges
    edges.forEach(edge => {
      const posA = positions.get(edge.source);
      const posB = positions.get(edge.target);
      if (!posA || !posB) return;
      const dx = posB[0] - posA[0], dy = posB[1] - posA[1], dz = posB[2] - posA[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.1;
      const force = (dist - 3) * 0.05 * edge.strength;
      const fx = (dx / dist) * force, fy = (dy / dist) * force, fz = (dz / dist) * force;
      posA[0] += fx; posA[1] += fy; posA[2] += fz;
      posB[0] -= fx; posB[1] -= fy; posB[2] -= fz;
    });
  }

  return positions;
}

function NodeSphere({ node, position, isSelected, onSelect }: {
  node: GraphNode;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const scale = (node.size / 5) * (hovered ? 1.3 : 1) * (isSelected ? 1.4 : 1);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect(node.id)}
        scale={scale}
      >
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial
          color={node.color}
          emissive={node.color}
          emissiveIntensity={hovered || isSelected ? 0.5 : 0.15}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      {/* Glow */}
      {(hovered || isSelected) && (
        <mesh scale={scale * 1.6}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial color={node.color} transparent opacity={0.1} />
        </mesh>
      )}
      {/* Label */}
      <Text
        position={[0, 0.8 * scale, 0]}
        fontSize={0.3}
        color={hovered || isSelected ? '#fff' : '#ccc'}
        anchorX="center"
        anchorY="middle"
        maxWidth={3}
      >
        {node.label.length > 20 ? node.label.slice(0, 20) + '...' : node.label}
      </Text>
    </group>
  );
}

function GraphEdgeLine({ from, to, color }: {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
}) {
  return (
    <Line
      points={[from, to]}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  );
}

function FloatingParticles() {
  const count = 50;
  const ref = useRef<THREE.Points>(null);
  
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial size={0.05} color="#E8651A" transparent opacity={0.4} />
    </points>
  );
}

function Scene({ nodes, edges, selectedId, onSelect }: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const layout = useMemo(() => computeLayout(nodes, edges), [nodes, edges]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4285F4" />
      
      <FloatingParticles />

      {edges.map((edge, i) => {
        const from = layout.get(edge.source);
        const to = layout.get(edge.target);
        if (!from || !to) return null;
        const highlighted = selectedId === edge.source || selectedId === edge.target;
        return (
          <GraphEdgeLine
            key={i}
            from={from}
            to={to}
            color={highlighted ? '#E8651A' : '#666'}
          />
        );
      })}

      {nodes.map(node => {
        const pos = layout.get(node.id);
        if (!pos) return null;
        return (
          <NodeSphere
            key={node.id}
            node={node}
            position={pos}
            isSelected={selectedId === node.id}
            onSelect={onSelect}
          />
        );
      })}

      <OrbitControls enableDamping dampingFactor={0.05} minDistance={3} maxDistance={30} />
    </>
  );
}

export default function KnowledgeGraph3D({ nodes, edges, selectedId, onSelect }: {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (nodes.length === 0) return null;
  
  return (
    <Canvas
      camera={{ position: [0, 5, 15], fov: 60 }}
      style={{ background: 'transparent' }}
      dpr={[1, 2]}
    >
      <Scene nodes={nodes} edges={edges} selectedId={selectedId} onSelect={onSelect} />
    </Canvas>
  );
}
