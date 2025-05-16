import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import 'webxr-polyfill';

const AppScene = ({ onClose }) => {
  const containerRef = useRef(null);
  const [message, setMessage] = useState("Hold camera at the scene...");
  const [firstFrameRendered, setFirstFrameRendered] = useState(false);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const controllerRef = useRef(null);
  const modelRef = useRef(null);
  const captureIntervalRef = useRef(null);

  useEffect(() => {
    checkARSupport();
    return () => {
      if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
    };
  }, []);

  const checkARSupport = async () => {
    if (!navigator.xr || !(await navigator.xr.isSessionSupported('immersive-ar'))) {
      showWarningNotification("Your device does not support WebXR.");
      return;
    }

    initScene();
    startAR();
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

  const initScene = () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1));

    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    containerRef.current.appendChild(renderer.domElement);

    cameraRef.current = camera;
    sceneRef.current = scene;
    rendererRef.current = renderer;
    controllerRef.current = controller;

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('wheel', onZoom);

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
      if (!firstFrameRendered) {
        setFirstFrameRendered(true);
        console.log("First WebXR frame rendered.");
      }
    });
  };

  const startAR = async () => {
    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['local-floor']
      });
      rendererRef.current.xr.setSession(session);

      // Start capture after a short delay to ensure rendering is active
      setTimeout(() => {
        if (!captureIntervalRef.current) {
          captureIntervalRef.current = setInterval(captureSceneAndCheckWall, 10000);
        }
      }, 3000);
    } catch (error) {
      console.error("Failed to start AR session", error);
      setMessage("⚠️ Failed to start AR session.");
    }
  };

  const captureSceneAndCheckWall = () => {
    if (!firstFrameRendered || !rendererRef.current || !rendererRef.current.domElement) {
      console.warn("Skipping capture: WebXR frame not ready.");
      return;
    }

    setMessage("Analyzing scene...");

    rendererRef.current.domElement.toBlob((blob) => {
      if (!blob) {
        console.error("Failed to capture image");
        setMessage("⚠️ Error capturing the scene.");
        return;
      }

      const formData = new FormData();
      formData.append('image', blob, 'scene.jpg');

      fetch('https://holodecorpythonbackend.onrender.com/detect-wall', {
        method: 'POST',
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          console.log('Server response:', data);
          if (data.wallDetected) {
            clearInterval(captureIntervalRef.current);
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
    }, 'image/jpeg');
  };

  const loadModel = () => {
    const loader = new GLTFLoader();
    loader.load(
      '/3DModels/painted_sofa.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(1.27, 0.9144, 0.76);
        model.position.set(0, -0.1, -0.8);
        sceneRef.current.add(model);
        modelRef.current = model;
      },
      undefined,
      (error) => console.error('Error loading model:', error)
    );
  };

  const onSelect = () => {
    const model = modelRef.current;
    const controller = controllerRef.current;
    if (model && controller) {
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
    const model = modelRef.current;
    if (model) {
      const zoomFactor = 1 - event.deltaY * 0.001;
      const newScale = model.scale.clone().multiplyScalar(zoomFactor);
      if (newScale.x > 0.01 && newScale.x < 2) {
        model.scale.copy(newScale);
      }
    }
  };

  const onWindowResize = () => {
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    if (camera && renderer) {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
  };

  return (
    <div ref={containerRef} style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.6)',
        color: '#fff',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '16px',
        zIndex: 1000
      }}>
        {message}
      </div>

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
        zIndex: 1000,
        borderRadius: '50%',
      }}>
        ✕
      </button>
    </div>
  );
};

export default AppScene;
