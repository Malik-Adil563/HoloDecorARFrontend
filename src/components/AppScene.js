import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const AppScene = ({ onClose }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState("Hold camera at the scene...");
  let scene, camera, renderer, model;
  let captureInterval;

  useEffect(() => {
    startCamera();
    initThreeJS();
    animate();
    captureInterval = setInterval(captureAndSendImage, 10000);

    return () => {
      if (captureInterval) clearInterval(captureInterval);
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    } catch (err) {
      console.error("Camera access failed", err);
      setMessage("❌ Camera not accessible");
    }
  };

  const initThreeJS = () => {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
    camera.position.z = 2;

    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    canvasRef.current.appendChild(renderer.domElement);

    const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
    scene.add(light);
  };

  const captureAndSendImage = () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) return;

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 640;
    tempCanvas.height = 480;
    const ctx = tempCanvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, 640, 480);

    tempCanvas.toBlob(blob => {
      if (!blob) return;

      const formData = new FormData();
      formData.append("image", blob, "scene.jpg");

      fetch("https://holodecorpythonbackend.onrender.com/detect-wall", {
        method: "POST",
        body: formData,
      })
        .then(res => res.json())
        .then(data => {
          console.log("Detection result:", data);
          if (data.wallDetected) {
            clearInterval(captureInterval);
            loadModel();
            setMessage("✅ Wall detected. Sofa placed.");
          } else {
            setMessage("❌ No wall detected. Retrying...");
          }
        })
        .catch(err => {
          console.error("Detection failed", err);
          setMessage("⚠️ Detection error");
        });
    }, "image/jpeg");
  };

  const loadModel = () => {
    const loader = new GLTFLoader();
    loader.load(
      "/3DModels/painted_sofa.glb",
      (gltf) => {
        model = gltf.scene;
        model.scale.set(1.27, 0.9144, 0.76);
        model.position.set(0, -0.5, -1.2);
        scene.add(model);
      },
      undefined,
      (err) => {
        console.error("Model load failed:", err);
      }
    );
  };

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
        muted
        playsInline
      />
      <div ref={canvasRef} style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(0,0,0,0.6)',
        color: '#fff',
        padding: '10px',
        borderRadius: '8px',
        zIndex: 2,
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
        zIndex: 2,
        borderRadius: '50%',
      }}>
        ✕
      </button>
    </div>
  );
};

export default AppScene;
