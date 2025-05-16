import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import 'webxr-polyfill';

const AppScene = ({ onClose }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const rendererRef = useRef(null);
  const firstFrameRenderedRef = useRef(false);
  const [message, setMessage] = useState("Initializing AR...");
  let camera, scene, controller, model;
  let captureInterval;

  useEffect(() => {
    checkARSupport();
    return () => {
      if (captureInterval) clearInterval(captureInterval);
      if (rendererRef.current && rendererRef.current.xr.getSession()) {
        rendererRef.current.xr.getSession().end();
      }
    };
  }, []);

  const checkARSupport = async () => {
    if (!navigator.xr || !(await navigator.xr.isSessionSupported('immersive-ar'))) {
      showWarningNotification("Your device does not support WebXR.");
      return;
    }
    init();
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

  const init = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    // Force opaque for first few frames to avoid black captures
    renderer.setClearColor(0x000000, 1);

    rendererRef.current = renderer;
    canvasRef.current = renderer.domElement;
    containerRef.current.appendChild(canvasRef.current);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    // Add a dummy object to ensure canvas has color info
    const tempCube = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.1, 0.1),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    tempCube.position.set(0, 0, -1);
    scene.add(tempCube);

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('wheel', onZoom);
  };

  const startAR = async () => {
    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['local-floor']
      });

      rendererRef.current.xr.setSession(session);

      // Animate with frame counter
      let frameCount = 0;
      rendererRef.current.setAnimationLoop(() => {
        rendererRef.current.render(scene, camera);

        if (!firstFrameRenderedRef.current) {
          frameCount++;
          if (frameCount > 30) { // ~0.5 sec
            firstFrameRenderedRef.current = true;
            rendererRef.current.setClearColor(0x000000, 0); // restore transparency
            setMessage("Hold camera at the scene...");
            startCaptureInterval();
          }
        }
      });
    } catch (error) {
      console.error("Failed to start AR session", error);
    }
  };

  const startCaptureInterval = () => {
    captureInterval = setInterval(captureSceneAndCheckWall, 10000);
  };

  const captureSceneAndCheckWall = () => {
    if (!canvasRef.current) return;

    setMessage("Analyzing scene...");
    canvasRef.current.toBlob((blob) => {
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
    }, 'image/jpeg');
  };

  const loadModel = () => {
    const loader = new GLTFLoader();
    loader.load(
      '/3DModels/painted_sofa.glb',
      (gltf) => {
        model = gltf.scene;
        model.scale.set(1.27, 0.9144, 0.76); // Width, Height, Depth in meters
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
      if (newScale.x > 0.01 && newScale.x < 2) {
        model.scale.copy(newScale);
      }
    }
  };

  const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
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
