import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import 'webxr-polyfill';
import QRCode from 'react-qr-code';
import './AppScene.css';

const AppScene = ({ onClose, modelUrl }) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [message, setMessage] = useState("Hold camera at the Empty Wall !");
  const [arReady, setARReady] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [showUnsupportedModal, setShowUnsupportedModal] = useState(false);
  const [unsupportedType, setUnsupportedType] = useState('');
  const [deviceType, setDeviceType] = useState('');

  let camera, scene, renderer, controller, model, hitTestSource = null;
  let reticle;
  let hitTestSourceRequested = false;

  useEffect(() => {
    detectDeviceType();
  }, []);

  const detectDeviceType = async () => {
    const ua = navigator.userAgent;
    let type = 'pc';

    if (/iPhone|iPad|iPod/i.test(ua)) type = 'ios';
    else if (/Android/i.test(ua)) type = 'android';

    setDeviceType(type);

    const isARSupported = await checkARSupport();

    if (!isARSupported) {
      setUnsupportedType(type);
      setShowUnsupportedModal(true);
    } else {
      startSimpleCameraAndDetect();
    }
  };

  const checkARSupport = async () => {
    if (!navigator.xr) return false;
    try {
      return await navigator.xr.isSessionSupported('immersive-ar');
    } catch (err) {
      return false;
    }
  };

  const stopCameraStream = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(track => track.stop());
  };

  const startSimpleCameraAndDetect = async () => {
    setMessage("Hold at the Empty Wall properly for detection...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setTimeout(captureFrameAndDetectWall, 3000);
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
            setMessage("✅ Wall detected, Starting AR...");
            stopCameraStream();
            setShowPopup(false);
            setARReady(true);
            setTimeout(startARScene, 1500);
          } else {
            setMessage("❌ No wall detected, Please try again in better lighting.");
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
    init();
    animate();

    try {
      const session = await navigator.xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
        optionalFeatures: ['local-floor']
      });

      renderer.xr.setSession(session);
      session.addEventListener('end', () => {
        hitTestSourceRequested = false;
        hitTestSource = null;
      });

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

    reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.08, 0.1, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: 0x00ff00 })
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('wheel', onZoom);
  };

  const loadModel = () => {
    if (!modelUrl) {
      setMessage("⚠️ No model URL provided.");
      return;
    }

    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        model = gltf.scene;
        model.scale.set(1.27, 0.9144, 0.76);
        model.visible = false; // Place on select only
        scene.add(model);
        setMessage("✅ Tap on surface to place model.");
      },
      undefined,
      (error) => {
        console.error("Model load error:", error);
        setMessage("⚠️ Failed to load model.");
      }
    );
  };

  const animate = () => {
    renderer.setAnimationLoop((timestamp, frame) => {
      if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (!hitTestSourceRequested) {
          session.requestReferenceSpace('viewer').then((refSpace) => {
            session.requestHitTestSource({ space: refSpace }).then((source) => {
              hitTestSource = source;
            });
          });
          hitTestSourceRequested = true;
        }

        if (hitTestSource) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);
          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(referenceSpace);
            reticle.visible = true;
            reticle.matrix.fromArray(pose.transform.matrix);
          } else {
            reticle.visible = false;
          }
        }
      }

      renderer.render(scene, camera);
    });
  };

  const onSelect = () => {
    if (model && reticle.visible) {
      model.position.setFromMatrixPosition(reticle.matrix);
      model.quaternion.setFromRotationMatrix(reticle.matrix);
      model.visible = true;
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

  const renderUnsupportedModal = () => {
    if (!showUnsupportedModal) return null;

    const handleClose = () => {
      setShowUnsupportedModal(false);
      setShowPopup(false);
    };

    if (unsupportedType === 'pc') {
      return (
        <div className="unsupported-modal">
          <button className="close-button" onClick={handleClose}>✕</button>
          <h2>This Feature is not supported on this device.</h2>
          <p>Scan the QR code below using your smartphone to place Product in your Space:</p>
          <div className="qr-wrapper">
            <div className="qr-section">
              <h4>iOS Users</h4>
              <QRCode value={`https://apps.apple.com/pk/app/webxr-viewer/id1295998056?productUrl=${encodeURIComponent(window.location.href)}`} />
            </div>
            <div className="qr-section">
              <h4>Android Users</h4>
              <QRCode value={`https://play.google.com/store/apps/details?id=com.chrome.canary&productUrl=${encodeURIComponent(window.location.href)}`} />
            </div>
          </div>
        </div>
      );
    }

    const link = unsupportedType === 'ios'
      ? 'https://apps.apple.com/pk/app/webxr-viewer/id1295998056'
      : 'https://play.google.com/store/apps/details?id=com.chrome.canary';

    return (
      <div className="unsupported-modal">
        <button className="close-button" onClick={handleClose}>✕</button>
        <h2>AR is not supported on your device.</h2>
        <p>To experience AR features, click the link below:</p>
        <a href={link} className="download-button" target="_blank" rel="noopener noreferrer">
          Click here to get WebXR support
        </a>
      </div>
    );
  };

  return (
    <div ref={containerRef} style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {!arReady && showPopup && !showUnsupportedModal && (
        <div className="camera-modal">
          <div className="camera-header">
            <button onClick={onClose} className="cancel-button">✕</button>
          </div>
          <video ref={videoRef} className="camera-feed" playsInline muted></video>
          <div className="camera-message">{message}</div>
        </div>
      )}
      {renderUnsupportedModal()}
    </div>
  );
};

export default AppScene;