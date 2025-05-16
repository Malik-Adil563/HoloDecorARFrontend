import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import 'webxr-polyfill';

const AppScene = ({ onClose }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [message, setMessage] = useState("Hold camera at the scene...");
  const [arReady, setARReady] = useState(false);

  let camera, scene, renderer, controller, model;

  useEffect(() => {
    startSimpleCameraAndDetect();
    return () => {
      stopCameraStream();
    };
  }, []);

  const stopCameraStream = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const startSimpleCameraAndDetect = async () => {
    setMessage("Analyzing environment before AR...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      setTimeout(captureFrameAndDetectWall, 3000); // wait 3 seconds before capture
    } catch (err) {
      console.error("Camera access failed", err);
      setMessage("⚠️ Camera access failed.");
    }
  };

  const captureFrameAndDetectWall = () => {
    const video = videoRef.current;
    if (!video) return;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const ctx = tempCanvas.getContext('2d');
    ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    tempCanvas.toBlob((blob) => {
      if (!blob) {
        setMessage("⚠️ Error capturing image.");
        return;
      }

      const formData = new FormData();
      formData.append('image', blob, 'scene.jpg');

      fetch('https://holodecorpythonbackend.onrender.com/detect-wall', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          if (data.wallDetected) {
            setMessage("✅ Wall detected. Starting AR...");
            stopCameraStream();
            setARReady(true);
            setTimeout(startARScene, 2000);
          } else {
            setMessage("❌ No wall detected. Try again.");
            setTimeout(captureFrameAndDetectWall, 3000);
          }
        })
        .catch(err => {
          console.error(err);
          setMessage("⚠️ Detection failed.");
        });
    }, 'image/jpeg');
  };

  const startARScene = async () => {
    if (!navigator.xr || !(await navigator.xr.isSessionSupported('immersive-ar'))) {
      setMessage("Your device does not support WebXR.");
      return;
    }

    init();
    animate();

    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['local-floor']
      });

      renderer.xr.setSession(session);
      loadModel();
    } catch (error) {
      console.error("AR session failed", error);
      setMessage("⚠️ Could not start AR session.");
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

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('wheel', onZoom);
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
        setMessage("✅ Sofa placed in AR.");
      },
      undefined,
      (error) => console.error("Model load error:", error)
    );
  };

  const onSelect = () => {
    if (model) {
      const position = new THREE.Vector3().set(0, 0, -0.5).applyMatrix4(controller.matrixWorld);
      model.position.copy(position);
    }
  };

  const onZoom = (event) => {
    if (model) {
      const zoomFactor = 1 - event.deltaY * 0.001;
      const newScale = model.scale.clone().multiplyScalar(zoomFactor);
      if (newScale.x > 0.01 && newScale.x < 2) model.scale.copy(newScale);
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
    <div ref={containerRef} style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {!arReady && (
        <video ref={videoRef} playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      )}

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
