import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

const FilterFrame = ({ position, rotation, color, text }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1 + rotation;
    }
  });

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <mesh ref={meshRef} position={position}>
        {/* Frame */}
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.2} />
        
        {/* Screen content */}
        <mesh position={[0, 0, 0.06]}>
          <planeGeometry args={[1.8, 2.8]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Text label */}
        <Text
          position={[0, -1.7, 0.1]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {text}
        </Text>
      </mesh>
    </Float>
  );
};

const ThreeDScene: React.FC = () => {
  return (
    <Canvas
      style={{ height: '500px', width: '100%' }}
      camera={{ position: [0, 0, 8], fov: 50 }}
    >
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      {/* Filter Frames */}
      <FilterFrame 
        position={[-3, 0, 0]} 
        rotation={-0.2} 
        color="#f97316" 
        text="Environmental"
      />
      <FilterFrame 
        position={[0, 0.5, 0]} 
        rotation={0} 
        color="#84cc16" 
        text="Social Impact"
      />
      <FilterFrame 
        position={[3, -0.2, 0]} 
        rotation={0.2} 
        color="#f97316" 
        text="Education"
      />

      {/* Background particles */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 5 - 5
          ]}
        >
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color={Math.random() > 0.5 ? "#f97316" : "#84cc16"}
            emissive={Math.random() > 0.5 ? "#f97316" : "#84cc16"}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 2.5}
      />
    </Canvas>
  );
};

export default ThreeDScene;
