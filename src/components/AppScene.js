import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import 'webxr-polyfill';

const AppScene = ({ onClose }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [showIntro, setShowIntro] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [qualityStatus, setQualityStatus] = useState('Analyzing...');
  const [message, setMessage] = useState('');
  const [gaugeRotation, setGaugeRotation] = useState(0);

  let camera, scene, renderer, controller, model;
  let captureInterval;

  useEffect(() => {
    if (cameraActive) {
      checkARSupport();
    }
    return () => {
      if (captureInterval) clearInterval(captureInterval);
    };
  }, [cameraActive]);

  const checkARSupport = async () => {
    if (!navigator.xr || !(await navigator.xr.isSessionSupported('immersive-ar'))) {
      showWarningNotification("Your device does not support WebXR.");
      return;
    }
    init();
    animate();
    startAR();
    captureInterval = setInterval(captureSceneAndCheckWall, 4000);
  };

  const showWarningNotification = (message) => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("⚠️ WebXR Warning", { body: message });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("⚠️ WebXR Warning", { body: message });
          }
        });
      }
    } else {
      alert(message);
    }
  };

  const startAR = async () => {
    if (navigator.xr) {
      try {
        const session = await navigator.xr.requestSession('immersive-ar', {
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['local-floor']
        });
        renderer.xr.setSession(session);
      } catch (error) {
        console.error("Failed to start AR session", error);
      }
    }
  };

  const init = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    canvasRef.current.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('wheel', onZoom);
  };

  const captureSceneAndCheckWall = () => {
    if (!checkSceneQuality()) {
      setMessage("Adjust your device (good lighting and distance)");
      return;
    }

    setMessage("Analyzing scene...");

    const canvasElement = canvasRef.current.querySelector('canvas');
    let imageData = canvasElement.toDataURL('image/jpeg').split(',')[1];

    fetch('https://ecommerce-for-holo-decor.vercel.app/detect-wall', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageData })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Server response:', data);

        if (data.wallDetected) {
          clearInterval(captureInterval);
          loadModel();
          setMessage("Wall detected ✅ Sofa placed.");
        } else {
          setMessage("❌ No wall detected. Retrying...");
        }
      })
      .catch((err) => {
        console.error(err);
        setMessage("⚠️ Error analyzing the scene.");
      });
  };

  const checkSceneQuality = () => {
    const canvasElement = canvasRef.current.querySelector('canvas');
    const context = canvasElement.getContext('2d');
    if (!context) return false;

    const imgData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
    const pixels = imgData.data;

    let brightnessSum = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      brightnessSum += (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
    }
    const brightness = brightnessSum / (pixels.length / 4);

    if (brightness < 50) {
      setQualityStatus("Too Dark");
      setGaugeRotation(-45);
      return false;
    } else if (brightness >= 50 && brightness <= 170) {
      setQualityStatus("Good");
      setGaugeRotation(0);
      return true;
    } else {
      setQualityStatus("Too Bright");
      setGaugeRotation(45);
      return false;
    }
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

  const onSelect = () => {
    if (model) {
      const position = new THREE.Vector3();
      position.set(0, 0, -0.5).applyMatrix4(controller.matrixWorld);
      model.position.copy(position);

      const originalScale = model.scale.clone();
      const originalRotation = model.rotation.clone();

      model.quaternion.setFromRotationMatrix(controller.matrixWorld);
      model.rotation.copy(originalRotation);
      model.scale.copy(originalScale);
    }
  };

  const onZoom = (event) => {
    if (model) {
      const zoomFactor = 1 - event.deltaY * 0.001;
      const newScale = model.scale.clone().multiplyScalar(zoomFactor);
      if (newScale.x > 0.01 && newScale.x < 1) {
        model.scale.copy(newScale);
      }
    }
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const animate = () => {
    renderer.setAnimationLoop(() => renderer.render(scene, camera));
  };

  if (showIntro) {
    return (
      <div style={{
        width: '100vw', height: '100vh',
        background: 'black', color: 'white',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        textAlign: 'center', padding: '20px'
      }}>
        <h2>Hold your device properly</h2>
        <p>Make sure you have good lighting and steady hands.</p>
        <button onClick={() => {
          setShowIntro(false);
          setCameraActive(true);
        }} style={{
          marginTop: '20px',
          padding: '10px 20px',
          background: '#00cc66',
          border: 'none',
          color: 'white',
          fontSize: '18px',
          borderRadius: '8px',
          cursor: 'pointer'
        }}>
          Confirm & Start Camera
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div ref={canvasRef} style={{ width: '100%', height: '100%' }}></div>

      {/* UI overlay */}
      {cameraActive && (
        <>
          {/* Close Button */}
          <button onClick={onClose} style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'red',
            color: 'white',
            border: 'none',
            padding: '10px',
            fontSize: '18px',
            cursor: 'pointer',
            borderRadius: '50%',
            zIndex: 1000,
          }}>
            ✕
          </button>

          {/* Message */}
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            fontSize: '16px',
            zIndex: 1000
          }}>
            {message}
          </div>

          {/* Gauge */}
          <div style={{
            position: 'absolute',
            top: '30%',
            right: '20px',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              width: '5px',
              height: '40px',
              backgroundColor: 'lime',
              transform: `rotate(${gaugeRotation}deg)`,
              transformOrigin: 'bottom center',
              transition: 'transform 0.3s ease'
            }} />
          </div>

          {/* Quality text */}
          <div style={{
            position: 'absolute',
            top: '55%',
            right: '20px',
            background: 'rgba(0,0,0,0.6)',
            color: 'white',
            padding: '8px 10px',
            borderRadius: '8px',
            fontSize: '14px',
            zIndex: 1000
          }}>
            {qualityStatus}
          </div>
        </>
      )}
    </div>
  );
};

export default AppScene;
