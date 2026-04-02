import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { motion } from 'framer-motion';

export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x08080c, 0.08);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);

    camera.position.set(0, 0.5, 6);
    camera.lookAt(0, 0, 0);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.03;
    controls.enableZoom = false;
    controls.minDistance = 3;
    controls.maxDistance = 12;
    controls.enablePan = false;
    controls.autoRotate = false;
    controls.maxPolarAngle = Math.PI * 0.65;
    controls.minPolarAngle = Math.PI * 0.35;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x1a1520, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.8);
    keyLight.position.set(5, 4, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x4466aa, 0.4);
    fillLight.position.set(-4, 2, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xd4a856, 0.8);
    rimLight.position.set(-2, 3, -5);
    scene.add(rimLight);

    const bottomLight = new THREE.PointLight(0xd4a856, 0.3, 10);
    bottomLight.position.set(0, -2, 0);
    scene.add(bottomLight);

    // Gold material
    const goldMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd4a856,
      metalness: 1.0,
      roughness: 0.15,
      reflectivity: 1.0,
      clearcoat: 0.3,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.5
    });

    const darkMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0c0c12,
      metalness: 0.3,
      roughness: 0.4,
      reflectivity: 0.6,
      clearcoat: 0.8,
      clearcoatRoughness: 0.05
    });

    const goldEdgeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd4a856,
      metalness: 1.0,
      roughness: 0.1,
      reflectivity: 1.0,
      emissive: 0xd4a856,
      emissiveIntensity: 0.05
    });

    // Environment map from simple cube
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
    const cubeCamera = new THREE.CubeCamera(0.1, 100, cubeRenderTarget);

    const envScene = new THREE.Scene();
    const envGeo = new THREE.SphereGeometry(50, 16, 16);
    const envMat = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      color: 0x0a0a14
    });
    envScene.add(new THREE.Mesh(envGeo, envMat));

    const envLight1 = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshBasicMaterial({ color: 0xffeedd, side: THREE.DoubleSide })
    );
    envLight1.position.set(10, 5, 5);
    envLight1.lookAt(0, 0, 0);
    envScene.add(envLight1);

    const envLight2 = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshBasicMaterial({ color: 0xd4a856, side: THREE.DoubleSide })
    );
    envLight2.position.set(-8, 3, -5);
    envLight2.lookAt(0, 0, 0);
    envScene.add(envLight2);

    cubeCamera.update(renderer, envScene);

    goldMaterial.envMap = cubeRenderTarget.texture;
    darkMaterial.envMap = cubeRenderTarget.texture;

    // Box group
    const boxGroup = new THREE.Group();
    scene.add(boxGroup);

    // Box body
    const boxW = 1.4, boxH = 0.7, boxD = 1.0;
    const boxGeo = new THREE.BoxGeometry(boxW, boxH, boxD);
    const boxBody = new THREE.Mesh(boxGeo, darkMaterial);
    boxBody.castShadow = true;
    boxBody.receiveShadow = true;
    boxGroup.add(boxBody);

    // Gold edge trim on box
    function createEdgeLine(start: THREE.Vector3, end: THREE.Vector3, thickness = 0.012) {
      const dir = new THREE.Vector3().subVectors(end, start);
      const len = dir.length();
      const geo = new THREE.CylinderGeometry(thickness, thickness, len, 6);
      const mesh = new THREE.Mesh(geo, goldEdgeMaterial);
      mesh.position.copy(start).add(dir.multiplyScalar(0.5));
      mesh.lookAt(end);
      mesh.rotateX(Math.PI / 2);
      return mesh;
    }

    const hw = boxW / 2, hh = boxH / 2, hd = boxD / 2;
    const edges: [number[], number[]][] = [
      [[-hw, hh, -hd], [hw, hh, -hd]], [[hw, hh, -hd], [hw, hh, hd]],
      [[hw, hh, hd], [-hw, hh, hd]], [[-hw, hh, hd], [-hw, hh, -hd]],
      [[-hw, -hh, -hd], [hw, -hh, -hd]], [[hw, -hh, -hd], [hw, -hh, hd]],
      [[hw, -hh, hd], [-hw, -hh, hd]], [[-hw, -hh, hd], [-hw, -hh, -hd]],
      [[-hw, -hh, -hd], [-hw, hh, -hd]], [[hw, -hh, -hd], [hw, hh, -hd]],
      [[hw, -hh, hd], [hw, hh, hd]], [[-hw, -hh, hd], [hw, hh, hd]]
    ];
    edges.forEach(([s, e]) => {
      boxGroup.add(createEdgeLine(
        new THREE.Vector3(s[0], s[1], s[2]),
        new THREE.Vector3(e[0], e[1], e[2])
      ));
    });

    // Logo on box front — "L" monogram
    const logoGroup = new THREE.Group();
    const barH = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.02, 0.02),
      goldEdgeMaterial
    );
    barH.position.set(0.05, -0.1, 0);
    logoGroup.add(barH);

    const barV = new THREE.Mesh(
      new THREE.BoxGeometry(0.02, 0.25, 0.02),
      goldEdgeMaterial
    );
    barV.position.set(-0.07, 0.015, 0);
    logoGroup.add(barV);

    const dotMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 16, 16),
      goldMaterial
    );
    dotMesh.position.set(0.2, 0.015, 0);
    logoGroup.add(dotMesh);

    logoGroup.position.set(0, 0, boxD / 2 + 0.011);
    boxGroup.add(logoGroup);

    // Lid
    const lidGroup = new THREE.Group();
    const lidGeo = new THREE.BoxGeometry(boxW + 0.04, 0.06, boxD + 0.04);
    const lid = new THREE.Mesh(lidGeo, darkMaterial);
    lid.castShadow = true;
    lidGroup.add(lid);

    // Lid gold trim
    const lw = (boxW + 0.04) / 2, lh = 0.03, ld = (boxD + 0.04) / 2;
    const lidEdges: [number[], number[]][] = [
      [[-lw, lh, -ld], [lw, lh, -ld]], [[lw, lh, -ld], [lw, lh, ld]],
      [[lw, lh, ld], [-lw, lh, ld]], [[-lw, lh, ld], [-lw, lh, -ld]],
      [[-lw, -lh, -ld], [lw, -lh, -ld]], [[lw, -lh, -ld], [lw, -lh, ld]],
      [[lw, -lh, ld], [-lw, -lh, ld]], [[-lw, -lh, ld], [-lw, -lh, -ld]],
    ];
    lidEdges.forEach(([s, e]) => {
      lidGroup.add(createEdgeLine(
        new THREE.Vector3(s[0], s[1], s[2]),
        new THREE.Vector3(e[0], e[1], e[2]), 0.008
      ));
    });

    lidGroup.position.set(0, boxH / 2 + 0.03, 0);

    // Pivot for lid opening
    const lidPivot = new THREE.Group();
    lidPivot.position.set(0, boxH / 2 + 0.03, -boxD / 2);
    lidPivot.add(lidGroup);
    lidGroup.position.set(0, 0, boxD / 2);
    boxGroup.add(lidPivot);

    // Floating products
    const productsGroup = new THREE.Group();
    scene.add(productsGroup);

    // Perfume bottle
    function createPerfume() {
      const group = new THREE.Group();
      const bodyGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.35, 32);
      const bodyMat = new THREE.MeshPhysicalMaterial({
        color: 0xd4a856,
        metalness: 0.2,
        roughness: 0.05,
        transmission: 0.6,
        thickness: 0.5,
        ior: 1.5,
        envMap: cubeRenderTarget.texture
      });
      group.add(new THREE.Mesh(bodyGeo, bodyMat));

      const neckGeo = new THREE.CylinderGeometry(0.035, 0.05, 0.1, 16);
      const neck = new THREE.Mesh(neckGeo, goldMaterial);
      neck.position.y = 0.225;
      group.add(neck);

      const capGeo = new THREE.BoxGeometry(0.08, 0.06, 0.08);
      const cap = new THREE.Mesh(capGeo, goldMaterial);
      cap.position.y = 0.305;
      group.add(cap);

      group.scale.setScalar(0.8);
      return group;
    }

    // Sunglasses
    function createSunglasses() {
      const group = new THREE.Group();
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x111118,
        metalness: 0.1,
        roughness: 0.1,
        clearcoat: 1.0,
        envMap: cubeRenderTarget.texture
      });

      // Lenses
      const lensGeo = new THREE.TorusGeometry(0.1, 0.015, 8, 32);
      const lensL = new THREE.Mesh(lensGeo, goldEdgeMaterial);
      lensL.position.x = -0.13;
      lensL.rotation.y = Math.PI / 2;
      group.add(lensL);

      const lensR = lensL.clone();
      lensR.position.x = 0.13;
      group.add(lensR);

      // Lens fills
      const fillGeo = new THREE.CircleGeometry(0.095, 32);
      const fillL = new THREE.Mesh(fillGeo, glassMat);
      fillL.position.set(-0.13, 0, 0);
      group.add(fillL);
      const fillR = fillL.clone();
      fillR.position.x = 0.13;
      group.add(fillR);

      // Bridge
      const bridgeGeo = new THREE.TorusGeometry(0.04, 0.008, 8, 16, Math.PI);
      const bridge = new THREE.Mesh(bridgeGeo, goldEdgeMaterial);
      bridge.position.set(0, 0.05, 0);
      bridge.rotation.z = Math.PI;
      group.add(bridge);

      // Arms
      const armGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.25, 6);
      const armL = new THREE.Mesh(armGeo, goldEdgeMaterial);
      armL.position.set(-0.23, 0, -0.1);
      armL.rotation.x = Math.PI / 2 - 0.3;
      group.add(armL);
      const armR = armL.clone();
      armR.position.x = 0.23;
      group.add(armR);

      group.scale.setScalar(1.0);
      return group;
    }

    // Watch
    function createWatch() {
      const group = new THREE.Group();

      // Case
      const caseGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 48);
      const caseMesh = new THREE.Mesh(caseGeo, goldMaterial);
      caseMesh.rotation.x = Math.PI / 2;
      group.add(caseMesh);

      // Bezel
      const bezelGeo = new THREE.TorusGeometry(0.14, 0.012, 8, 48);
      const bezel = new THREE.Mesh(bezelGeo, goldMaterial);
      group.add(bezel);

      // Face
      const faceGeo = new THREE.CircleGeometry(0.12, 48);
      const faceMat = new THREE.MeshPhysicalMaterial({
        color: 0x0a0a14,
        metalness: 0.5,
        roughness: 0.2,
        envMap: cubeRenderTarget.texture
      });
      const face = new THREE.Mesh(faceGeo, faceMat);
      face.position.z = 0.021;
      group.add(face);

      // Hour markers
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const markerGeo = new THREE.BoxGeometry(0.008, 0.02, 0.003);
        const marker = new THREE.Mesh(markerGeo, goldEdgeMaterial);
        marker.position.set(
          Math.sin(angle) * 0.1,
          Math.cos(angle) * 0.1,
          0.023
        );
        marker.rotation.z = -angle;
        group.add(marker);
      }

      // Hands
      const handGeo = new THREE.BoxGeometry(0.005, 0.07, 0.003);
      const hourHand = new THREE.Mesh(handGeo, goldEdgeMaterial);
      hourHand.position.set(0, 0.03, 0.024);
      hourHand.rotation.z = -0.8;
      group.add(hourHand);

      const minGeo = new THREE.BoxGeometry(0.003, 0.09, 0.003);
      const minHand = new THREE.Mesh(minGeo, goldEdgeMaterial);
      minHand.position.set(0, 0.04, 0.025);
      minHand.rotation.z = 0.4;
      group.add(minHand);

      // Crown
      const crownGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.03, 12);
      const crown = new THREE.Mesh(crownGeo, goldMaterial);
      crown.position.set(0.16, 0, 0);
      crown.rotation.z = Math.PI / 2;
      group.add(crown);

      // Strap segments
      const strapMat = new THREE.MeshPhysicalMaterial({
        color: 0x1a1a24,
        metalness: 0.0,
        roughness: 0.6
      });
      const strapGeo = new THREE.BoxGeometry(0.1, 0.25, 0.015);
      const strapTop = new THREE.Mesh(strapGeo, strapMat);
      strapTop.position.set(0, 0.24, 0);
      group.add(strapTop);
      const strapBot = strapTop.clone();
      strapBot.position.y = -0.24;
      group.add(strapBot);

      group.scale.setScalar(0.7);
      return group;
    }

    const perfume = createPerfume();
    const sunglasses = createSunglasses();
    const watch = createWatch();

    productsGroup.add(perfume);
    productsGroup.add(sunglasses);
    productsGroup.add(watch);

    // Initial position: hidden inside box
    perfume.position.set(0, 0, 0);
    sunglasses.position.set(0, 0, 0);
    watch.position.set(0, 0, 0);
    perfume.scale.setScalar(0);
    sunglasses.scale.setScalar(0);
    watch.scale.setScalar(0);

    // Golden particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 600;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleOffsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 0;
      particlePositions[i * 3 + 1] = 0;
      particlePositions[i * 3 + 2] = 0;
      particleSpeeds[i] = 0.5 + Math.random() * 2;
      particleOffsets[i] = Math.random() * Math.PI * 2;
    }

    particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xd4a856,
      size: 0.015,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Box-specific ambient particles
    const boxParticlesGeometry = new THREE.BufferGeometry();
    const boxParticleCount = 250;
    const boxParticlePositions = new Float32Array(boxParticleCount * 3);
    const boxParticleSpeeds = new Float32Array(boxParticleCount);
    const boxParticleOffsets = new Float32Array(boxParticleCount * 3);

    for (let i = 0; i < boxParticleCount; i++) {
      boxParticleSpeeds[i] = 0.1 + Math.random() * 0.3;
      boxParticleOffsets[i * 3] = Math.random() * Math.PI * 2;
      boxParticleOffsets[i * 3 + 1] = Math.random() * Math.PI * 2;
      boxParticleOffsets[i * 3 + 2] = Math.random() * Math.PI * 2;
    }

    boxParticlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(boxParticlePositions, 3));

    const boxParticlesMaterial = new THREE.PointsMaterial({
      color: 0xd4a856,
      size: 0.025,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });

    const boxParticles = new THREE.Points(boxParticlesGeometry, boxParticlesMaterial);
    boxGroup.add(boxParticles);

    // Starfield
    const starsGeometry2 = new THREE.BufferGeometry();
    const starsVertices = [];
    const starsColors = [];
    for (let i = 0; i < 8000; i++) {
      const x = (Math.random() - 0.5) * 200;
      const y = (Math.random() - 0.5) * 200;
      const z = (Math.random() - 0.5) * 200;
      starsVertices.push(x, y, z);
      const color = new THREE.Color();
      color.setHSL(0.1 + Math.random() * 0.1, 0.3, 0.6 + Math.random() * 0.4);
      starsColors.push(color.r, color.g, color.b);
    }
    const starsPositionArray = new Float32Array(starsVertices);
    const starsColorArray = new Float32Array(starsColors);
    starsGeometry2.setAttribute('position', new THREE.Float32BufferAttribute(starsPositionArray, 3));
    starsGeometry2.setAttribute('color', new THREE.Float32BufferAttribute(starsColorArray, 3));

    const starsMaterial2 = new THREE.PointsMaterial({
      size: 0.08,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });
    const stars = new THREE.Points(starsGeometry2, starsMaterial2);
    scene.add(stars);

    // Volumetric light rays (simple cones)
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0xd4a856,
      transparent: true,
      opacity: 0.015,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    for (let i = 0; i < 5; i++) {
      const rayGeo = new THREE.ConeGeometry(0.8 + Math.random() * 0.5, 8, 4, 1, true);
      const ray = new THREE.Mesh(rayGeo, rayMat.clone());
      ray.position.set(
        (Math.random() - 0.5) * 3,
        4,
        (Math.random() - 0.5) * 2
      );
      ray.rotation.x = Math.PI + (Math.random() - 0.5) * 0.3;
      ray.rotation.z = (Math.random() - 0.5) * 0.4;
      ray.material.opacity = 0.008 + Math.random() * 0.015;
      scene.add(ray);
    }

    // Ground reflection plane
    const groundGeo = new THREE.PlaneGeometry(20, 20);
    const groundMat = new THREE.MeshPhysicalMaterial({
      color: 0x08080c,
      metalness: 0.8,
      roughness: 0.3,
      envMap: cubeRenderTarget.texture,
      envMapIntensity: 0.3
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Animation timeline
    const LOOP_DURATION = 10;
    let time = 0;
    let textHidden = true;

    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function easeOutExpo(t: number) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function smoothstep(a: number, b: number, t: number) {
      t = Math.max(0, Math.min(1, (t - a) / (b - a)));
      return t * t * (3 - 2 * t);
    }

    function animate() {
      requestAnimationFrame(animate);

      const delta = 1 / 60;
      time += delta;

      const loopTime = time % LOOP_DURATION;
      const t = loopTime / LOOP_DURATION;

      // Box floating
      const floatY = Math.sin(time * 0.8) * 0.05;
      boxGroup.position.y = floatY;
      boxGroup.rotation.y = time * 0.15;

      // Box appearance
      const boxAppear = smoothstep(0.02, 0.12, t);
      boxGroup.scale.setScalar(boxAppear);

      // Lid opening
      const lidOpenStart = 0.15;
      const lidOpenEnd = 0.35;
      const lidAngle = smoothstep(lidOpenStart, lidOpenEnd, t) * -Math.PI * 0.7;
      lidPivot.rotation.x = lidAngle;

      // Products emergence
      const prodStart = 0.3;
      const prodEnd = 0.5;
      const prodT = smoothstep(prodStart, prodEnd, t);

      const orbitRadius = 1.2 + Math.sin(time * 0.3) * 0.1;
      const orbitSpeed = time * 0.4;

      // Perfume
      const pScale = easeOutExpo(prodT) * 0.8;
      perfume.scale.setScalar(pScale);
      perfume.position.set(
        Math.sin(orbitSpeed) * orbitRadius,
        0.3 + Math.sin(time * 1.2) * 0.15,
        Math.cos(orbitSpeed) * orbitRadius * 0.6
      );
      perfume.rotation.y = time * 0.5;

      // Sunglasses
      const sScale = easeOutExpo(Math.max(0, prodT - 0.1) / 0.9) * 1.0;
      sunglasses.scale.setScalar(sScale);
      sunglasses.position.set(
        Math.sin(orbitSpeed + Math.PI * 2 / 3) * orbitRadius,
        0.1 + Math.sin(time * 1.0 + 1) * 0.12,
        Math.cos(orbitSpeed + Math.PI * 2 / 3) * orbitRadius * 0.6
      );
      sunglasses.rotation.y = time * 0.3 + 1;
      sunglasses.rotation.x = Math.sin(time * 0.7) * 0.2;

      // Watch
      const wScale = easeOutExpo(Math.max(0, prodT - 0.2) / 0.8) * 0.7;
      watch.scale.setScalar(wScale);
      watch.position.set(
        Math.sin(orbitSpeed + Math.PI * 4 / 3) * orbitRadius,
        -0.1 + Math.sin(time * 0.9 + 2) * 0.12,
        Math.cos(orbitSpeed + Math.PI * 4 / 3) * orbitRadius * 0.6
      );
      watch.rotation.y = time * 0.4;
      watch.rotation.z = Math.sin(time * 0.5) * 0.3;

      // Particles burst on lid open
      const particleBurst = smoothstep(0.25, 0.4, t);
      const particleFade = 1 - smoothstep(0.85, 0.95, t);
      particlesMaterial.opacity = particleBurst * particleFade * 0.6;

      const positions = particlesGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        const speed = particleSpeeds[i];
        const offset = particleOffsets[i];
        const age = Math.max(0, (t - 0.25) * LOOP_DURATION) * speed;
        const radius = age * 0.15;
        const angle = offset + time * speed * 0.3;

        positions[i * 3] = Math.sin(angle) * radius * (0.5 + Math.sin(offset) * 0.5);
        positions[i * 3 + 1] = Math.sin(time * speed + offset) * radius * 0.5 + floatY;
        positions[i * 3 + 2] = Math.cos(angle) * radius * (0.5 + Math.cos(offset) * 0.5);
      }
      particlesGeometry.attributes.position.needsUpdate = true;

      // Box particles drift
      const boxPositions = boxParticlesGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < boxParticleCount; i++) {
        const speed = boxParticleSpeeds[i];
        const offX = boxParticleOffsets[i * 3];
        const offY = boxParticleOffsets[i * 3 + 1];
        const offZ = boxParticleOffsets[i * 3 + 2];
        
        const r = 1.1 + Math.sin(time * speed + offX) * 0.3;
        const theta = offY + time * speed * 0.5;
        const phi = offZ + time * speed * 0.3;

        boxPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        boxPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        boxPositions[i * 3 + 2] = r * Math.cos(phi);
      }
      boxParticlesGeometry.attributes.position.needsUpdate = true;
      
      // Subtle twinkle
      boxParticlesMaterial.opacity = 0.5 + Math.sin(time * 2) * 0.2;

      // Camera dolly zoom
      const dollyStart = 0.5;
      const dollyEnd = 0.75;
      const dollyT = smoothstep(dollyStart, dollyEnd, t);

      if (!controls.enabled) {
        // User is controlling, don't override
      } else {
        const startZ = 6;
        const endZ = 4.5;
        const camZ = startZ + (endZ - startZ) * easeInOutCubic(dollyT);
        camera.position.z += (camZ - camera.position.z) * 0.02;
        camera.position.y += (0.3 + floatY * 0.3 - camera.position.y) * 0.02;
      }

      // Text reveal
      const textT = smoothstep(0.3, 0.4, t);
      const textFade = smoothstep(0.88, 0.95, t);

      if (textT > 0.5 && textHidden) {
        textHidden = false;
        document.getElementById('brandTitle')?.classList.add('visible');
        document.getElementById('tagline')?.classList.add('visible');
        document.getElementById('flare')?.classList.add('visible');
      }

      if (textFade > 0.5 && !textHidden) {
        // Nothing - let CSS handle it
      }

      // Loop reset
      if (t > 0.98) {
        textHidden = true;
        const title = document.getElementById('brandTitle');
        const tag = document.getElementById('tagline');
        const flare = document.getElementById('flare');
        
        if (title) {
          title.classList.remove('visible');
          title.style.transition = 'none';
          title.style.opacity = '0';
        }
        if (tag) {
          tag.classList.remove('visible');
          tag.style.transition = 'none';
          tag.style.opacity = '0';
        }
        if (flare) {
          flare.classList.remove('visible');
          flare.style.transition = 'none';
          flare.style.opacity = '0';
        }

        requestAnimationFrame(() => {
          if (title) {
            title.style.transition = '';
            title.style.opacity = '';
          }
          if (tag) {
            tag.style.transition = '';
            tag.style.opacity = '';
          }
          if (flare) {
            flare.style.transition = '';
            flare.style.opacity = '';
          }
        });
      }

      // Stars subtle drift
      stars.rotation.y = time * 0.003;
      stars.rotation.x = time * 0.001;

      // Star twinkle
      starsMaterial2.opacity = 0.35 + Math.sin(time * 1.5) * 0.15;

      // Rim light subtle animation
      rimLight.intensity = 0.6 + Math.sin(time * 0.7) * 0.2;
      bottomLight.intensity = 0.2 + Math.sin(time * 0.9 + 1) * 0.1;

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[100dvh] bg-[#08080c] overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />
      
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
        <h1 
          id="brandTitle"
          className="font-serif font-light text-brand-gold opacity-0 translate-y-[30px] transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] tracking-[0.35em] uppercase text-[clamp(3rem,8vw,7rem)] mb-[0.2em] drop-shadow-[0_0_60px_rgba(212,168,86,0.3)] [&.visible]:opacity-100 [&.visible]:translate-y-0"
        >
          LuxeDrop
        </h1>
        <p 
          id="tagline"
          className="font-sans font-extralight text-brand-gold/60 opacity-0 translate-y-[20px] transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-[600ms] tracking-[0.6em] uppercase text-[clamp(0.7rem,1.5vw,1.1rem)] [&.visible]:opacity-100 [&.visible]:translate-y-0"
        >
          Premium. Delivered.
        </p>
      </div>

      <div 
        id="flare"
        className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 w-[2px] h-[2px] bg-[radial-gradient(circle,rgba(212,168,86,0.8)_0%,transparent_70%)] rounded-full pointer-events-none z-[5] opacity-0 transition-all duration-[1500ms] ease-[cubic-bezier(0.16,1,0.3,1)] delay-[1200ms] [&.visible]:w-[min(400px,80vw)] [&.visible]:h-[4px] [&.visible]:opacity-100"
      />

      <div className="absolute top-8 left-8 font-sans font-extralight text-[0.65rem] tracking-[0.3em] uppercase text-brand-gold/25 z-[11] pointer-events-none">
        Est. 2026
      </div>
      <div className="absolute bottom-8 right-8 font-sans font-extralight text-[0.65rem] tracking-[0.3em] uppercase text-brand-gold/25 z-[11] pointer-events-none">
        Luxury Redefined
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        onClick={() => document.getElementById('simulation-section')?.scrollIntoView({ behavior: 'smooth' })}
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-50 cursor-pointer hover:opacity-100 transition-opacity"
      >
        <span className="text-[10px] uppercase tracking-widest text-brand-gold/60">Scroll</span>
        <div className="w-[1px] h-12 bg-brand-gold/20 relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, 48] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute top-0 left-0 w-full h-4 bg-brand-gold"
          />
        </div>
      </motion.div>
    </div>
  );
}
