import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Component rendering a single physical bubble mesh
const BubbleMesh = ({ radius, color, positionRef }) => {
  const meshRef = useRef();

  useFrame(() => {
    if (meshRef.current && positionRef.current) {
      meshRef.current.position.set(
        positionRef.current.x,
        positionRef.current.y,
        positionRef.current.z
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshPhysicalMaterial
        color={color}
        roughness={0.05}
        metalness={0.1}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        transmission={0.85} // glass refraction
        thickness={1.5}
        ior={1.4}
        specularIntensity={1.0}
        transparent={true}
        opacity={0.9}
      />
    </mesh>
  );
};

// Main physics particle & bubble simulation loop
const PhysicsSimulation = () => {
  const pointsRef = useRef();
  const { mouse, viewport } = useThree();

  // Grid dimensions for background wave particles
  const countX = 60;
  const countY = 60;
  const numParticles = countX * countY;

  // Background wave particle coordinates
  const positions = useMemo(() => {
    const pos = new Float32Array(numParticles * 3);
    let index = 0;
    const separation = 0.35;
    for (let x = 0; x < countX; x++) {
      for (let y = 0; y < countY; y++) {
        pos[index * 3] = (x - countX / 2) * separation;
        pos[index * 3 + 1] = 0;
        pos[index * 3 + 2] = (y - countY / 2) * separation;
        index++;
      }
    }
    return pos;
  }, []);

  // Initialize 18 physical floating bubbles
  const bubbleCount = 18;
  const bubbleData = useMemo(() => {
    const data = [];
    const colors = ['#ffffff', '#aa3bff', '#10b981', '#ef4444', '#3b82f6', '#f59e0b'];
    
    for (let i = 0; i < bubbleCount; i++) {
      const radius = 0.35 + Math.random() * 0.55;
      data.push({
        radius,
        color: colors[i % colors.length],
        // Random starting positions within boundaries
        pos: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 6,
          z: (Math.random() - 0.5) * 3
        },
        // Random starting velocities
        vel: {
          x: (Math.random() - 0.5) * 0.03,
          y: (Math.random() - 0.5) * 0.03,
          z: (Math.random() - 0.5) * 0.015
        },
        ref: React.createRef() // position reference object
      });
      data[i].ref.current = data[i].pos;
    }
    return data;
  }, []);

  useFrame((state) => {
    const { clock } = state;
    const time = clock.getElapsedTime();
    const posAttribute = pointsRef.current?.geometry.attributes.position;

    // 1. UPDATE BACKGROUND PARTICLES WAVE
    if (posAttribute) {
      const scrollY = window.scrollY || 0;
      const scrollOffset = scrollY * 0.003;
      let index = 0;
      for (let x = 0; x < countX; x++) {
        for (let y = 0; y < countY; y++) {
          const px = posAttribute.getX(index);
          const pz = posAttribute.getZ(index);

          // Generate complex wave
          let py = Math.sin(px * 0.4 + time * 0.8) * 0.35 + 
                   Math.cos(pz * 0.4 + time * 0.8) * 0.35;

          // Mouse attraction/repulsion on wave particles
          const mx = mouse.x * (viewport.width / 2);
          const mz = mouse.y * (viewport.height / 2);
          const dx = px - mx;
          const dz = pz - mz;
          const dist = Math.sqrt(dx * dx + dz * dz);
          
          if (dist < 4.0) {
            py += (4.0 - dist) * 0.25;
          }

          posAttribute.setY(index, py - scrollOffset);
          index++;
        }
      }
      posAttribute.needsUpdate = true;
    }

    // 2. RUN PHYSICS SIMULATION FOR BUBBLES
    const boxWidth = viewport.width / 2 + 1;
    const boxHeight = viewport.height / 2 + 1;
    const boxDepth = 3;

    // Mouse coordinates in 3D world space
    const mouseX = mouse.x * (viewport.width / 2);
    const mouseY = mouse.y * (viewport.height / 2);

    for (let i = 0; i < bubbleCount; i++) {
      const b = bubbleData[i];
      const p = b.pos;
      const v = b.vel;

      // Add velocity
      p.x += v.x;
      p.y += v.y;
      p.z += v.z;

      // Mouse repulsion force
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const distToMouse = Math.sqrt(dx * dx + dy * dy);
      const repulsionRadius = 3.0;

      if (distToMouse < repulsionRadius) {
        const force = (repulsionRadius - distToMouse) * 0.004;
        v.x += (dx / distToMouse) * force;
        v.y += (dy / distToMouse) * force;
      }

      // Slowly damp velocities to keep them controlled
      v.x *= 0.985;
      v.y *= 0.985;
      v.z *= 0.985;

      // Add small organic random drift
      v.x += (Math.random() - 0.5) * 0.001;
      v.y += (Math.random() - 0.5) * 0.001;
      v.z += (Math.random() - 0.5) * 0.0005;

      // Bounce boundaries
      if (p.x - b.radius < -boxWidth) { p.x = -boxWidth + b.radius; v.x *= -0.9; }
      if (p.x + b.radius > boxWidth) { p.x = boxWidth - b.radius; v.x *= -0.9; }
      if (p.y - b.radius < -boxHeight) { p.y = -boxHeight + b.radius; v.y *= -0.9; }
      if (p.y + b.radius > boxHeight) { p.y = boxHeight - b.radius; v.y *= -0.9; }
      if (p.z - b.radius < -boxDepth) { p.z = -boxDepth + b.radius; v.z *= -0.9; }
      if (p.z + b.radius > boxDepth) { p.z = boxDepth - b.radius; v.z *= -0.9; }

      // Update ref position for rendering
      if (b.ref.current) {
        b.ref.current.x = p.x;
        b.ref.current.y = p.y;
        b.ref.current.z = p.z;
      }
    }

    // Resolving sphere-to-sphere collisions
    for (let i = 0; i < bubbleCount; i++) {
      for (let j = i + 1; j < bubbleCount; j++) {
        const b1 = bubbleData[i];
        const b2 = bubbleData[j];

        const dx = b2.pos.x - b1.pos.x;
        const dy = b2.pos.y - b1.pos.y;
        const dz = b2.pos.z - b1.pos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const minDist = b1.radius + b2.radius;

        if (dist < minDist && dist > 0) {
          // Push them apart to prevent overlap sticking
          const overlap = minDist - dist;
          const pushX = (dx / dist) * overlap * 0.5;
          const pushY = (dy / dist) * overlap * 0.5;
          const pushZ = (dz / dist) * overlap * 0.5;

          b1.pos.x -= pushX;
          b1.pos.y -= pushY;
          b1.pos.z -= pushZ;
          b2.pos.x += pushX;
          b2.pos.y += pushY;
          b2.pos.z += pushZ;

          // Simple elastic velocity swap along collision vector
          const nx = dx / dist;
          const ny = dy / dist;
          const nz = dz / dist;

          // Relative velocity
          const kx = b1.vel.x - b2.vel.x;
          const ky = b1.vel.y - b2.vel.y;
          const kz = b1.vel.z - b2.vel.z;
          const pFactor = 2 * (b1.vel.x * nx + b1.vel.y * ny + b1.vel.z * nz - (b2.vel.x * nx + b2.vel.y * ny + b2.vel.z * nz)) / (b1.radius + b2.radius);

          b1.vel.x -= pFactor * b2.radius * nx * 0.95;
          b1.vel.y -= pFactor * b2.radius * ny * 0.95;
          b1.vel.z -= pFactor * b2.radius * nz * 0.95;
          b2.vel.x += pFactor * b1.radius * nx * 0.95;
          b2.vel.y += pFactor * b1.radius * ny * 0.95;
          b2.vel.z += pFactor * b1.radius * nz * 0.95;
        }
      }
    }
  });

  return (
    <>
      {/* Background Particles Grid */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#ffffff"
          size={0.03}
          sizeAttenuation={true}
          transparent={true}
          opacity={0.4}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Floating Interactive Physics Bubbles */}
      {bubbleData.map((bubble, idx) => (
        <BubbleMesh
          key={idx}
          radius={bubble.radius}
          color={bubble.color}
          positionRef={bubble.ref}
        />
      ))}
    </>
  );
};

const ParticleBackground = () => {
  return (
    <div id="canvas-container">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={['#0a0a0b']} />
        <ambientLight intensity={0.6} />
        {/* Soft directional highlights for glass reflection */}
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[-5, -5, 2]} intensity={0.8} color="#aa3bff" />
        <directionalLight position={[0, 5, -5]} intensity={0.5} color="#3b82f6" />
        <PhysicsSimulation />
      </Canvas>
    </div>
  );
};

export default ParticleBackground;
