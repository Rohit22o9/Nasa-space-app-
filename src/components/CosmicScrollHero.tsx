import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Sparkles, 
  Rocket, 
  Globe, 
  Satellite, 
  Radio, 
  Compass, 
  ChevronDown, 
  ShieldCheck, 
  Layers 
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface Props {
  onEnterLab: () => void;
}

// Procedural texture generators for planets & rings
function createEarthCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Deep ocean gradient
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#0a2342');
  oceanGrad.addColorStop(0.5, '#0d3b66');
  oceanGrad.addColorStop(1, '#0a2342');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Continents (procedural organic shapes)
  ctx.fillStyle = '#2d6a4f';
  // North America
  ctx.beginPath();
  ctx.ellipse(280, 170, 110, 65, -0.2, 0, Math.PI * 2);
  ctx.fill();
  // South America
  ctx.beginPath();
  ctx.ellipse(340, 330, 65, 110, 0.25, 0, Math.PI * 2);
  ctx.fill();
  // Eurasia
  ctx.beginPath();
  ctx.ellipse(650, 160, 180, 80, 0.1, 0, Math.PI * 2);
  ctx.fill();
  // Africa
  ctx.beginPath();
  ctx.ellipse(540, 270, 85, 105, 0, 0, Math.PI * 2);
  ctx.fill();
  // Australia
  ctx.beginPath();
  ctx.ellipse(820, 360, 60, 45, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Ice caps (North & South poles)
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(0, 0, 1024, 30);
  ctx.fillRect(0, 485, 1024, 27);

  // Soft atmospheric cloud swirls
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 1024;
    const y = 80 + Math.random() * 340;
    const r = 25 + Math.random() * 50;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.3, Math.random() * 0.5 - 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas;
}

function createMarsCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#c1440e';
  ctx.fillRect(0, 0, 512, 256);

  // Darker basaltic maria
  ctx.fillStyle = '#7f2e0a';
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 512, 60 + Math.random() * 140, 20 + Math.random() * 45, 0, Math.PI * 2);
    ctx.fill();
  }

  // White polar ice caps
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 18);
  ctx.fillRect(0, 240, 512, 16);

  return canvas;
}

function createJupiterCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const colors = ['#c89666', '#e0b589', '#965a38', '#dfc4a2', '#a66b44', '#f1e2c9', '#b3774d'];
  const bandHeight = 256 / colors.length;
  colors.forEach((col, idx) => {
    ctx.fillStyle = col;
    ctx.fillRect(0, idx * bandHeight, 512, bandHeight);
  });

  // Great Red Spot
  ctx.fillStyle = '#b93b20';
  ctx.beginPath();
  ctx.ellipse(320, 160, 42, 22, -0.1, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

function createSaturnRingCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0.0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.15, 'rgba(215, 185, 142, 0.75)');
  grad.addColorStop(0.45, 'rgba(180, 150, 110, 0.9)');
  grad.addColorStop(0.60, 'rgba(0,0,0,0.1)'); // Cassini Division!
  grad.addColorStop(0.70, 'rgba(200, 175, 135, 0.85)');
  grad.addColorStop(0.95, 'rgba(170, 140, 100, 0.4)');
  grad.addColorStop(1.0, 'rgba(0,0,0,0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 64);
  return canvas;
}

export const CosmicScrollHero: React.FC<Props> = ({ onEnterLab }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHolderRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Spacecraft & Planet Refs for animation
  const earthGroupRef = useRef<THREE.Group | null>(null);
  const issRef = useRef<THREE.Group | null>(null);
  const jwstRef = useRef<THREE.Group | null>(null);
  const marsRef = useRef<THREE.Mesh | null>(null);
  const saturnGroupRef = useRef<THREE.Group | null>(null);
  const moonRef = useRef<THREE.Mesh | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const commBeamRef = useRef<THREE.Line | null>(null);

  useEffect(() => {
    if (!canvasHolderRef.current) return;

    const width = canvasHolderRef.current.clientWidth;
    const height = canvasHolderRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.5, 24);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    canvasHolderRef.current.appendChild(renderer.domElement);

    // 1. LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    sunLight.position.set(20, 8, 15);
    scene.add(sunLight);

    const deepSpaceRimLight = new THREE.DirectionalLight(0x00e5ff, 0.8);
    deepSpaceRimLight.position.set(-15, -6, -10);
    scene.add(deepSpaceRimLight);

    // 2. MULTI-COLOR COSMIC STARFIELD & NEBULA PARTICLES
    const starCount = 2000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 120;
      starPos[i + 1] = (Math.random() - 0.5) * 90;
      starPos[i + 2] = (Math.random() - 0.5) * 140;

      // Color tints: White, Sky Blue, Cyan, Golden Amber
      const rnd = Math.random();
      if (rnd < 0.5) {
        starCols[i] = 1.0; starCols[i + 1] = 1.0; starCols[i + 2] = 1.0;
      } else if (rnd < 0.8) {
        starCols[i] = 0.4; starCols[i + 1] = 0.85; starCols[i + 2] = 1.0; // Cyan/Blue
      } else {
        starCols[i] = 1.0; starCols[i + 1] = 0.8; starCols[i + 2] = 0.4; // Amber
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.16,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    starsRef.current = stars;

    // Glowing Nebula Dust Cloud
    const nebulaGeo = new THREE.BufferGeometry();
    const nebulaCount = 400;
    const nebulaPos = new Float32Array(nebulaCount * 3);
    const nebulaCols = new Float32Array(nebulaCount * 3);
    for (let i = 0; i < nebulaCount * 3; i += 3) {
      nebulaPos[i] = -25 + (Math.random() - 0.5) * 35;
      nebulaPos[i + 1] = 10 + (Math.random() - 0.5) * 25;
      nebulaPos[i + 2] = -15 + (Math.random() - 0.5) * 40;
      nebulaCols[i] = 0.5 + Math.random() * 0.4;     // Magenta / Purple
      nebulaCols[i + 1] = 0.1 + Math.random() * 0.2;
      nebulaCols[i + 2] = 0.8 + Math.random() * 0.2;
    }
    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPos, 3));
    nebulaGeo.setAttribute('color', new THREE.BufferAttribute(nebulaCols, 3));
    const nebulaMat = new THREE.PointsMaterial({
      size: 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const nebula = new THREE.Points(nebulaGeo, nebulaMat);
    scene.add(nebula);

    // 3. EARTH & MOON SYSTEM (Center / Left Foreground)
    const earthGroup = new THREE.Group();
    earthGroup.position.set(-2.0, -1.5, 6);

    const earthTexture = new THREE.CanvasTexture(createEarthCanvas());
    const earthGeo = new THREE.SphereGeometry(3.6, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.6,
      metalness: 0.1
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);

    // Atmospheric Blue Glow Halo
    const atmoGeo = new THREE.SphereGeometry(3.78, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide
    });
    const atmo = new THREE.Mesh(atmoGeo, atmoMat);
    earthGroup.add(atmo);

    // The Moon Orbiting Earth
    const moonGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.9,
      metalness: 0.05
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(7.5, 2.2, -2.5);
    earthGroup.add(moon);
    moonRef.current = moon;

    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // 4. SATURN WITH RINGS (Upper Right Deep Space)
    const saturnGroup = new THREE.Group();
    saturnGroup.position.set(13.5, 7.0, -12);
    saturnGroup.rotation.z = 0.35;
    saturnGroup.rotation.x = 0.2;

    const saturnGeo = new THREE.SphereGeometry(2.4, 32, 32);
    const saturnMat = new THREE.MeshStandardMaterial({
      color: 0xe2c696,
      roughness: 0.7
    });
    const saturn = new THREE.Mesh(saturnGeo, saturnMat);
    saturnGroup.add(saturn);

    // Saturn Rings Geometry (RingGeometry with double side)
    const ringGeo = new THREE.RingGeometry(3.0, 5.8, 64);
    const ringTexture = new THREE.CanvasTexture(createSaturnRingCanvas());
    const ringMat = new THREE.MeshBasicMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    saturnGroup.add(ring);

    scene.add(saturnGroup);
    saturnGroupRef.current = saturnGroup;

    // 5. MARS (Red Planet in Middle Distance)
    const marsTexture = new THREE.CanvasTexture(createMarsCanvas());
    const marsGeo = new THREE.SphereGeometry(1.6, 32, 32);
    const marsMat = new THREE.MeshStandardMaterial({
      map: marsTexture,
      roughness: 0.8
    });
    const mars = new THREE.Mesh(marsGeo, marsMat);
    mars.position.set(10.0, -3.5, 1);
    scene.add(mars);
    marsRef.current = mars;

    // 6. DETAILED SATELLITES IN ORBIT

    // A. INTERNATIONAL SPACE STATION (ISS) STYLE STATION
    const issGroup = new THREE.Group();
    issGroup.position.set(2.4, 3.2, 11);

    // Central pressurized cylinder module
    const moduleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.3 });
    const goldFoilMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
    const solarCellMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 });

    const habGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.2, 16);
    const hab = new THREE.Mesh(habGeo, moduleMat);
    hab.rotation.z = Math.PI / 2;
    issGroup.add(hab);

    // Main structural truss
    const trussGeo = new THREE.BoxGeometry(0.08, 2.6, 0.08);
    const truss = new THREE.Mesh(trussGeo, moduleMat);
    truss.position.set(0, 0, 0);
    issGroup.add(truss);

    // 4 Large Solar Array Wings
    [-1.0, 1.0].forEach(yPos => {
      [-1, 1].forEach(xDir => {
        const wingGeo = new THREE.BoxGeometry(0.8, 0.35, 0.02);
        const wing = new THREE.Mesh(wingGeo, solarCellMat);
        wing.position.set(xDir * 0.55, yPos, 0);
        issGroup.add(wing);
      });
    });

    // Communication dish on station
    const issDishGeo = new THREE.SphereGeometry(0.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3);
    const issDish = new THREE.Mesh(issDishGeo, goldFoilMat);
    issDish.rotation.x = Math.PI;
    issDish.position.set(0, -0.2, 0.25);
    issGroup.add(issDish);

    scene.add(issGroup);
    issRef.current = issGroup;

    // B. JAMES WEBB SPACE TELESCOPE (JWST) IN DEEP SPACE
    const jwstGroup = new THREE.Group();
    jwstGroup.position.set(-7.5, 4.5, 3);
    jwstGroup.scale.set(0.8, 0.8, 0.8);

    // 5-Layer Pink/Silver Sunshield (Kite shape)
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.2);
    shieldShape.lineTo(0.7, 0);
    shieldShape.lineTo(0, -1.2);
    shieldShape.lineTo(-0.7, 0);
    shieldShape.closePath();
    const shieldGeo = new THREE.ShapeGeometry(shieldShape);
    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      metalness: 0.8,
      roughness: 0.3,
      side: THREE.DoubleSide
    });
    const shield = new THREE.Mesh(shieldGeo, shieldMat);
    shield.rotation.x = Math.PI / 3;
    jwstGroup.add(shield);

    // Golden Hexagonal Primary Mirror Array
    const mirrorGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.04, 6);
    const mirrorMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.95,
      roughness: 0.1
    });
    const mirror = new THREE.Mesh(mirrorGeo, mirrorMat);
    mirror.position.set(0, 0.25, 0.1);
    mirror.rotation.x = Math.PI / 3;
    jwstGroup.add(mirror);

    scene.add(jwstGroup);
    jwstRef.current = jwstGroup;

    // 7. GLOWING COMMUNICATION LASER BEAM
    const commGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(2.4, 3.2, 11), // ISS Station
      new THREE.Vector3(-2.0, -1.5, 6) // Earth
    ]);
    const commMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.75,
      linewidth: 2
    });
    const commLine = new THREE.Line(commGeo, commMat);
    scene.add(commLine);
    commBeamRef.current = commLine;

    // 8. ANIMATION LOOP
    let animId: number;
    let clock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.008;

      // Rotate planets smoothly
      if (earthGroupRef.current) {
        earthGroupRef.current.children[0].rotation.y += 0.002;
      }
      if (marsRef.current) {
        marsRef.current.rotation.y += 0.0025;
      }
      if (saturnGroupRef.current) {
        saturnGroupRef.current.rotation.y += 0.0015;
      }

      // Moon orbits Earth
      if (moonRef.current) {
        const moonAngle = clock * 0.4;
        moonRef.current.position.x = Math.cos(moonAngle) * 7.5;
        moonRef.current.position.z = Math.sin(moonAngle) * 7.5;
      }

      // Spacecraft floating & gentle telemetry wobble
      if (issRef.current) {
        issRef.current.rotation.y += 0.003;
        issRef.current.rotation.x = Math.sin(clock * 0.8) * 0.05;
        issRef.current.position.y = 3.2 + Math.sin(clock * 1.2) * 0.12;
      }

      if (jwstRef.current) {
        jwstRef.current.rotation.y += 0.002;
        jwstRef.current.position.y = 4.5 + Math.cos(clock * 0.9) * 0.15;
      }

      // Update Comms Beam pulse
      if (commBeamRef.current && issRef.current && earthGroupRef.current) {
        const positions = new Float32Array([
          issRef.current.position.x, issRef.current.position.y, issRef.current.position.z,
          earthGroupRef.current.position.x + 1.2, earthGroupRef.current.position.y + 1.5, earthGroupRef.current.position.z
        ]);
        commBeamRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = commBeamRef.current.material as THREE.LineBasicMaterial;
        mat.opacity = 0.4 + Math.sin(clock * 6) * 0.35; // Pulsing communication signal!
      }

      // Stars slow cosmic rotation
      if (starsRef.current) {
        starsRef.current.rotation.y = clock * 0.01;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvasHolderRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = canvasHolderRef.current.clientWidth;
      const h = canvasHolderRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
    };
  }, []);

  // Scroll interpolation for camera zooming
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScroll = containerRef.current.scrollHeight - window.innerHeight;
      const currentScroll = Math.max(0, -rect.top);
      const progress = Math.min(1.0, Math.max(0, currentScroll / Math.max(1, totalScroll)));
      setScrollProgress(progress);

      if (cameraRef.current) {
        // Zoom from deep overview (z: 24) down towards Earth & ISS (z: 11)
        cameraRef.current.position.z = 24 - (progress * 13);
        cameraRef.current.position.y = 1.5 - (progress * 1.0);
        cameraRef.current.position.x = progress * 1.2;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToCards = () => {
    soundFx.playQuindarBeep('intro');
    onEnterLab();
  };

  return (
    <div ref={containerRef} className="relative w-full h-[180vh]">
      
      {/* Sticky 3D WebGL Canvas Layer (Full Screen Background) */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden z-0">
        <div ref={canvasHolderRef} className="w-full h-full" />
        {/* Soft edge gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070B19] via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Floating Interactive Foreground UI */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 -mt-[180vh]">
        
        {/* STAGE 1: HERO OVERVIEW */}
        <div className="min-h-screen flex flex-col justify-between py-12">
          
          {/* Top HUD Telemetry Pill Streamers */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            
            {/* Left Telemetry Card */}
            <div className="bg-[#070B19]/85 backdrop-blur-md p-3 rounded-2xl border border-cyan-500/30 text-xs font-mono shadow-[0_0_20px_rgba(0,229,255,0.15)] flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div>
                <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                  ISS FLIGHT TELEMETRY
                </div>
                <div className="text-slate-300 text-[11px]">
                  Altitude: 408 km • Speed: 7.66 km/s • DSN Active
                </div>
              </div>
            </div>

            {/* Right Target Card */}
            <div className="bg-[#070B19]/85 backdrop-blur-md p-3 rounded-2xl border border-amber-500/30 text-xs font-mono shadow-[0_0_20px_rgba(245,158,11,0.15)] flex items-center gap-3">
              <div>
                <div className="text-amber-400 font-bold flex items-center gap-1.5 justify-end">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  SOLAR SYSTEM EXPLORATION
                </div>
                <div className="text-slate-300 text-[11px]">
                  Targets: 🌙 Moon • 🔴 Mars • 🪐 Saturn • 🧊 Europa
                </div>
              </div>
            </div>

          </div>

          {/* Center Epic Title & Action Buttons */}
          <div className="text-center space-y-4 max-w-3xl mx-auto my-auto py-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-sky-300 text-xs font-mono shadow-md backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>NASA MISSION DESIGN LAB • CONCURRENT ENGINEERING</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight drop-shadow-xl">
              EXPLORE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">COSMOS</span>
            </h1>

            <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto leading-relaxed drop-shadow">
              Design spacecraft, balance mass, power, and budget constraints, and simulate complete space missions from launch to planetary discovery.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
              <button
                onClick={scrollToCards}
                className="btn-nasa-primary px-8 py-3.5 rounded-xl text-base font-bold flex items-center gap-2.5 shadow-xl cursor-pointer group"
              >
                <Rocket className="w-5 h-5 text-cyan-300" />
                <span>BUILD YOUR SPACECRAFT</span>
                <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  scrollToCards();
                }}
                className="px-6 py-3.5 rounded-xl bg-[#0E172F]/80 hover:bg-[#16254c] border border-white/10 text-white font-medium text-sm transition backdrop-blur-md"
              >
                Explore Destinations
              </button>
            </div>
          </div>

          {/* Bottom Scroll Prompt */}
          <div 
            onClick={scrollToCards}
            className="flex flex-col items-center gap-1.5 cursor-pointer pb-2 group mx-auto"
          >
            <span className="text-[11px] font-mono text-cyan-400 tracking-wider uppercase group-hover:text-white transition">
              Scroll down to choose destination
            </span>
            <div className="w-5 h-8 rounded-full border border-cyan-400/60 flex justify-center p-1">
              <div className="w-1 h-2 rounded-full bg-cyan-400 animate-bounce" />
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
