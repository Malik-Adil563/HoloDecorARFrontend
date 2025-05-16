import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import 'webxr-polyfill';

const AppScene = ({ onClose }) => {
  const containerRef = useRef(null);
  const [message, setMessage] = useState("Hold camera at the scene...");
  const rendererRef = useRef();
  const [captureIntervalId, setCaptureIntervalId] = useState(null);

  let camera, scene, controller, model;
  let renderTarget, offscreenCanvas, offscreenCtx;

  useEffect(() => {
    checkARSupport();
    return () => {
      if (captureIntervalId) clearInterval(captureIntervalId);
    };
  }, []);

  const checkARSupport = async () => {
    if (!navigator.xr || !(await navigator.xr.isSessionSupported('immersive-ar'))) {
      showWarningNotification("Your device does not support WebXR.");
      return;
    }

    init();
    animate();
    startAR();

    const intervalId = setInterval(captureSceneAndCheckWall, 10000);
    setCaptureIntervalId(intervalId);
  };

  const showWarningNotification = (msg) => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("⚠️ WebXR Warning", { body: msg });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification("⚠️ WebXR Warning", { body: msg });
          }
        });
      }
    } else {
      alert(msg);
    }
  };

  const startAR = async () => {
    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['local-floor'],
      });
      rendererRef.current.xr.setSession(session);
    } catch (error) {
      console.error("Failed to start AR session", error);
    }
  };

  const init = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('wheel', onZoom);

    // Offscreen setup
    renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
    offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = window.innerWidth;
    offscreenCanvas.height = window.innerHeight;
    offscreenCtx = offscreenCanvas.getContext('2d');
  };

  const captureSceneAndCheckWall = () => {
    setMessage("Analyzing scene...");

    const renderer = rendererRef.current;
    if (!renderer) return;

    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);

    const pixels = new Uint8Array(window.innerWidth * window.innerHeight * 4);
    renderer.readRenderTargetPixels(renderTarget, 0, 0, window.innerWidth, window.innerHeight, pixels);

    const imageData = new ImageData(
      new Uint8ClampedArray(pixels),
      window.innerWidth,
      window.innerHeight
    );
    offscreenCtx.putImageData(imageData, 0, 0);

    offscreenCanvas.toBlob((blob) => {
      if (!blob) {
        setMessage("⚠️ Could not capture scene.");
        return;
      }

      const formData = new FormData();
      formData.append("image", blob, "scene.jpg");

      fetch("https://holodecorpythonbackend.onrender.com/detect-wall", {
        method: "POST",
        body: formData,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.wallDetected) {
            clearInterval(captureIntervalId);
            loadModel();
            setMessage("Wall detected ✅ Sofa placed.");
          } else {
            setMessage("❌ No wall detected. Retrying...");
          }
        })
        .catch((err) => {
          console.error("Upload error:", err);
          setMessage("⚠️ Upload failed.");
        });
    }, "image/jpeg");
  };

  const loadModel = () => {
    const loader = new GLTFLoader();
    loader.load(
      '/3DModels/painted_sofa.glb',
      (gltf) => {
        model = gltf.scene;
        model.scale.set(1.27, 0.9144, 0.76);
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

  const animate = () => {
    rendererRef.current.setAnimationLoop(() => {
      rendererRef.current.render(scene, camera);
    });
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
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
