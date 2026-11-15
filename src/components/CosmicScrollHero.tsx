import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  Sparkles, 
  Rocket, 
  Globe, 
  Satellite, 
  ChevronDown, 
  BookOpen,
  Compass
} from 'lucide-react';
import { soundFx } from '../utils/audio';

interface Props {
  onEnterLab: () => void;
  onOpenGuide: () => void;
}

// Procedural texture generators for planets & rings
function createEarthCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const oceanGrad = ctx.createLinearGradient(0, 0, 0, 512);
  oceanGrad.addColorStop(0, '#0a2342');
  oceanGrad.addColorStop(0.5, '#0d3b66');
  oceanGrad.addColorStop(1, '#0a2342');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, 1024, 512);

  // Continents
  ctx.fillStyle = '#2d6a4f';
  ctx.beginPath(); ctx.ellipse(280, 170, 110, 65, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(340, 330, 65, 110, 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(650, 160, 180, 80, 0.1, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(540, 270, 85, 105, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(820, 360, 60, 45, 0.2, 0, Math.PI * 2); ctx.fill();

  // Ice caps
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(0, 0, 1024, 30);
  ctx.fillRect(0, 485, 1024, 27);

  // Clouds
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

  ctx.fillStyle = '#7f2e0a';
  for (let i = 0; i < 15; i++) {
    ctx.beginPath();
    ctx.arc(Math.random() * 512, 60 + Math.random() * 140, 20 + Math.random() * 45, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 18);
  ctx.fillRect(0, 240, 512, 16);

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
  grad.addColorStop(0.60, 'rgba(0,0,0,0.1)'); // Cassini Division
  grad.addColorStop(0.70, 'rgba(200, 175, 135, 0.85)');
  grad.addColorStop(0.95, 'rgba(170, 140, 100, 0.4)');
  grad.addColorStop(1.0, 'rgba(0,0,0,0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 64);
  return canvas;
}

export const CosmicScrollHero: React.FC<Props> = ({ onEnterLab, onOpenGuide }) => {
  const canvasHolderRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const earthGroupRef = useRef<THREE.Group | null>(null);
  const issRef = useRef<THREE.Group | null>(null);
  const jwstRef = useRef<THREE.Group | null>(null);
  const marsRef = useRef<THREE.Mesh | null>(null);
  const saturnGroupRef = useRef<THREE.Group | null>(null);
  const moonRef = useRef<THREE.Mesh | null>(null);
  const commBeamRef = useRef<THREE.Line | null>(null);

  useEffect(() => {
    if (!canvasHolderRef.current) return;

    const width = canvasHolderRef.current.clientWidth;
    const height = canvasHolderRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // STARTING CAMERA POSITION: Exactly matches the user's uploaded framing!
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0.5, 0.8, 14.2);
    camera.lookAt(0.2, 0.1, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    canvasHolderRef.current.appendChild(renderer.domElement);

    // 1. LIGHTS
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    sunLight.position.set(20, 8, 15);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00e5ff, 0.6);
    rimLight.position.set(-15, -6, -10);
    scene.add(rimLight);

    // 2. STARS
    const starCount = 1800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 110;
      starPos[i + 1] = (Math.random() - 0.5) * 80;
      starPos[i + 2] = (Math.random() - 0.5) * 120;

      const rnd = Math.random();
      if (rnd < 0.55) {
        starCols[i] = 1.0; starCols[i + 1] = 1.0; starCols[i + 2] = 1.0;
      } else if (rnd < 0.85) {
        starCols[i] = 0.4; starCols[i + 1] = 0.85; starCols[i + 2] = 1.0;
      } else {
        starCols[i] = 1.0; starCols[i + 1] = 0.8; starCols[i + 2] = 0.4;
      }
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCols, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 3. EARTH & MOON SYSTEM
    const earthGroup = new THREE.Group();
    earthGroup.position.set(-1.8, -2.4, 5.0);

    const earthTexture = new THREE.CanvasTexture(createEarthCanvas());
    const earthGeo = new THREE.SphereGeometry(3.6, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.6,
      metalness: 0.1
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earth);

    // Atmospheric Glow Halo
    const atmoGeo = new THREE.SphereGeometry(3.78, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      side: THREE.BackSide
    });
    const atmo = new THREE.Mesh(atmoGeo, atmoMat);
    earthGroup.add(atmo);

    // Moon
    const moonGeo = new THREE.SphereGeometry(0.75, 32, 32);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.9,
      metalness: 0.05
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(-5.5, 3.2, -1.0);
    earthGroup.add(moon);
    moonRef.current = moon;

    scene.add(earthGroup);
    earthGroupRef.current = earthGroup;

    // 4. SATURN WITH CONCENTRIC RINGS
    const saturnGroup = new THREE.Group();
    saturnGroup.position.set(7.5, 4.2, -6.0);
    saturnGroup.rotation.z = 0.35;
    saturnGroup.rotation.x = 0.22;

    const saturnGeo = new THREE.SphereGeometry(1.8, 32, 32);
    const saturnMat = new THREE.MeshStandardMaterial({
      color: 0xe2c696,
      roughness: 0.7
    });
    const saturn = new THREE.Mesh(saturnGeo, saturnMat);
    saturnGroup.add(saturn);

    const ringGeo = new THREE.RingGeometry(2.3, 4.4, 64);
    const ringTexture = new THREE.CanvasTexture(createSaturnRingCanvas());
    const ringMat = new THREE.MeshBasicMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    saturnGroup.add(ring);

    scene.add(saturnGroup);
    saturnGroupRef.current = saturnGroup;

    // 5. MARS
    const marsTexture = new THREE.CanvasTexture(createMarsCanvas());
    const marsGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const marsMat = new THREE.MeshStandardMaterial({
      map: marsTexture,
      roughness: 0.8
    });
    const mars = new THREE.Mesh(marsGeo, marsMat);
    mars.position.set(6.5, -3.2, 2.5);
    scene.add(mars);
    marsRef.current = mars;

    // 6. SATELLITES

    // ISS Station
    const issGroup = new THREE.Group();
    issGroup.position.set(3.4, 3.0, 6.5);
    issGroup.scale.set(0.9, 0.9, 0.9);

    const moduleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.3 });
    const solarCellMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.9, roughness: 0.2 });

    const habGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.3, 16);
    const hab = new THREE.Mesh(habGeo, moduleMat);
    hab.rotation.z = Math.PI / 2;
    issGroup.add(hab);

    const trussGeo = new THREE.BoxGeometry(0.08, 2.8, 0.08);
    const truss = new THREE.Mesh(trussGeo, moduleMat);
    issGroup.add(truss);

    [-1.1, 1.1].forEach(yPos => {
      [-1, 1].forEach(xDir => {
        const wingGeo = new THREE.BoxGeometry(0.85, 0.38, 0.02);
        const wing = new THREE.Mesh(wingGeo, solarCellMat);
        wing.position.set(xDir * 0.6, yPos, 0);
        issGroup.add(wing);
      });
    });

    scene.add(issGroup);
    issRef.current = issGroup;

    // JWST Observatory
    const jwstGroup = new THREE.Group();
    jwstGroup.position.set(-5.5, 3.8, 1.0);
    jwstGroup.scale.set(0.7, 0.7, 0.7);

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

    // Glowing Laser Comms Beam between ISS and Earth
    const commGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(3.4, 3.0, 6.5),
      new THREE.Vector3(-1.8, -2.4, 5.0)
    ]);
    const commMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.75
    });
    const commLine = new THREE.Line(commGeo, commMat);
    scene.add(commLine);
    commBeamRef.current = commLine;

    // Animation Loop
    let animId: number;
    let clock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.008;

      if (earthGroupRef.current) {
        earthGroupRef.current.children[0].rotation.y += 0.002;
      }
      if (marsRef.current) {
        marsRef.current.rotation.y += 0.0025;
      }
      if (saturnGroupRef.current) {
        saturnGroupRef.current.rotation.y += 0.0015;
      }

      if (issRef.current) {
        issRef.current.rotation.y += 0.003;
        issRef.current.position.y = 3.0 + Math.sin(clock * 1.2) * 0.12;
      }

      if (jwstRef.current) {
        jwstRef.current.rotation.y += 0.002;
      }

      if (commBeamRef.current && issRef.current && earthGroupRef.current) {
        const positions = new Float32Array([
          issRef.current.position.x, issRef.current.position.y, issRef.current.position.z,
          earthGroupRef.current.position.x + 0.8, earthGroupRef.current.position.y + 1.2, earthGroupRef.current.position.z
        ]);
        commBeamRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = commBeamRef.current.material as THREE.LineBasicMaterial;
        mat.opacity = 0.4 + Math.sin(clock * 5) * 0.35;
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

  // Scroll interpolation: starts exactly at 14.2 and zooms down towards Earth
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight * 0.9;
      const progress = Math.min(1.0, Math.max(0, scrollY / Math.max(1, maxScroll)));
      setScrollProgress(progress);

      if (cameraRef.current) {
        // Starts at exact framing: z: 14.2, zooms forward on scroll to z: 8.5
        cameraRef.current.position.z = 14.2 - (progress * 5.7);
        cameraRef.current.position.y = 0.8 - (progress * 0.6);
        cameraRef.current.position.x = 0.5 + (progress * 0.5);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartDesign = () => {
    soundFx.playQuindarBeep('intro');
    onEnterLab();
  };

  return (
    <div className="relative w-full h-[100vh] min-h-[640px] overflow-hidden">
      
      {/* 3D WebGL Canvas Layer (Permanent Fullscreen Hero) */}
      <div ref={canvasHolderRef} className="absolute inset-0 w-full h-full z-0" />

      {/* Gentle bottom shadow gradient to blend into cards below */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#070B19] via-[#070B19]/80 to-transparent pointer-events-none z-10" />

      {/* Hero Content Overlay (Always Visible on Page Load) */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 sm:p-6 md:p-8 max-w-6xl mx-auto pointer-events-none">
        
        {/* Top Telemetry Floating Cards */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          
          {/* Left: ISS Telemetry Badge */}
          <div className="bg-[#070B19]/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-cyan-500/30 text-xs font-mono shadow-[0_0_20px_rgba(0,229,255,0.15)] flex items-center gap-2.5 pointer-events-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                <Satellite className="w-3.5 h-3.5 text-cyan-400" />
                ISS TELEMETRY ACTIVE
              </div>
              <div className="text-slate-300 text-[11px]">
                Orbit: 408 km • 7.66 km/s • DSN Laser Beam Active
              </div>
            </div>
          </div>

          {/* Right: Solar System Destination Badges */}
          <div className="bg-[#070B19]/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-amber-500/30 text-xs font-mono shadow-[0_0_20px_rgba(245,158,11,0.15)] flex items-center gap-2.5 pointer-events-auto">
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

        {/* Center Hero Card (Crisp, High Contrast, Guaranteed Legible) */}
        <div className="text-center my-auto py-6 max-w-2xl mx-auto space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-sky-300 text-xs font-mono shadow-md backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>NASA MISSION DESIGN LAB • CONCURRENT ENGINEERING</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
            EXPLORE THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">COSMOS</span>
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-xl mx-auto">
            Take command as Flight Director or lead a 4-player team to balance mass, power, launch rockets, and flight trajectories for NASA space missions.
          </p>

          {/* Interactive CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 pointer-events-auto">
            <button
              onClick={handleStartDesign}
              className="btn-nasa-primary px-7 py-3 rounded-xl text-sm md:text-base font-bold flex items-center gap-2 shadow-xl cursor-pointer group"
            >
              <Rocket className="w-4 h-4 text-cyan-300" />
              <span>START MISSION DESIGN</span>
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onOpenGuide();
              }}
              className="px-5 py-3 rounded-xl bg-[#0E172F]/85 hover:bg-[#16254c] border border-white/20 text-white font-medium text-xs md:text-sm transition backdrop-blur-md flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4 text-sky-300" />
              <span>Flight Manual</span>
            </button>
          </div>

        </div>

        {/* Bottom Scroll Prompt Bar */}
        <div 
          onClick={handleStartDesign}
          className="flex flex-col items-center gap-1.5 cursor-pointer pb-2 group mx-auto pointer-events-auto"
        >
          <span className="text-[11px] font-mono text-cyan-400 tracking-wider uppercase group-hover:text-white transition drop-shadow">
            Scroll down to select mission target
          </span>
          <div className="w-5 h-8 rounded-full border border-cyan-400/60 flex justify-center p-1 group-hover:border-cyan-300">
            <div className="w-1 h-2 rounded-full bg-cyan-400 animate-bounce" />
          </div>
        </div>

      </div>

    </div>
  );
};
