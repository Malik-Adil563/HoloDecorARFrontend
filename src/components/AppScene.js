import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import 'webxr-polyfill';

const AppScene = ({ onClose }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const hiddenCanvasRef = useRef(null);
  const [message, setMessage] = useState("Hold camera at the scene...");
  let camera, scene, renderer, controller, model;
  let captureInterval;

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error("Failed to access camera", err);
      });

    checkARSupport();

    return () => {
      if (captureInterval) clearInterval(captureInterval);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
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

    captureInterval = setInterval(captureSceneAndCheckWall, 10000);
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

    canvasRef.current = renderer.domElement;
    containerRef.current.appendChild(canvasRef.current);

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
    setMessage("Analyzing scene...");

    const video = videoRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;

    if (video && hiddenCanvas) {
      hiddenCanvas.width = video.videoWidth;
      hiddenCanvas.height = video.videoHeight;

      const ctx = hiddenCanvas.getContext("2d");
      ctx.drawImage(video, 0, 0, hiddenCanvas.width, hiddenCanvas.height);

      hiddenCanvas.toBlob((blob) => {
        if (!blob) {
          console.error("Failed to capture frame from video");
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
    }
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
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  const animate = () => {
    renderer.setAnimationLoop(() => renderer.render(scene, camera));
  };

  return (
    <div ref={containerRef} style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
    }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ display: "none" }}
      ></video>
      <canvas ref={hiddenCanvasRef} style={{ display: "none" }} />

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
