import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "webxr-polyfill";

const AppScene = ({ onClose }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const sessionRef = useRef(null);
  const modelRef = useRef(null);
  const [message, setMessage] = useState("Initializing WebXR...");
  const firstFrameRenderedRef = useRef(false);

  let camera, scene, controller;

  useEffect(() => {
    checkARSupport();
    return () => {
      if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
      if (rendererRef.current && rendererRef.current.xr.getSession()) {
        rendererRef.current.xr.getSession().end();
      }
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("wheel", onZoom);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkARSupport = async () => {
    if (!navigator.xr) {
      setMessage("⚠️ WebXR not supported on this device.");
      return;
    }
    const supported = await navigator.xr.isSessionSupported("immersive-ar");
    if (!supported) {
      setMessage("⚠️ immersive-ar session not supported.");
      return;
    }
    setMessage("WebXR supported. Starting AR session...");
    init();
    animate();
    startAR();
  };

  const init = () => {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      40
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    scene.add(light);

    controller = renderer.xr.getController(0);
    controller.addEventListener("select", onSelect);
    scene.add(controller);

    window.addEventListener("resize", onWindowResize);
    window.addEventListener("wheel", onZoom);
  };

  const startAR = async () => {
    try {
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["local-floor"],
      });
      sessionRef.current = session;
      rendererRef.current.xr.setSession(session);
      setMessage("AR session started. Move device to scan the scene.");

      // Start capture interval **only after first frame rendered**
      rendererRef.current.setAnimationLoop(() => {
        rendererRef.current.render(scene, camera);

        if (!firstFrameRenderedRef.current) {
          firstFrameRenderedRef.current = true;
          setMessage("Hold camera at the scene...");
          startCaptureInterval();
        }
      });
    } catch (error) {
      console.error("Failed to start AR session", error);
      setMessage("❌ Failed to start AR session: " + error.message);
    }
  };

  const startCaptureInterval = () => {
    if (captureIntervalRef.current) return; // prevent multiple intervals
    setMessage("Starting scene analysis every 10 seconds...");
    captureIntervalRef.current = setInterval(captureSceneAndCheckWall, 10000);
  };

  const captureSceneAndCheckWall = () => {
    if (!rendererRef.current) {
      setMessage("Renderer not initialized yet.");
      return;
    }

    setMessage("Analyzing scene...");

    const canvas = rendererRef.current.domElement;

    // Use toBlob for async blob creation
    canvas.toBlob((blob) => {
      if (!blob) {
        setMessage("⚠️ Failed to capture scene image.");
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
            clearInterval(captureIntervalRef.current);
            captureIntervalRef.current = null;
            setMessage("Wall detected ✅ Sofa placed.");
            loadModel();
          } else {
            setMessage("❌ No wall detected. Retrying...");
          }
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setMessage("⚠️ Error analyzing the scene.");
        });
    }, "image/jpeg");
  };

  const loadModel = () => {
    if (!rendererRef.current) return;
    const loader = new GLTFLoader();
    loader.load(
      "/3DModels/painted_sofa.glb",
      (gltf) => {
        modelRef.current = gltf.scene;
        modelRef.current.scale.set(1.27, 0.9144, 0.76);
        modelRef.current.position.set(0, -0.1, -0.8);
        scene.add(modelRef.current);
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
        setMessage("❌ Error loading 3D model.");
      }
    );
  };

  const onSelect = () => {
    if (!modelRef.current) return;
    const position = new THREE.Vector3();
    position.set(0, 0, -0.5).applyMatrix4(controller.matrixWorld);
    modelRef.current.position.copy(position);

    // Preserve original rotation and scale after positioning
    const originalScale = modelRef.current.scale.clone();
    const originalRotation = modelRef.current.rotation.clone();

    modelRef.current.quaternion.setFromRotationMatrix(controller.matrixWorld);
    modelRef.current.rotation.copy(originalRotation);
    modelRef.current.scale.copy(originalScale);
  };

  const onZoom = (event) => {
    if (!modelRef.current) return;
    const zoomFactor = 1 - event.deltaY * 0.001;
    const newScale = modelRef.current.scale.clone().multiplyScalar(zoomFactor);
    if (newScale.x > 0.01 && newScale.x < 2) {
      modelRef.current.scale.copy(newScale);
    }
  };

  const onWindowResize = () => {
    if (!camera || !rendererRef.current) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);
  };

  const animate = () => {
    // We moved the animation loop into startAR for proper timing.
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          background: "rgba(0,0,0,0.7)",
          color: "#fff",
          padding: "12px 16px",
          borderRadius: 8,
          fontSize: 16,
          zIndex: 1000,
          maxWidth: "80vw",
          wordWrap: "break-word",
        }}
      >
        {message}
      </div>

      <button
        onClick={() => {
          if (sessionRef.current) sessionRef.current.end();
          onClose();
        }}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "red",
          color: "white",
          border: "none",
          padding: "10px",
          fontSize: 18,
          cursor: "pointer",
          zIndex: 1000,
          borderRadius: "50%",
          lineHeight: 1,
          width: 40,
          height: 40,
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default AppScene;
