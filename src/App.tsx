import * as THREE from 'three';
import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { TextureLoader, AnimationMixer, BackSide } from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

// Astronaut component with color and lighting adjustments
const Astronaut: React.FC = () => {
  const { scene, animations } = useGLTF('/astronaut.glb'); // Load the GLB model
  const astronautRef = useRef<THREE.Object3D>(null);

  // Load textures
  const textureColor = useLoader(TextureLoader, '/textures/gltf_embedded_0.png'); // Color texture
  const textureRoughness = useLoader(TextureLoader, '/textures/gltf_embedded_3@channels=R.png'); // Roughness texture
  const textureMetalness = useLoader(TextureLoader, '/textures/gltf_embedded_1@channels=A.png'); // Metalness texture
  const textureNormal = useLoader(TextureLoader, '/textures/gltf_embedded_4.png'); // Normal texture
  const textureAO = useLoader(TextureLoader, '/textures/gltf_embedded_5.png'); // Ambient occlusion texture

  const mixer = useRef<AnimationMixer | null>(null);

  // Apply the textures and adjust material properties for whiteness
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;

          // Apply the textures to the astronaut's material
          const material = mesh.material as THREE.MeshStandardMaterial;
          material.map = textureColor; // Set color texture
          material.roughnessMap = textureRoughness; // Set roughness texture
          material.metalnessMap = textureMetalness; // Set metalness texture
          material.normalMap = textureNormal; // Set normal map for surface details
          material.aoMap = textureAO; // Set ambient occlusion texture

          // Make the skin whiter by adjusting the color intensity
          //material.color = new THREE.Color(0xffffff); // Apply a strong white tint
        
          // Set transparency off and update material
          material.transparent = false;
          material.needsUpdate = true;
        }
      });

      // Scale down the astronaut model
      scene.scale.set(0.3, 0.3, 0.3); // Adjust the scale to make it smaller
    }
  }, [scene, textureColor, textureRoughness, textureMetalness, textureNormal, textureAO]);

  // Set up animation for the astronaut
  useFrame((state, delta) => {
    if (!mixer.current && animations.length) {
      mixer.current = new AnimationMixer(scene);
      const action = mixer.current.clipAction(animations[0]);
      action.play();
    }
    if (mixer.current) mixer.current.update(delta);
  });

  return <primitive ref={astronautRef} object={scene} position={[0, 0, 0]} />; // Centered at (0, 0, 0)
};

const SpaceBackground: React.FC = () => {
  const spaceTexture = useLoader(TextureLoader, '/space-2638158.jpg'); // Load background image

  return (
    <mesh>
      <sphereGeometry args={[100, 32, 32]} />
      <meshBasicMaterial map={spaceTexture} side={BackSide} />
    </mesh>
  );
};

const App: React.FC = () => {
  return (
    <Canvas
      style={{ height: '100vh', width: '100vw' }} // Fullscreen canvas
      camera={{ position: [0, 0, 3], fov: 50 }} // Adjust camera to view model from front
    >
      {/* Space Background */}
      <SpaceBackground />
      
      {/* Enhanced Lighting */}
      <ambientLight intensity={1.5} /> {/* Stronger ambient light for brightness */}
      <directionalLight position={[10, 10, 10]} intensity={2.0} /> {/* Strong directional light for shadows */}
      <spotLight
        position={[2, 5, 5]}
        angle={0.5}
        penumbra={1}
        intensity={3} // High-intensity spotlight for brightness
        castShadow
        color={new THREE.Color(0xffffff)}
      />
      
      {/* Astronaut model with textures and adjustments */}
      <Astronaut />
      
      {/* Orbit controls to interact with the scene */}
      <OrbitControls enableZoom={true} enablePan={true} />
      
      {/* Post-processing bloom effect */}
      <EffectComposer>
        <Bloom intensity={0.7} /> 
      </EffectComposer>
    </Canvas>
  );
};

export default App;
