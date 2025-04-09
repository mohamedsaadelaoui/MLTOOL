import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls, Stage, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function Model({ url }) {
  const geometry = useLoader(STLLoader, url);
  
  // Calculer le centre et la taille du modèle
  const box = new THREE.Box3().setFromObject(new THREE.Mesh(geometry));
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  
  // Calculer la distance de la caméra
  const cameraDistance = maxDim * 2;
  
  return (
    <>
      <PerspectiveCamera 
        makeDefault 
        position={[center.x, center.y, center.z + cameraDistance]} 
        fov={50}
      />
      <mesh 
        geometry={geometry}
        position={[-center.x, -center.y, -center.z]} // Centrer le modèle
      >
        <meshStandardMaterial 
          color="#c4183c"
          roughness={0.5}
          metalness={0.5}
        />
      </mesh>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </>
  );
}

const LoadingSpinner = () => (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#666'
  }}>
    Chargement du modèle...
  </div>
);

const ErrorDisplay = () => (
  <div style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#c4183c'
  }}>
    Erreur lors du chargement du modèle
  </div>
);

const STLViewer = ({ url }) => {
  return (
    <div style={{ 
      width: '100%', 
      height: '400px', 
      background: '#f5f5f5', 
      borderRadius: '8px',
      position: 'relative'
    }}>
      <Canvas>
        <Suspense fallback={<LoadingSpinner />}>
          <Stage environment="city" intensity={0.6}>
            <Model url={url} />
          </Stage>
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={1}
            maxDistance={1000}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default STLViewer; 