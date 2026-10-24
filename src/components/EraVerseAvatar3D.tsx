import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  buildRealisticCharacter3D,
  BuiltRealisticCharacter,
  RealisticCharacterOptions,
  STUDIO_THEMES,
} from '../utils/realisticCharacterBuilder';

export interface EraVerseAvatar3DProps extends RealisticCharacterOptions {
  size?: number;
  width?: number;
  height?: number;
  interactive?: boolean;
  className?: string;
  showPedestal?: boolean;
  animationMode?: 'idle' | 'walk' | 'wave' | 'ride' | 'tpose';
  cameraFocus?: 'full' | 'face';
  autoSpin?: boolean;
  studioTheme?: string;
  onSnapshotReady?: (captureFn: () => string | null) => void;
}

export const EraVerseAvatar3D: React.FC<EraVerseAvatar3DProps> = (props) => {
  const {
    size = 180,
    width,
    height,
    interactive = true,
    className = '',
    showPedestal = true,
    animationMode = 'idle',
    cameraFocus = 'full',
    autoSpin = false,
    studioTheme = 'studio_white',
    onSnapshotReady,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const charRef = useRef<BuiltRealisticCharacter | null>(null);
  const pedestalGroupRef = useRef<THREE.Group | null>(null);

  const animModeRef = useRef(animationMode);
  const camFocusRef = useRef(cameraFocus);
  const autoSpinRef = useRef(autoSpin);
  const targetRotYRef = useRef(0.18);
  const zoomDistanceRef = useRef(3.25);
  const isDraggingRef = useRef(false);
  const prevMouseXRef = useRef(0);

  useEffect(() => {
    animModeRef.current = animationMode;
  }, [animationMode]);

  useEffect(() => {
    camFocusRef.current = cameraFocus;
  }, [cameraFocus]);

  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  // Initialize Scene, Camera, Lighting & Renderer once per mount/dimensions
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = width || container.clientWidth || size;
    const h = height || container.clientHeight || size;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 100);
    camera.position.set(0, 1.32, 3.25);
    camera.lookAt(0, 1.12, 0);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      });
    } catch {
      return;
    }

    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '' : '';
    const isSoftware = /SwiftShader|Software|llvmpipe/i.test(rendererStr);

    renderer.setSize(w, h);
    renderer.setPixelRatio(isSoftware ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftware;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4-Point Studio Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 1.15);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.55);
    keyLight.position.set(3.2, 5.5, 4.2);
    if (!isSoftware) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 15;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.85);
    fillLight.position.set(-3.5, 2.8, 2.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(0, 4.2, -4.0);
    scene.add(rimLight);

    // Pedestal Group
    const pedGroup = new THREE.Group();
    pedestalGroupRef.current = pedGroup;
    scene.add(pedGroup);

    if (onSnapshotReady) {
      onSnapshotReady(() => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return null;
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        return rendererRef.current.domElement.toDataURL('image/png');
      });
    }

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const nw = width || container.clientWidth || size;
      const nh = height || container.clientHeight || size;
      if (nw > 0 && nh > 0) {
        cameraRef.current.aspect = nw / nh;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(nw, nh);
      }
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let frameId = 0;
    const clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();

      const built = charRef.current;
      if (built) {
        if (autoSpinRef.current && !isDraggingRef.current) {
          targetRotYRef.current += dt * 0.65;
        }
        built.root.rotation.y += (targetRotYRef.current - built.root.rotation.y) * 0.12;

        // Blinking
        blinkTimer += dt;
        if (!isBlinking && blinkTimer > 3.2 + Math.sin(t) * 1.1) {
          isBlinking = true;
          blinkTimer = 0;
        }
        if (isBlinking) {
          const blinkPhase = Math.sin((blinkTimer / 0.15) * Math.PI);
          built.eyelids.forEach((lid) => {
            lid.scale.y = 0.05 + Math.max(0, blinkPhase) * 0.98;
          });
          if (blinkTimer >= 0.15) {
            isBlinking = false;
            blinkTimer = 0;
            built.eyelids.forEach((lid) => {
              lid.scale.y = 0.05;
            });
          }
        }

        // Pose / Animation Modes
        const mode = animModeRef.current;
        const {
          hipsGroup,
          torsoGroup,
          headGroup,
          leftArmGroup,
          rightArmGroup,
          leftLegGroup,
          rightLegGroup,
          wheelMeshes,
        } = built;

        leftArmGroup.rotation.set(0, 0, 0);
        rightArmGroup.rotation.set(0, 0, 0);
        leftLegGroup.rotation.set(0, 0, 0);
        rightLegGroup.rotation.set(0, 0, 0);
        torsoGroup.rotation.set(0, 0, 0);
        headGroup.rotation.set(0, 0, 0);

        if (mode === 'idle') {
          hipsGroup.position.y = 1.06 + Math.sin(t * 2.1) * 0.014;
          torsoGroup.rotation.x = Math.sin(t * 2.1) * 0.02;
          headGroup.rotation.y = Math.sin(t * 0.85) * 0.08;
          headGroup.rotation.z = Math.cos(t * 1.1) * 0.03;
          leftArmGroup.rotation.z = -0.14 - Math.sin(t * 2.1) * 0.025;
          rightArmGroup.rotation.z = 0.14 + Math.sin(t * 2.1) * 0.025;
          leftArmGroup.rotation.x = Math.cos(t * 1.6) * 0.04;
          rightArmGroup.rotation.x = -Math.cos(t * 1.6) * 0.04;
        } else if (mode === 'walk') {
          const ws = t * 5.2;
          hipsGroup.position.y = 1.06 + Math.abs(Math.sin(ws)) * 0.038;
          torsoGroup.rotation.y = Math.sin(ws) * 0.09;
          leftLegGroup.rotation.x = Math.sin(ws) * 0.52;
          rightLegGroup.rotation.x = -Math.sin(ws) * 0.52;
          leftArmGroup.rotation.x = -Math.sin(ws) * 0.45;
          rightArmGroup.rotation.x = Math.sin(ws) * 0.45;
          leftArmGroup.rotation.z = -0.1;
          rightArmGroup.rotation.z = 0.1;
          headGroup.rotation.y = -Math.sin(ws) * 0.05;
        } else if (mode === 'wave') {
          hipsGroup.position.y = 1.06 + Math.sin(t * 2.4) * 0.015;
          headGroup.rotation.z = -0.06;
          headGroup.rotation.y = 0.08;
          leftArmGroup.rotation.z = -0.15;
          rightArmGroup.rotation.z = 2.45 + Math.sin(t * 8.5) * 0.26;
          rightArmGroup.rotation.x = -0.25;
        } else if (mode === 'ride') {
          const rs = t * 5.5;
          hipsGroup.position.y = 1.12 + Math.sin(rs * 2) * 0.015;
          torsoGroup.rotation.x = 0.18;
          leftArmGroup.rotation.x = -0.72;
          rightArmGroup.rotation.x = -0.72;
          leftLegGroup.rotation.x = -0.35 + Math.sin(rs) * 0.35;
          rightLegGroup.rotation.x = -0.35 - Math.sin(rs) * 0.35;
          wheelMeshes.forEach((w) => {
            w.rotation.x += dt * 5.5;
          });
        } else if (mode === 'tpose') {
          hipsGroup.position.y = 1.06;
          leftArmGroup.rotation.z = -1.35;
          rightArmGroup.rotation.z = 1.35;
        }
      }

      // Smooth Camera Focus Interpolation
      if (cameraRef.current) {
        const isFace = camFocusRef.current === 'face';
        const targetY = isFace ? 1.66 : 1.24;
        const lookY = isFace ? 1.64 : 1.08;
        const targetZ = isFace ? 1.48 : zoomDistanceRef.current;

        cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.1;
        cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * 0.1;
        cameraRef.current.lookAt(0, lookY, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      if (charRef.current) {
        charRef.current.dispose();
        charRef.current = null;
      }
      renderer.dispose();
    };
  }, [size, width, height]);

  // Rebuild Pedestal when showPedestal or studioTheme changes
  useEffect(() => {
    const pedGroup = pedestalGroupRef.current;
    if (!pedGroup) return;
    while (pedGroup.children.length > 0) {
      const child = pedGroup.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      pedGroup.remove(child);
    }
    if (!showPedestal) return;

    const themeObj = STUDIO_THEMES.find((t) => t.id === studioTheme) || STUDIO_THEMES[0];

    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(0.92, 0.98, 0.08, 48),
      new THREE.MeshStandardMaterial({
        color: themeObj.pedestal,
        roughness: 0.35,
        metalness: 0.1,
      })
    );
    disc.position.y = -0.04;
    disc.receiveShadow = true;
    pedGroup.add(disc);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.94, 0.018, 12, 64),
      new THREE.MeshBasicMaterial({ color: themeObj.ring })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.002;
    pedGroup.add(ring);
  }, [showPedestal, studioTheme]);

  // Rebuild Character Mesh when any customization option changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const prevRotY = charRef.current ? charRef.current.root.rotation.y : targetRotYRef.current;
    if (charRef.current) {
      scene.remove(charRef.current.root);
      charRef.current.dispose();
    }

    const built = buildRealisticCharacter3D(props, 'high');
    built.root.rotation.y = prevRotY;
    scene.add(built.root);
    charRef.current = built;
  }, [
    props.gender,
    props.skinTone,
    props.skinColor,
    props.bodyScale,
    props.chubbiness,
    props.headScale,
    props.bodyType,
    props.faceShape,
    props.jawDefine,
    props.earStyle,
    props.eyeShape,
    props.eyeColor,
    props.eyeScale,
    props.eyebrowStyle,
    props.noseShape,
    props.mouthStyle,
    props.skinDetail,
    props.blush,
    props.hairStyle,
    props.hairColor,
    props.topStyle,
    props.topColor,
    props.shirtColor,
    props.topSecondary,
    props.clothingType,
    props.jacketStyle,
    props.jacketPrimary,
    props.jacketSecondary,
    props.bottomStyle,
    props.bottomColor,
    props.pantsColor,
    props.beltStyle,
    props.beltType,
    props.shoeStyle,
    props.shoeColor,
    props.hatStyle,
    props.hatType,
    JSON.stringify(props.accessories || []),
    props.accessoryType,
    props.glassesStyle,
    props.faceStyle,
    props.rideStyle,
    props.vehicleType,
    props.bikeColor,
  ]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    prevMouseXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive || !isDraggingRef.current) return;
    const dx = e.clientX - prevMouseXRef.current;
    prevMouseXRef.current = e.clientX;
    targetRotYRef.current += dx * 0.014;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!interactive) return;
    zoomDistanceRef.current = Math.max(1.8, Math.min(4.8, zoomDistanceRef.current + e.deltaY * 0.002));
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
      style={{
        width: width ? `${width}px` : height ? '100%' : `${size}px`,
        height: height ? `${height}px` : `${size}px`,
      }}
      className={`relative select-none ${interactive ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`}
      title={interactive ? 'Drag to rotate 360° • Scroll to zoom' : undefined}
    />
  );
};
