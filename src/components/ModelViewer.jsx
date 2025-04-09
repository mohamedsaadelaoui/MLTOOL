import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

const ModelViewer = () => {
  const mountRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf5f5f5);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 2, 2);
    scene.add(directionalLight);

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);

    // Animation
    const animate = () => {
      if (!mountRef.current) return;
      
      requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      // Dispose all geometries and materials
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) {
            object.geometry.dispose();
          }
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, []);

  useEffect(() => {
    if (!file || !sceneRef.current) return;
    
    setLoading(true);
    setError(null);

    const loader = new STLLoader();
    const reader = new FileReader();

    reader.onload = function(e) {
      try {
        const geometry = loader.parse(e.target.result);
        const material = new THREE.MeshPhongMaterial({
          color: 0x3f51b5,
          specular: 0x111111,
          shininess: 200
        });
        const mesh = new THREE.Mesh(geometry, material);

        // Center the model
        geometry.computeBoundingBox();
        const boundingBox = geometry.boundingBox;
        const center = new THREE.Vector3();
        boundingBox.getCenter(center);
        mesh.position.sub(center);

        // Scale the model to fit view
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim;
        mesh.scale.multiplyScalar(scale);

        // Remove any existing model
        if (sceneRef.current) {
          sceneRef.current.children.forEach((child) => {
            if (child instanceof THREE.Mesh) {
              sceneRef.current.remove(child);
            }
          });
          sceneRef.current.add(mesh);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error parsing STL:", error);
        setError('Error loading STL file. Please try another file.');
        setLoading(false);
      }
    };

    reader.onerror = function() {
      setError('Error reading file');
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  }, [file]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.stl')) {
      setError('Please upload a valid STL file');
      return;
    }

    setFile(selectedFile);
  };

  return (
    <div style={{ width: '100%', padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          accept=".stl"
          onChange={handleFileChange}
          style={{
            padding: '10px',
            border: '2px dashed #ccc',
            borderRadius: '4px',
            width: '100%',
            cursor: 'pointer'
          }}
        />
        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            {error}
          </div>
        )}
        {loading && (
          <div style={{ color: '#666', marginTop: '10px' }}>
            Loading model...
          </div>
        )}
      </div>

      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '500px',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      >
        {!file && !loading && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#666',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>
              Upload a STL file to preview
            </div>
            <div style={{ fontSize: '14px', color: '#999' }}>
              Supported format: .STL
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelViewer; 