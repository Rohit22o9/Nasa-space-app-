import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MissionDesignState } from '../types/mission';
import { NASA_SCENARIOS, NASA_ORBITS } from '../data/nasaData';
import { Globe, Radio, Shield, Zap } from 'lucide-react';

interface Props {
  state: MissionDesignState;
  simulationTimeSec?: number;
  isSimulating?: boolean;
}

export const ThreeOrbitViewer: React.FC<Props> = ({ 
  state, 
  simulationTimeSec = 0, 
  isSimulating = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inEclipse, setInEclipse] = useState(false);
  const [activeStation, setActiveStation] = useState<string | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const satelliteMeshRef = useRef<THREE.Group | null>(null);
  const orbitLineRef = useRef<THREE.Line | null>(null);
  const commBeamRef = useRef<THREE.Line | null>(null);
  const planetMeshRef = useRef<THREE.Mesh | null>(null);

  const scenario = NASA_SCENARIOS.find(s => s.id === state.scenarioId) || NASA_SCENARIOS[0];
  const orbit = NASA_ORBITS.find(o => o.id === state.orbitId) || NASA_ORBITS[0];

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.5, 6.0);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.8);
    sunLight.position.set(10, 0, 5); // Sun from +X
    scene.add(sunLight);

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 400;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 60;
      starPos[i + 1] = (Math.random() - 0.5) * 60;
      starPos[i + 2] = (Math.random() - 0.5) * 60;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.1 }));
    scene.add(stars);

    // CELESTIAL BODY
    let planetColor = 0x1e3a8a; // Earth blue
    let planetRadius = 1.3;

    if (scenario.destination.toLowerCase().includes('moon')) {
      planetColor = 0x94a3b8; // Moon grey
      planetRadius = 1.0;
    } else if (scenario.destination.toLowerCase().includes('mars')) {
      planetColor = 0xc2410c; // Mars rust
      planetRadius = 1.1;
    } else if (scenario.destination.toLowerCase().includes('jupiter') || scenario.destination.toLowerCase().includes('europa')) {
      planetColor = 0xd97706; // Jupiter orange/tan
      planetRadius = 1.5;
    }

    const planetGeo = new THREE.SphereGeometry(planetRadius, 48, 48);
    const planetMat = new THREE.MeshStandardMaterial({
      color: planetColor,
      roughness: 0.8,
      metalness: 0.1
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    scene.add(planet);
    planetMeshRef.current = planet;

    // Atmospheric Glow Ring if Earth or Mars
    if (scenario.type === 'earth_observation' || scenario.type === 'mars') {
      const atmoGeo = new THREE.SphereGeometry(planetRadius * 1.04, 32, 32);
      const atmoMat = new THREE.MeshBasicMaterial({
        color: scenario.type === 'mars' ? 0xf97316 : 0x38bdf8,
        transparent: true,
        opacity: 0.18,
        side: THREE.BackSide
      });
      const atmo = new THREE.Mesh(atmoGeo, atmoMat);
      scene.add(atmo);
    }

    // ORBIT TRAJECTORY ELLIPSE
    const orbitRadius = planetRadius + 1.2;
    const curve = new THREE.EllipseCurve(
      0, 0,
      orbitRadius, orbitRadius * 0.95,
      0, 2 * Math.PI,
      false,
      0
    );
    const points = curve.getPoints(120);
    const orbitGeo = new THREE.BufferGeometry().setFromPoints(
      points.map(p => new THREE.Vector3(p.x, 0, p.y))
    );
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x00e5ff,
      transparent: true,
      opacity: 0.7
    });
    const orbitLine = new THREE.Line(orbitGeo, orbitMat);
    orbitLine.rotation.x = THREE.MathUtils.degToRad(orbit.inclinationDeg * 0.4);
    scene.add(orbitLine);
    orbitLineRef.current = orbitLine;

    // SATELLITE MARKER
    const satGroup = new THREE.Group();
    const satBodyGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    const satBodyMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04 });
    const satBody = new THREE.Mesh(satBodyGeo, satBodyMat);
    satGroup.add(satBody);

    // Solar wings on marker
    const wingGeo = new THREE.BoxGeometry(0.35, 0.08, 0.01);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x0284c7 });
    const wings = new THREE.Mesh(wingGeo, wingMat);
    satGroup.add(wings);

    scene.add(satGroup);
    satelliteMeshRef.current = satGroup;

    // Communication Beam line
    const commGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 0)
    ]);
    const commMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.8
    });
    const commBeam = new THREE.Line(commGeo, commMat);
    scene.add(commBeam);
    commBeamRef.current = commBeam;

    // Animation Loop
    let animId: number;
    let localClock = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      localClock += isSimulating ? 0.03 : 0.008;
      const t = (simulationTimeSec * 0.05 + localClock) % (Math.PI * 2);

      // Rotate planet slowly
      if (planetMeshRef.current) {
        planetMeshRef.current.rotation.y += 0.002;
      }

      // Move satellite along orbit
      const satX = Math.cos(t) * orbitRadius;
      const satZ = Math.sin(t) * (orbitRadius * 0.95);
      const incRad = THREE.MathUtils.degToRad(orbit.inclinationDeg * 0.4);

      // Apply inclination rotation
      const transformedY = -satZ * Math.sin(incRad);
      const transformedZ = satZ * Math.cos(incRad);

      if (satelliteMeshRef.current) {
        satelliteMeshRef.current.position.set(satX, transformedY, transformedZ);
        satelliteMeshRef.current.rotation.y = -t + Math.PI / 2;
      }

      // Check Eclipse: when satellite is in negative X (behind planet relative to Sun at +X) and close to center
      const inShadow = satX < -0.8 && Math.abs(transformedY) < 1.0;
      setInEclipse(inShadow);

      // Ground station contact simulation
      // If satellite is facing planet surface and positive Z
      const hasContact = !inShadow && transformedZ > 0.5;
      if (hasContact) {
        const stationName = scenario.type === 'earth_observation' 
          ? (satX > 0 ? 'Svalbard Polar Station (NSN)' : 'Wallops Flight Facility')
          : (satX > 0 ? 'Goldstone 70m Dish (DSN)' : 'Canberra Deep Space Station (DSN)');
        setActiveStation(stationName);

        if (commBeamRef.current) {
          const positions = new Float32Array([
            satX, transformedY, transformedZ,
            0, 0, 0
          ]);
          commBeamRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          commBeamRef.current.visible = true;
        }
      } else {
        setActiveStation(null);
        if (commBeamRef.current) commBeamRef.current.visible = false;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
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
  }, [state.scenarioId, state.orbitId, scenario.destination, orbit.inclinationDeg, isSimulating]);

  return (
    <div className="relative w-full h-[360px] md:h-[480px] bg-space-950 rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl">
      <div ref={containerRef} className="w-full h-full" />

      {/* Orbit info header top left */}
      <div className="absolute top-3 left-3 bg-space-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-xs font-mono flex flex-col gap-1">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>CELESTIAL FLIGHT DYNAMICS</span>
        </div>
        <div className="text-slate-300">
          Target: <span className="text-white font-medium">{scenario.destination}</span>
        </div>
        <div className="text-slate-400 text-[11px]">
          Orbit: {orbit.name} (Inc: {orbit.inclinationDeg}°, Alt: {orbit.altitudeKm} km)
        </div>
      </div>

      {/* Live Status Indicators top right */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
        {/* Eclipse badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium backdrop-blur-md border ${
          inEclipse 
            ? 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-glow-gold' 
            : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
        }`}>
          <Zap className="w-3.5 h-3.5" />
          <span>{inEclipse ? 'ORBITAL ECLIPSE (IN SHADOW)' : 'FULL SOLAR EXPOSURE'}</span>
        </div>

        {/* Ground Station Contact badge */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium backdrop-blur-md border ${
          activeStation 
            ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-glow-cyan' 
            : 'bg-slate-900/80 text-slate-400 border-slate-700/40'
        }`}>
          <Radio className={`w-3.5 h-3.5 ${activeStation ? 'animate-pulse text-cyan-400' : ''}`} />
          <span>{activeStation ? `DOWNLINK ACQUIRED: ${activeStation}` : 'LOS (LOSS OF SIGNAL) - BUFFERING'}</span>
        </div>
      </div>

      {/* Legend Bottom Left */}
      <div className="absolute bottom-3 left-3 flex items-center gap-4 bg-space-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-cyan-400" />
          <span>Orbit Path</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span>Spacecraft</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 bg-emerald-400" />
          <span>RF Comms Link</span>
        </div>
      </div>
    </div>
  );
};
