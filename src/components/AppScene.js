import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import 'webxr-polyfill';

const AppScene = ({ onClose }) => {
  const containerRef = useRef(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [message, setMessage] = useState('Hold the camera steady for better experience in good lighting.');
  const [quality, setQuality] = useState('Too Dark'); // Too Dark, Fair, Good
  let camera, scene, renderer, controller, model;
  let analysisInterval;

  useEffect(() => {
    initThreeJS();
    return () => {
      if (analysisInterval) clearInterval(analysisInterval);
    };
  }, []);

  const initThreeJS = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    containerRef.current.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    window.addEventListener('resize', onWindowResize, false);
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const onSelect = () => {
    if (model) {
      const position = new THREE.Vector3();
      position.set(0, 0, -0.5).applyMatrix4(controller.matrixWorld);
      model.position.copy(position);
    }
  };

  const startARSession = async () => {
    if (navigator.xr) {
      try {
        const session = await navigator.xr.requestSession('immersive-ar', {
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['local-floor']
        });
        renderer.xr.setSession(session);
        setSessionStarted(true);
        animate();
        startSceneAnalysis();
      } catch (error) {
        console.error('Failed to start AR session', error);
      }
    }
  };

  const animate = () => {
    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
  };

  const startSceneAnalysis = () => {
    analysisInterval = setInterval(() => {
      try {
        const gl = renderer.getContext();
        const pixels = new Uint8Array(4);
        gl.readPixels(
          renderer.domElement.width / 2,
          renderer.domElement.height / 2,
          1, 1,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          pixels
        );
        const brightness = (pixels[0] + pixels[1] + pixels[2]) / 3;
        if (brightness < 40) {
          setQuality('Too Dark');
        } else if (brightness < 100) {
          setQuality('Fair');
        } else {
          setQuality('Good');
        }

        if (quality === 'Good' || quality === 'Fair') {
          captureAndDetect();
          clearInterval(analysisInterval);
        }
      } catch (err) {
        console.error('Error analyzing scene:', err);
      }
    }, 1000);
  };

  const captureAndDetect = () => {
    let imageData = renderer.domElement.toDataURL('image/jpeg').split(',')[1];

    fetch('https://ecommerce-for-holo-decor.vercel.app/detect-wall', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData })
    })
      .then(res => res.json())
      .then(data => {
        console.log('Wall detection response:', data);
        if (data.wallDetected) {
          loadModel();
          setMessage('Wall detected ✅ Sofa placed.');
        } else {
          setMessage('❌ No wall detected. Please reposition.');
          startSceneAnalysis();
        }
      })
      .catch(err => {
        console.error('Error sending to backend:', err);
        setMessage('⚠️ Error analyzing the scene.');
        startSceneAnalysis();
      });
  };

  const loadModel = () => {
    const loader = new GLTFLoader();
    loader.load(
      '/3DModels/sofa.glb',
      (gltf) => {
        model = gltf.scene;
        model.scale.set(0.3, 0.3, 0.3);
        model.position.set(0, -0.1, -0.8);
        scene.add(model);
      },
      undefined,
      (error) => console.error('Error loading model:', error)
    );
  };

  return (
    <div ref={containerRef} style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
    }}>
      {/* Message */}
      {sessionStarted && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.6)',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '15px',
          zIndex: 1000
        }}>
          {message}
        </div>
      )}

      {/* Close Button */}
      {sessionStarted && (
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'red',
          color: 'white',
          border: 'none',
          padding: '10px',
          fontSize: '16px',
          cursor: 'pointer',
          borderRadius: '50%',
          zIndex: 1000
        }}>
          ✕
        </button>
      )}

      {/* Gauge */}
      {sessionStarted && (
        <div style={{
          position: 'absolute',
          right: '15px',
          top: '50%',
          transform: 'translateY(-50%)',
          height: '150px',
          width: '30px',
          background: '#ddd',
          borderRadius: '15px',
          overflow: 'hidden',
          zIndex: 1000
        }}>
          <div style={{
            height: '50%',
            background: quality === 'Good' ? 'green' : (quality === 'Fair' ? 'orange' : 'red'),
            transition: 'background 0.5s',
          }} />
        </div>
      )}

      {/* Confirm Button */}
      {!sessionStarted && (
        <button onClick={startARSession} style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#007bff',
          color: 'white',
          padding: '15px 25px',
          fontSize: '18px',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: 1000
        }}>
          Confirm & Start Camera
        </button>
      )}
    </div>
  );
};

export default AppScene;
