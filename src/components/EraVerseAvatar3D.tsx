import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export interface EraVerseAvatar3DProps {
  shirtColor: string;
  hairColor: string;
  skinColor: string;
  hatType: 'none' | 'cap' | 'grad' | 'crown' | 'headphones' | 'halo' | 'beanie' | string;
  accessoryType: 'none' | 'glasses' | 'shades' | 'cyber_visor' | 'wings' | 'star_badge' | string;
  gender?: 'boy' | 'girl' | string;
  hairStyle?: 'classic' | 'spiky' | 'long' | 'ponytail' | 'twintails' | string;
  bodyType?: 'regular' | 'slim' | 'athletic' | 'tall' | string;
  clothingType?: 'varsity' | 'hoodie' | 'streetwear' | 'royal_suit' | 'skirt_outfit' | 'cyber_jacket' | string;
  pantsColor?: string;
  beltType?: 'none' | 'leather_belt' | 'gold_belt' | 'cyber_belt' | 'star_belt' | string;
  vehicleType?: 'none' | 'skateboard' | 'bike' | string;
  name?: string;
  cohort?: string;
  showNameplate?: boolean;
  className?: string;
  interactive?: boolean;
}

export const EraVerseAvatar3D: React.FC<EraVerseAvatar3DProps> = ({
  shirtColor = '#2563eb',
  hairColor = '#1c1917',
  skinColor = '#fde68a',
  hatType = 'cap',
  accessoryType = 'glasses',
  gender = 'boy',
  hairStyle = 'classic',
  bodyType = 'regular',
  clothingType = 'varsity',
  pantsColor = '#1e293b',
  beltType = 'none',
  vehicleType = 'none',
  name = 'Student',
  cohort = 'IELTS 1',
  showNameplate = false,
  className = 'w-full h-full',
  interactive = true
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rebuildRigRef = useRef<((opts: EraVerseAvatar3DProps) => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 128;
    const height = container.clientHeight || 128;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x38bdf8);

    const camera = new THREE.PerspectiveCamera(34, width / height, 0.1, 50);
    camera.position.set(0, 2.05, 5.35);
    camera.lookAt(0, 1.65, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch (_e) {
      return;
    }

    const gl = renderer.getContext();
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererStr = debugInfo ? String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) : '';
    const isSoftwareGl = /SwiftShader|llvmpipe|Software/i.test(rendererStr);

    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    container.innerHTML = '';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.05);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0x86efac, 0.9);
    hemi.position.set(0, 10, 0);
    scene.add(hemi);

    const dirLight = new THREE.DirectionalLight(0xfffbeb, 1.45);
    dirLight.position.set(3.5, 6.5, 5.0);
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.55);
    rimLight.position.set(-3.5, 4.0, -3.5);
    scene.add(rimLight);

    const groundPlaza = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.2, 0.12, 24),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65, metalness: 0.05 })
    );
    groundPlaza.position.y = -0.06;
    scene.add(groundPlaza);

    const grassBackdrop = new THREE.Mesh(
      new THREE.CylinderGeometry(6.5, 6.5, 0.08, 24),
      new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.85 })
    );
    grassBackdrop.position.set(0, -0.1, -1.8);
    scene.add(grassBackdrop);

    const createNameplateSprite = (charName: string, charCohort: string) => {
      const c = document.createElement('canvas');
      c.width = 360;
      c.height = 88;
      const ctx = c.getContext('2d')!;

      const isTeacher = charCohort.toUpperCase().includes('TEACHER') || charCohort.toUpperCase().includes('ADMIN');
      const isIelts2 = charCohort.includes('2');
      const badgeColor = isTeacher ? '#d97706' : isIelts2 ? '#10b981' : '#2563eb';

      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.beginPath();
      ctx.roundRect(6, 6, 348, 76, 20);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = badgeColor;
      ctx.stroke();

      ctx.fillStyle = badgeColor;
      ctx.beginPath();
      ctx.roundRect(42, 12, 276, 24, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 12px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(charCohort.toUpperCase(), 180, 29);

      ctx.fillStyle = isTeacher ? '#fde68a' : '#ffffff';
      ctx.font = '900 21px Plus Jakarta Sans, sans-serif';
      ctx.fillText(charName.slice(0, 20), 180, 62);

      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true, depthWrite: false })
      );
      sprite.scale.set(2.3, 0.56, 1);
      sprite.position.set(0, 3.65, 0);
      return sprite;
    };

    const buildAvatarMesh = (opts: EraVerseAvatar3DProps) => {
      const root = new THREE.Group();
      const segs = isSoftwareGl ? 12 : 20;

      const shadowDisc = new THREE.Mesh(
        new THREE.CircleGeometry(0.85, segs),
        new THREE.MeshBasicMaterial({ color: 0x0f172a, transparent: true, opacity: 0.22, depthWrite: false })
      );
      shadowDisc.rotation.x = -Math.PI / 2;
      shadowDisc.position.y = 0.01;
      root.add(shadowDisc);

      const characterContainer = new THREE.Group();
      root.add(characterContainer);

      // Apply bodyType scale
      const bType = opts.bodyType || 'regular';
      if (bType === 'slim') {
        characterContainer.scale.set(0.88, 1.0, 0.88);
      } else if (bType === 'athletic') {
        characterContainer.scale.set(1.14, 1.02, 1.1);
      } else if (bType === 'tall') {
        characterContainer.scale.set(0.96, 1.08, 0.96);
      }

      const bodyGroup = new THREE.Group();
      characterContainer.add(bodyGroup);

      const skinMat = new THREE.MeshStandardMaterial({ color: opts.skinColor || '#fde68a', roughness: 0.45, metalness: 0.04 });
      const shirtMat = new THREE.MeshStandardMaterial({
        color: opts.shirtColor || '#2563eb',
        roughness: opts.clothingType === 'cyber_jacket' ? 0.18 : 0.36,
        metalness: opts.clothingType === 'cyber_jacket' ? 0.65 : 0.14
      });
      const pantsMat = new THREE.MeshStandardMaterial({ color: opts.pantsColor || '#1e293b', roughness: 0.55, metalness: 0.08 });
      const shoeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.2 });
      const hairMat = new THREE.MeshStandardMaterial({ color: opts.hairColor || '#1c1917', roughness: 0.52, metalness: 0.1 });

      const createLegWithShoe = (lx: number) => {
        const legGroup = new THREE.Group();
        legGroup.position.set(lx, 0.92, 0);
        const legCyl = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.52, 8, segs), pantsMat);
        legCyl.position.y = -0.38;
        legGroup.add(legCyl);

        const sneaker = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.54), shoeMat);
        sneaker.position.set(0, -0.8, 0.06);
        legGroup.add(sneaker);
        return legGroup;
      };

      const leftLeg = createLegWithShoe(-0.24);
      const rightLeg = createLegWithShoe(0.24);
      characterContainer.add(leftLeg, rightLeg);

      // Torso + Clothing Style variations
      const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.52, 8, segs), shirtMat);
      torso.position.y = 1.45;
      bodyGroup.add(torso);

      if (opts.clothingType === 'skirt_outfit' || (opts.gender === 'girl' && opts.clothingType === 'skirt_outfit')) {
        const skirt = new THREE.Mesh(
          new THREE.ConeGeometry(0.56, 0.48, 16),
          new THREE.MeshStandardMaterial({ color: opts.pantsColor || opts.shirtColor || '#db2777', roughness: 0.45 })
        );
        skirt.position.y = 0.98;
        bodyGroup.add(skirt);
      } else if (opts.clothingType === 'royal_suit') {
        const lapel = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.55, 0.86),
          new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3, metalness: 0.5 })
        );
        lapel.position.set(0, 1.5, 0.02);
        bodyGroup.add(lapel);
      } else if (opts.clothingType === 'hoodie') {
        const hoodBack = new THREE.Mesh(
          new THREE.SphereGeometry(0.32, 12, 12),
          shirtMat
        );
        hoodBack.position.set(0, 1.92, -0.26);
        bodyGroup.add(hoodBack);
      }

      const collar = new THREE.Mesh(
        new THREE.TorusGeometry(0.28, 0.06, 8, segs),
        new THREE.MeshStandardMaterial({
          color: opts.clothingType === 'cyber_jacket' ? 0x38bdf8 : 0xffffff,
          emissive: opts.clothingType === 'cyber_jacket' ? 0x0284c7 : 0x000000,
          emissiveIntensity: opts.clothingType === 'cyber_jacket' ? 0.5 : 0,
          roughness: 0.3
        })
      );
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 1.92;
      bodyGroup.add(collar);

      // 3D Belt around the waist (EraSHOP Belts!)
      if (opts.beltType && opts.beltType !== 'none') {
        const beltColor =
          opts.beltType === 'gold_belt'
            ? 0xfacc15
            : opts.beltType === 'cyber_belt'
            ? 0x06b6d4
            : opts.beltType === 'star_belt'
            ? 0xec4899
            : 0x78350f;
        const beltRing = new THREE.Mesh(
          new THREE.CylinderGeometry(0.435, 0.435, 0.13, 20),
          new THREE.MeshStandardMaterial({
            color: beltColor,
            emissive: opts.beltType === 'cyber_belt' ? 0x06b6d4 : 0x000000,
            emissiveIntensity: opts.beltType === 'cyber_belt' ? 0.6 : 0,
            roughness: 0.25,
            metalness: opts.beltType === 'gold_belt' ? 0.9 : 0.45
          })
        );
        beltRing.position.y = 1.07;
        bodyGroup.add(beltRing);

        const buckle = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.18, 0.12),
          new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.15, metalness: 0.92 })
        );
        buckle.position.set(0, 1.07, 0.42);
        bodyGroup.add(buckle);
      }

      // Backpack or Wings
      if (opts.accessoryType === 'wings') {
        const wingMat = new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          emissive: 0x38bdf8,
          emissiveIntensity: 0.25,
          roughness: 0.25,
          metalness: 0.3
        });
        [-1, 1].forEach((side) => {
          const wing = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.95, 0.1), wingMat);
          wing.position.set(side * 0.48, 1.62, -0.38);
          wing.rotation.z = side * -0.28;
          wing.rotation.y = side * 0.3;
          bodyGroup.add(wing);
        });
      } else {
        const isTeacherCohort = String(opts.cohort || '').toUpperCase().includes('TEACHER');
        const backpack = new THREE.Mesh(
          new THREE.BoxGeometry(0.62, 0.72, 0.32),
          new THREE.MeshStandardMaterial({
            color: isTeacherCohort ? 0xb45309 : String(opts.cohort || '').includes('2') ? 0x059669 : 0x1e3a8a,
            roughness: 0.4,
            metalness: 0.2
          })
        );
        backpack.position.set(0, 1.48, -0.38);
        bodyGroup.add(backpack);
      }

      // Arms + Hands
      const createArm = (ax: number) => {
        const armGroup = new THREE.Group();
        armGroup.position.set(ax, 1.86, 0);
        const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.48, 8, segs), shirtMat);
        sleeve.position.y = -0.34;
        armGroup.add(sleeve);
        const hand = new THREE.Mesh(new THREE.SphereGeometry(0.16, segs, segs), skinMat);
        hand.position.y = -0.76;
        armGroup.add(hand);
        return armGroup;
      };

      const leftArm = createArm(-0.58);
      const rightArm = createArm(0.58);
      bodyGroup.add(leftArm, rightArm);

      // Head + Boy/Girl Facial Details & Hairstyles
      const headGroup = new THREE.Group();
      headGroup.position.y = 2.44;
      const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.46, segs, segs), skinMat);
      headMesh.scale.set(1.0, 1.04, 0.96);
      headGroup.add(headMesh);

      [-0.45, 0.45].forEach((ex) => {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), skinMat);
        ear.position.set(ex, 0.0, 0);
        headGroup.add(ear);
      });

      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
      const pupilHighlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      [-0.16, 0.16].forEach((ex) => {
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.065, 10, 10), eyeMat);
        eye.position.set(ex, 0.06, 0.41);
        headGroup.add(eye);
        const glint = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), pupilHighlightMat);
        glint.position.set(ex + 0.02, 0.08, 0.46);
        headGroup.add(glint);

        // Girl eyelashes + rosy cheeks
        if (opts.gender === 'girl') {
          const lash = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.024, 0.03), eyeMat);
          lash.position.set(ex + (ex < 0 ? -0.02 : 0.02), 0.12, 0.43);
          lash.rotation.z = ex < 0 ? 0.22 : -0.22;
          headGroup.add(lash);

          const blush = new THREE.Mesh(
            new THREE.CircleGeometry(0.065, 10),
            new THREE.MeshBasicMaterial({ color: 0xf472b6, transparent: true, opacity: 0.45 })
          );
          blush.position.set(ex * 1.45, -0.03, 0.41);
          headGroup.add(blush);
        }
      });

      const smile = new THREE.Mesh(
        new THREE.TorusGeometry(0.11, 0.022, 6, 12, Math.PI),
        new THREE.MeshBasicMaterial({ color: opts.gender === 'girl' ? 0xe11d48 : 0x7c2d12 })
      );
      smile.rotation.x = Math.PI;
      smile.position.set(0, -0.08, 0.42);
      headGroup.add(smile);

      const hairDome = new THREE.Mesh(
        new THREE.SphereGeometry(0.48, segs, segs, 0, Math.PI * 2, 0, Math.PI * 0.55),
        hairMat
      );
      hairDome.position.y = 0.05;
      headGroup.add(headDomeOrStyle(hairDome, opts.gender, opts.hairStyle, hairMat, segs));

      // Hats / Headgear
      if (opts.hatType === 'grad') {
        const mortar = new THREE.Mesh(
          new THREE.BoxGeometry(1.12, 0.08, 1.12),
          new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35 })
        );
        mortar.position.y = 0.52;
        headGroup.add(mortar);
        const tassel = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.32, 0.1),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.7 })
        );
        tassel.position.set(0.46, 0.38, 0.46);
        headGroup.add(tassel);
      } else if (opts.hatType === 'crown') {
        const crown = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.32, 0.28, 12),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.18, metalness: 0.88 })
        );
        crown.position.y = 0.54;
        headGroup.add(crown);
      } else if (opts.hatType === 'cap') {
        const capVisor = new THREE.Mesh(
          new THREE.BoxGeometry(0.76, 0.08, 0.42),
          new THREE.MeshStandardMaterial({ color: opts.shirtColor || '#2563eb', roughness: 0.35 })
        );
        capVisor.position.set(0, 0.32, 0.42);
        headGroup.add(capVisor);
      } else if (opts.hatType === 'headphones') {
        const band = new THREE.Mesh(
          new THREE.TorusGeometry(0.49, 0.06, 8, 20, Math.PI),
          new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.25, metalness: 0.7 })
        );
        band.position.y = 0.06;
        headGroup.add(band);
      } else if (opts.hatType === 'halo') {
        const halo = new THREE.Mesh(
          new THREE.TorusGeometry(0.38, 0.045, 10, 24),
          new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            emissive: 0xfacc15,
            emissiveIntensity: 0.85,
            roughness: 0.15
          })
        );
        halo.rotation.x = Math.PI / 2;
        halo.position.y = 0.68;
        headGroup.add(halo);
      }

      if (opts.accessoryType === 'glasses' || opts.accessoryType === 'shades' || opts.accessoryType === 'cyber_visor') {
        const gMat = new THREE.MeshStandardMaterial({
          color: opts.accessoryType === 'shades' ? 0x0f172a : opts.accessoryType === 'cyber_visor' ? 0x06b6d4 : 0x38bdf8,
          emissive: opts.accessoryType === 'cyber_visor' ? 0x06b6d4 : 0x000000,
          emissiveIntensity: opts.accessoryType === 'cyber_visor' ? 0.65 : 0,
          roughness: 0.12,
          metalness: 0.85
        });
        const glassesBar = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.17, 0.09), gMat);
        glassesBar.position.set(0, 0.06, 0.44);
        headGroup.add(glassesBar);
      }

      bodyGroup.add(headGroup);

      // 3D Vehicles (Skateboard or Bike from EraSHOP!)
      if (opts.vehicleType === 'skateboard') {
        characterContainer.position.y = 0.18;
        const boardGroup = new THREE.Group();
        const deck = new THREE.Mesh(
          new THREE.BoxGeometry(0.85, 0.07, 1.95),
          new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3, metalness: 0.2 })
        );
        deck.position.y = 0.15;
        boardGroup.add(deck);

        const stripe = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.075, 1.85),
          new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 })
        );
        stripe.position.y = 0.152;
        boardGroup.add(stripe);

        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
        [
          [-0.36, -0.62],
          [0.36, -0.62],
          [-0.36, 0.62],
          [0.36, 0.62]
        ].forEach(([wx, wz]) => {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.1, 12), wheelMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(wx, 0.09, wz);
          boardGroup.add(wheel);
        });
        root.add(boardGroup);
      } else if (opts.vehicleType === 'bike') {
        characterContainer.position.y = 0.24;
        const bikeGroup = new THREE.Group();
        const frameMat = new THREE.MeshStandardMaterial({
          color: 0x10b981,
          emissive: 0x059669,
          emissiveIntensity: 0.25,
          roughness: 0.2,
          metalness: 0.75
        });
        const tireMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.55 });

        [-0.85, 0.85].forEach((wz) => {
          const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.075, 10, 20), tireMat);
          wheel.rotation.y = Math.PI / 2;
          wheel.position.set(0, 0.46, wz);
          bikeGroup.add(wheel);
        });

        const topBar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.5, 10), frameMat);
        topBar.rotation.x = Math.PI / 2;
        topBar.position.set(0, 0.88, 0);
        bikeGroup.add(topBar);

        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.78, 10), frameMat);
        stem.position.set(0, 1.05, 0.75);
        bikeGroup.add(stem);

        const handlebar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 10), frameMat);
        handlebar.rotation.z = Math.PI / 2;
        handlebar.position.set(0, 1.42, 0.75);
        bikeGroup.add(handlebar);

        root.add(bikeGroup);
      }

      if (opts.showNameplate && opts.name) {
        root.add(createNameplateSprite(opts.name, opts.cohort || 'IELTS 1'));
      }

      return { root, bodyGroup, leftArm, rightArm, headGroup };
    };

    function headDomeOrStyle(
      baseDome: THREE.Mesh,
      genderOpt?: string,
      styleOpt?: string,
      hairMat?: THREE.Material,
      segs = 14
    ) {
      const g = new THREE.Group();
      g.add(baseDome);
      const effectiveStyle =
        styleOpt && styleOpt !== 'classic'
          ? styleOpt
          : genderOpt === 'girl'
          ? 'long'
          : 'classic';

      if (effectiveStyle === 'long' || genderOpt === 'girl') {
        const backHair = new THREE.Mesh(new THREE.CapsuleGeometry(0.36, 0.55, 6, segs), hairMat);
        backHair.position.set(0, -0.22, -0.22);
        g.add(backHair);
        [-0.38, 0.38].forEach((sx) => {
          const lock = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.42, 6, 10), hairMat);
          lock.position.set(sx, -0.18, 0.12);
          g.add(lock);
        });
      }
      if (effectiveStyle === 'ponytail') {
        const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.48, 6, 12), hairMat);
        tail.position.set(0, 0.05, -0.52);
        tail.rotation.x = 0.55;
        g.add(tail);
      } else if (effectiveStyle === 'twintails') {
        [-0.48, 0.48].forEach((tx) => {
          const tail = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.45, 6, 10), hairMat);
          tail.position.set(tx, -0.05, -0.15);
          tail.rotation.z = tx < 0 ? 0.35 : -0.35;
          g.add(tail);
        });
      } else if (effectiveStyle === 'spiky') {
        [-0.18, 0, 0.18].forEach((sx, idx) => {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.32, 8), hairMat);
          spike.position.set(sx, 0.52, 0.08 - idx * 0.04);
          spike.rotation.z = sx * -0.6;
          g.add(spike);
        });
      }
      return g;
    }

    let currentRig = buildAvatarMesh({
      shirtColor,
      hairColor,
      skinColor,
      hatType,
      accessoryType,
      gender,
      hairStyle,
      bodyType,
      clothingType,
      pantsColor,
      beltType,
      vehicleType,
      name,
      cohort,
      showNameplate
    });
    scene.add(currentRig.root);

    rebuildRigRef.current = (newOpts: EraVerseAvatar3DProps) => {
      const prevRotY = currentRig.root.rotation.y;
      scene.remove(currentRig.root);
      currentRig = buildAvatarMesh(newOpts);
      currentRig.root.rotation.y = prevRotY;
      scene.add(currentRig.root);
      if (newOpts.showNameplate || newOpts.vehicleType === 'bike' || newOpts.vehicleType === 'skateboard') {
        camera.position.set(0, 2.1, 5.95);
        camera.lookAt(0, 1.7, 0);
      } else {
        camera.position.set(0, 2.05, 5.25);
        camera.lookAt(0, 1.65, 0);
      }
    };

    let isDragging = false;
    let lastX = 0;
    let userYaw = -0.18;

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      lastX = e.clientX;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      userYaw += dx * 0.015;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      const w = container.clientWidth || 128;
      const h = container.clientHeight || 128;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(container);

    let isDisposed = false;
    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      if (isDisposed) return;
      const t = clock.getElapsedTime();

      if (!isDragging) {
        currentRig.root.rotation.y = userYaw + Math.sin(t * 1.1) * 0.22;
      } else {
        currentRig.root.rotation.y = userYaw;
      }
      currentRig.bodyGroup.position.y = Math.sin(t * 2.4) * 0.03;
      currentRig.headGroup.rotation.z = Math.sin(t * 1.6) * 0.04;
      currentRig.rightArm.rotation.z = -0.08 + Math.sin(t * 2.4) * 0.06;
      currentRig.leftArm.rotation.z = 0.08 - Math.sin(t * 2.4) * 0.06;

      renderer.render(scene, camera);
      if (isSoftwareGl) {
        animId = window.setTimeout(animate, 90) as unknown as number;
      } else {
        animId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      clearTimeout(animId);
      resizeObserver.disconnect();
      dom.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    if (rebuildRigRef.current) {
      rebuildRigRef.current({
        shirtColor,
        hairColor,
        skinColor,
        hatType,
        accessoryType,
        gender,
        hairStyle,
        bodyType,
        clothingType,
        pantsColor,
        beltType,
        vehicleType,
        name,
        cohort,
        showNameplate
      });
    }
  }, [
    shirtColor,
    hairColor,
    skinColor,
    hatType,
    accessoryType,
    gender,
    hairStyle,
    bodyType,
    clothingType,
    pantsColor,
    beltType,
    vehicleType,
    name,
    cohort,
    showNameplate
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden select-none ${interactive ? 'cursor-grab active:cursor-grabbing' : ''} ${className}`}
      title={interactive ? `${name} (${cohort}) — Drag to rotate 3D EraVerse Character` : `${name} (${cohort})`}
    />
  );
};
export default EraVerseAvatar3D;
