import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import * as THREE from 'three';

function Model({ url }) {
  const [error, setError] = useState(null);
  const geometry = useLoader(STLLoader, url, 
    undefined, 
    (error) => {
      console.error("Error loading STL:", error);
      setError(error);
    }
  );
  
  if (error) {
    return null;
  }
  
  // Calculate the center and size of the model
  const box = new THREE.Box3().setFromObject(new THREE.Mesh(geometry));
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  
  return (
    <>
      <mesh 
        geometry={geometry}
        position={[-center.x, -center.y, -center.z]} // Center the model
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
  const [hasError, setHasError] = useState(false);
  
  // Error boundary
  useEffect(() => {
    const handleError = (event) => {
      console.error("Error caught in STLViewer:", event);
      setHasError(true);
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return <ErrorDisplay />;
  }
  
  return (
    <div style={{ 
      width: '100%', 
      height: '400px', 
      background: '#f5f5f5', 
      borderRadius: '8px',
      position: 'relative'
    }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        shadows
      >
        <Suspense fallback={null}>
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
      {/* Loading indicator outside Canvas */}
      <LoadingSpinner />
    </div>
  );
};

export default STLViewer; 