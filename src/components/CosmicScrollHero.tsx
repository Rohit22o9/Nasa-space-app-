import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ChevronDown, Sparkles, Rocket, Globe } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface Props {
  onEnterLab: () => void;
}

export const CosmicScrollHero: React.FC<Props> = ({ onEnterLab }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHolderRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const earthRef = useRef<THREE.Mesh | null>(null);
  const atmoRef = useRef<THREE.Mesh | null>(null);
  const probeRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!canvasHolderRef.current) return;

    const width = canvasHolderRef.current.clientWidth;
    const height = canvasHolderRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 22);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    canvasHolderRef.current.appendChild(renderer.domElement);

    // Ambient & Directional Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7e6, 2.5);
    sunLight.position.set(15, 6, 10);
    scene.add(sunLight);

    // 1. STARFIELD (Deep Space Cosmic Particles)
    const starCount = 1500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 80;
      starPositions[i + 1] = (Math.random() - 0.5) * 80;
      starPositions[i + 2] = (Math.random() - 0.5) * 120;

      // Color variation (white, blue, cyan, slight amber)
      const r = 0.7 + Math.random() * 0.3;
      const g = 0.8 + Math.random() * 0.2;
      const b = 0.9 + Math.random() * 0.1;
      starColors[i] = r;
      starColors[i + 1] = g;
      starColors[i + 2] = b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);
    starsRef.current = stars;

    // 2. 3D EARTH (Approached upon scrolling)
    const earthGeo = new THREE.SphereGeometry(3.5, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      roughness: 0.75,
      metalness: 0.15,
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.position.set(0, -1.2, 0);
    scene.add(earth);
    earthRef.current = earth;

    // Atmospheric Glow
    const atmoGeo = new THREE.SphereGeometry(3.68, 32, 32);
    const atmoMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.BackSide,
    });
    const atmo = new THREE.Mesh(atmoGeo, atmoMat);
    atmo.position.copy(earth.position);
    scene.add(atmo);
    atmoRef.current = atmo;

    // 3. FLOATING DEEP SPACE PROBE
    const probe = new THREE.Group();
    const busGeo = new THREE.BoxGeometry(0.4, 0.4, 0.5);
    const busMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
    const bus = new THREE.Mesh(busGeo, busMat);
    probe.add(bus);

    const wingGeo = new THREE.BoxGeometry(1.2, 0.2, 0.02);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    probe.add(wings);

    const dishGeo = new THREE.SphereGeometry(0.25, 16, 8, 0, Math.PI * 2, 0, Math.PI / 3);
    const dishMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.rotation.x = Math.PI;
    dish.position.z = 0.3;
    probe.add(dish);

    probe.position.set(2.2, 1.0, 14);
    probe.rotation.set(0.3, 0.5, 0.2);
    scene.add(probe);
    probeRef.current = probe;

    // Animation loop
    let animId: number;
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.01;

      if (earthRef.current) {
        earthRef.current.rotation.y += 0.0015;
      }
      if (probeRef.current) {
        probeRef.current.rotation.y += 0.004;
        probeRef.current.position.y = 1.0 + Math.sin(clock * 0.8) * 0.15;
      }
      if (starsRef.current) {
        starsRef.current.rotation.z = clock * 0.005;
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

  // Update Camera based on scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScroll = containerRef.current.scrollHeight - window.innerHeight;
      const currentScroll = Math.max(0, -rect.top);
      const progress = Math.min(1.0, Math.max(0, currentScroll / Math.max(1, totalScroll)));
      setScrollProgress(progress);

      if (cameraRef.current) {
        // Camera moves from deep space (z: 22) into orbital close-up (z: 6.5)
        cameraRef.current.position.z = 22 - (progress * 15.5);
        cameraRef.current.position.y = (1.0 - progress) * 1.5;
        cameraRef.current.rotation.x = progress * 0.15;
      }

      if (starsRef.current) {
        // Warp effect: stars elongate or rotate faster as you scroll
        const mat = starsRef.current.material as THREE.PointsMaterial;
        mat.size = 0.14 + progress * 0.08;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = () => {
    soundFx.playQuindarBeep('intro');
    if (containerRef.current) {
      window.scrollTo({
        top: containerRef.current.scrollHeight - window.innerHeight + 100,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-[220vh]">
      
      {/* Sticky 3D WebGL Canvas Layer */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-0">
        <div ref={canvasHolderRef} className="w-full h-full" />
        
        {/* Subtle Cosmic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#070B19]/40 via-transparent to-[#070B19]" />
      </div>

      {/* Floating Scroll Content Layers */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 -mt-[220vh]">

        {/* STAGE 1: DEEP SPACE VOID (0% - 30% scroll) */}
        <div 
          className="h-screen flex flex-col items-center justify-center text-center transition-opacity duration-300"
          style={{ 
            opacity: Math.max(0, 1 - (scrollProgress * 3)),
            transform: `translateY(${scrollProgress * 100}px)`
          }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-sky-300 text-xs font-mono mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>HUMANITY'S DEEP SPACE INITIATIVE</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight mb-4 drop-shadow-lg">
            BEYOND THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-400 to-blue-500">HORIZON</span>
          </h1>

          <p className="text-sm md:text-base text-slate-300 max-w-xl mx-auto leading-relaxed mb-8 drop-shadow">
            Every interplanetary journey begins with a delicate balance of mass, energy, orbits, and engineering trade-offs.
          </p>

          {/* Scroll Down Indicator */}
          <div 
            onClick={scrollToSection}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase group-hover:text-white transition">
              SCROLL TO INITIATE APPROACH VECTOR
            </span>
            <div className="w-6 h-10 rounded-full border-2 border-cyan-400/50 flex justify-center p-1 group-hover:border-cyan-400">
              <div className="w-1.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" />
            </div>
          </div>
        </div>

        {/* STAGE 2: APPROACHING EARTH & TELEMETRY LOCK (35% - 70% scroll) */}
        <div 
          className="h-screen flex flex-col items-center justify-center text-center transition-opacity duration-300"
          style={{ 
            opacity: Math.max(0, Math.min(1, (scrollProgress - 0.25) * 3.5)) * Math.max(0, 1 - (scrollProgress - 0.65) * 4),
            pointerEvents: scrollProgress > 0.3 && scrollProgress < 0.7 ? 'auto' : 'none'
          }}
        >
          <div className="p-6 rounded-3xl bg-[#070B19]/80 border border-cyan-500/30 backdrop-blur-xl max-w-xl mx-auto shadow-[0_0_35px_rgba(0,229,255,0.15)]">
            <div className="flex items-center justify-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>ACQUIRING TELEMETRY LOCK • ORBITAL INSERTION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Entering Earth Orbital Approach
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
              Systems sync with Kennedy Space Center Launch Control Center and NASA Deep Space Network.
            </p>
          </div>
        </div>

        {/* STAGE 3: ENTERING NASA MISSION DESIGN LAB (75% - 100% scroll) */}
        <div 
          className="h-screen flex flex-col items-center justify-center text-center transition-opacity duration-300"
          style={{ 
            opacity: Math.max(0, Math.min(1, (scrollProgress - 0.65) * 3)),
          }}
        >
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono">
              <Rocket className="w-3.5 h-3.5 text-cyan-400" />
              <span>ORBITAL GATEWAY CLEARED • DOCKING COMPLETE</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">NASA Mission Design Lab</span>
            </h2>

            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Take command as Flight Director or lead a 4-player team to engineer, verify, and simulate humanity's next flagship space mission.
            </p>

            <div className="pt-2">
              <button
                onClick={() => {
                  soundFx.playQuindarBeep('intro');
                  onEnterLab();
                }}
                className="btn-nasa-primary px-8 py-4 rounded-2xl text-base font-bold shadow-xl flex items-center gap-2.5 mx-auto group"
              >
                <span>ENTER MISSION LAB NOW</span>
                <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Quick Skip Button in Top Right */}
      <div className="sticky top-20 right-4 z-30 flex justify-end px-4 pointer-events-auto">
        <button
          onClick={() => {
            soundFx.playClick();
            onEnterLab();
          }}
          className="px-3.5 py-1.5 rounded-xl bg-[#0E172F]/80 hover:bg-[#1b2d56] border border-white/10 text-xs font-mono text-cyan-300 backdrop-blur-md transition flex items-center gap-1.5"
        >
          <span>Skip to Mission Lab</span>
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};
