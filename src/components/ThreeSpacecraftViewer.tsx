import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MissionDesignState } from '../types/mission';
import { 
  NASA_CHASSIS, 
  NASA_POWER_SYSTEMS, 
  NASA_COMMS, 
  NASA_PROPULSION,
  NASA_INSTRUMENTS 
} from '../data/nasaData';
import { Layers, RotateCcw, Crosshair } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface Props {
  state: MissionDesignState;
}

export const ThreeSpacecraftViewer: React.FC<Props> = ({ state }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [exploded, setExploded] = useState<boolean>(false);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const spacecraftGroupRef = useRef<THREE.Group | null>(null);
  const explodedPartsRef = useRef<{ mesh: THREE.Object3D; basePos: THREE.Vector3; explodeDir: THREE.Vector3 }[]>([]);

  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const rotationTargetRef = useRef({ x: 0.35, y: 0.6 });

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.8, 4.4);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // 1. LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7e6, 2.5);
    sunLight.position.set(6, 8, 7);
    sunLight.castShadow = true;
    scene.add(sunLight);

    const bayCyanRim = new THREE.DirectionalLight(0x00e5ff, 0.7);
    bayCyanRim.position.set(-6, -2, -4);
    scene.add(bayCyanRim);

    // 2. ORBITAL SHIPYARD HOLOGRAPHIC DRYDOCK PLATFORM
    const gridHelper = new THREE.GridHelper(5, 12, 0x00e5ff, 0x1e3a8a);
    gridHelper.position.y = -1.35;
    scene.add(gridHelper);

    // Glowing Holographic Base Ring
    const ringGeo = new THREE.RingGeometry(1.4, 1.45, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.34;
    scene.add(ring);

    // Spacecraft root group
    const scGroup = new THREE.Group();
    scene.add(scGroup);
    spacecraftGroupRef.current = scGroup;

    // Stars & Floating Nanodust particles
    const starGeo = new THREE.BufferGeometry();
    const starCount = 300;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 30;
      starPositions[i + 1] = (Math.random() - 0.5) * 30;
      starPositions[i + 2] = (Math.random() - 0.5) * 30;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x00e5ff, size: 0.06, transparent: true, opacity: 0.5 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Mouse drag controls
    const dom = renderer.domElement;
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;
      rotationTargetRef.current.y += deltaX * 0.008;
      rotationTargetRef.current.x += deltaY * 0.008;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      cameraRef.current.position.z = THREE.MathUtils.clamp(
        cameraRef.current.position.z + e.deltaY * 0.003,
        2.0,
        8.0
      );
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (spacecraftGroupRef.current) {
        if (!isDraggingRef.current) {
          rotationTargetRef.current.y += 0.0035;
        }
        spacecraftGroupRef.current.rotation.y += (rotationTargetRef.current.y - spacecraftGroupRef.current.rotation.y) * 0.1;
        spacecraftGroupRef.current.rotation.x += (rotationTargetRef.current.x - spacecraftGroupRef.current.rotation.x) * 0.1;
      }

      gridHelper.rotation.y += 0.001;

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
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.remove();
      }
    };
  }, []);

  // Rebuild 3D Model when spacecraft components change
  useEffect(() => {
    if (!spacecraftGroupRef.current) return;
    const scGroup = spacecraftGroupRef.current;

    while (scGroup.children.length > 0) {
      scGroup.remove(scGroup.children[0]);
    }
    explodedPartsRef.current = [];

    const chassis = NASA_CHASSIS.find(c => c.id === state.chassisId) || NASA_CHASSIS[1];
    const power = NASA_POWER_SYSTEMS.find(p => p.id === state.powerSystemId) || NASA_POWER_SYSTEMS[1];
    const comms = NASA_COMMS.find(c => c.id === state.commsSystemId) || NASA_COMMS[0];
    const propulsion = NASA_PROPULSION.find(p => p.id === state.propulsionSystemId) || NASA_PROPULSION[0];
    const selectedInsts = NASA_INSTRUMENTS.filter(i => state.selectedInstrumentIds.includes(i.id));

    // Sci-Fi Metallic & Gold Foil Materials
    const goldMliMaterial = new THREE.MeshStandardMaterial({
      color: 0xdfa028,
      metalness: 0.88,
      roughness: 0.22,
    });

    const darkAlloyMaterial = new THREE.MeshStandardMaterial({
      color: 0x222d3d,
      metalness: 0.7,
      roughness: 0.35
    });

    const solarCellMaterial = new THREE.MeshStandardMaterial({
      color: 0x07286a,
      emissive: 0x041842,
      metalness: 0.9,
      roughness: 0.15
    });

    const whiteCeramicMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.2,
      roughness: 0.5
    });

    // 1. BUS CHASSIS MESH
    let busMesh: THREE.Object3D;
    if (chassis.category === 'cubesat_12u') {
      const geo = new THREE.BoxGeometry(0.5, 0.9, 0.5);
      busMesh = new THREE.Mesh(geo, goldMliMaterial);
    } else if (chassis.category === 'medium_class') {
      const geo = new THREE.CylinderGeometry(0.7, 0.7, 1.2, 6);
      busMesh = new THREE.Mesh(geo, goldMliMaterial);
    } else if (chassis.category === 'flagship') {
      const geo = new THREE.CylinderGeometry(1.0, 1.0, 1.6, 8);
      busMesh = new THREE.Mesh(geo, darkAlloyMaterial);
    } else {
      const geo = new THREE.BoxGeometry(0.8, 1.0, 0.8);
      busMesh = new THREE.Mesh(geo, goldMliMaterial);
    }
    scGroup.add(busMesh);

    // 2. POWER SYSTEM
    if (power.type === 'solar_deployable') {
      [-1, 1].forEach((dir) => {
        const wingGroup = new THREE.Group();
        const boomGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.3);
        const boom = new THREE.Mesh(boomGeo, darkAlloyMaterial);
        boom.rotation.z = Math.PI / 2;
        boom.position.x = dir * 0.55;
        wingGroup.add(boom);

        const panelGeo = new THREE.BoxGeometry(0.9, 0.5, 0.03);
        const panel = new THREE.Mesh(panelGeo, solarCellMaterial);
        panel.position.x = dir * 1.1;
        wingGroup.add(panel);

        scGroup.add(wingGroup);
        explodedPartsRef.current.push({
          mesh: wingGroup,
          basePos: wingGroup.position.clone(),
          explodeDir: new THREE.Vector3(dir * 1.2, 0, 0)
        });
      });
    } else if (power.type === 'solar_ultraflex') {
      [-1, 1].forEach((dir) => {
        const wingGroup = new THREE.Group();
        const discGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.02, 16);
        const disc = new THREE.Mesh(discGeo, solarCellMaterial);
        disc.rotation.x = Math.PI / 2;
        disc.position.x = dir * 1.3;
        wingGroup.add(disc);

        const strutGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7);
        const strut = new THREE.Mesh(strutGeo, darkAlloyMaterial);
        strut.rotation.z = Math.PI / 2;
        strut.position.x = dir * 0.75;
        wingGroup.add(strut);

        scGroup.add(wingGroup);
        explodedPartsRef.current.push({
          mesh: wingGroup,
          basePos: wingGroup.position.clone(),
          explodeDir: new THREE.Vector3(dir * 1.4, 0, 0)
        });
      });
    } else if (power.type === 'rtg_nextgen') {
      const rtgGroup = new THREE.Group();
      const cylGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.6, 12);
      const cyl = new THREE.Mesh(cylGeo, darkAlloyMaterial);
      rtgGroup.add(cyl);

      for (let f = 0; f < 6; f++) {
        const finGeo = new THREE.BoxGeometry(0.38, 0.5, 0.02);
        const fin = new THREE.Mesh(finGeo, darkAlloyMaterial);
        fin.rotation.y = (f * Math.PI) / 3;
        rtgGroup.add(fin);
      }
      rtgGroup.position.set(0.65, 0.1, -0.4);
      scGroup.add(rtgGroup);
      explodedPartsRef.current.push({
        mesh: rtgGroup,
        basePos: rtgGroup.position.clone(),
        explodeDir: new THREE.Vector3(1.2, 0.4, -0.6)
      });
    }

    // 3. COMMS ANTENNA
    const dishGroup = new THREE.Group();
    const dishRadius = 0.45;
    const dishGeo = new THREE.SphereGeometry(dishRadius, 24, 12, 0, Math.PI * 2, 0, Math.PI / 3);
    const dish = new THREE.Mesh(dishGeo, goldMliMaterial);
    dish.rotation.x = Math.PI;
    dishGroup.add(dish);

    const feedGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35);
    const feed = new THREE.Mesh(feedGeo, darkAlloyMaterial);
    feed.position.z = -0.18;
    feed.rotation.x = Math.PI / 2;
    dishGroup.add(feed);

    dishGroup.position.set(0, 0.75, 0);
    scGroup.add(dishGroup);
    explodedPartsRef.current.push({
      mesh: dishGroup,
      basePos: dishGroup.position.clone(),
      explodeDir: new THREE.Vector3(0, 1.2, 0)
    });

    // 4. PROPULSION ENGINE NOZZLE
    if (propulsion.type !== 'none') {
      const engineGroup = new THREE.Group();
      const nozzleGeo = new THREE.ConeGeometry(0.22, 0.45, 16, 1, true);
      const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.85, roughness: 0.3 });
      const nozzle = new THREE.Mesh(nozzleGeo, nozzleMat);
      nozzle.rotation.x = Math.PI;
      engineGroup.add(nozzle);

      engineGroup.position.set(0, -0.75, 0);
      scGroup.add(engineGroup);
      explodedPartsRef.current.push({
        mesh: engineGroup,
        basePos: engineGroup.position.clone(),
        explodeDir: new THREE.Vector3(0, -1.2, 0)
      });
    }

    // 5. SCIENCE INSTRUMENTS
    selectedInsts.forEach((inst, idx) => {
      const instGroup = new THREE.Group();
      if (inst.category === 'optical') {
        const tubeGeo = new THREE.CylinderGeometry(0.09, 0.11, 0.35, 12);
        const tube = new THREE.Mesh(tubeGeo, darkAlloyMaterial);
        tube.rotation.x = Math.PI / 2;
        instGroup.add(tube);
        const lensGeo = new THREE.CircleGeometry(0.08, 16);
        const lensMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.position.z = 0.18;
        instGroup.add(lens);
      } else if (inst.category === 'particles_fields') {
        const boomGeo = new THREE.CylinderGeometry(0.012, 0.012, 1.2);
        const boom = new THREE.Mesh(boomGeo, darkAlloyMaterial);
        boom.rotation.z = Math.PI / 3;
        instGroup.add(boom);
        const sensorGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
        const sensor = new THREE.Mesh(sensorGeo, goldMliMaterial);
        sensor.position.set(0.6, 0.35, 0);
        instGroup.add(sensor);
      } else if (inst.category === 'radar_lidar') {
        const antGeo = new THREE.CylinderGeometry(0.01, 0.01, 1.4);
        const ant = new THREE.Mesh(antGeo, whiteCeramicMaterial);
        ant.rotation.z = Math.PI / 2;
        instGroup.add(ant);
      } else {
        const boxGeo = new THREE.BoxGeometry(0.18, 0.18, 0.2);
        const box = new THREE.Mesh(boxGeo, whiteCeramicMaterial);
        instGroup.add(box);
      }

      const angle = (idx / Math.max(1, selectedInsts.length)) * Math.PI * 2;
      const x = Math.cos(angle) * 0.45;
      const z = Math.sin(angle) * 0.45;
      instGroup.position.set(x, -0.1, z);
      scGroup.add(instGroup);

      explodedPartsRef.current.push({
        mesh: instGroup,
        basePos: instGroup.position.clone(),
        explodeDir: new THREE.Vector3(x * 1.8, 0.3, z * 1.8)
      });
    });

  }, [state.chassisId, state.powerSystemId, state.commsSystemId, state.propulsionSystemId, state.selectedInstrumentIds]);

  // Exploded View toggle
  useEffect(() => {
    explodedPartsRef.current.forEach(item => {
      const targetPos = exploded 
        ? item.basePos.clone().add(item.explodeDir) 
        : item.basePos.clone();
      item.mesh.position.copy(targetPos);
    });
  }, [exploded]);

  const toggleExploded = () => {
    soundFx.playComponentMount();
    setExploded(!exploded);
  };

  const resetCamera = () => {
    soundFx.playClick();
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 1.8, 4.4);
      rotationTargetRef.current = { x: 0.35, y: 0.6 };
    }
  };

  const chassis = NASA_CHASSIS.find(c => c.id === state.chassisId);
  const power = NASA_POWER_SYSTEMS.find(p => p.id === state.powerSystemId);

  return (
    <div className="relative w-full h-[370px] md:h-[460px] bg-[#070D1F] rounded-2xl border border-cyan-500/30 overflow-hidden shadow-[0_0_30px_rgba(0,229,255,0.15)]">
      {/* 3D Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Sci-Fi Shipyard HUD Reticle Top Left */}
      <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1">
        <div className="flex items-center gap-2 bg-[#070B19]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-400/40 text-xs font-mono text-cyan-300">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span>ORBITAL DRYDOCK • HANGAR BAY 1</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono pl-1">
          {chassis?.name} • {power?.name.split('(')[0]}
        </div>
      </div>

      {/* Controls Overlay Bottom Right */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-[#070B19]/90 backdrop-blur-md p-1.5 rounded-xl border border-cyan-500/30 shadow-lg">
        <button
          onClick={toggleExploded}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
            exploded 
              ? 'bg-cyan-500 text-space-950 shadow-[0_0_15px_rgba(0,229,255,0.5)]' 
              : 'bg-[#111e3b] text-cyan-300 hover:bg-[#1a2e5a]'
          }`}
          title="Toggle Exploded Subsystems CAD View"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{exploded ? 'ASSEMBLE' : 'EXPLODE CAD'}</span>
        </button>

        <button
          onClick={resetCamera}
          className="p-1.5 rounded-lg bg-[#111e3b] text-slate-300 hover:text-white hover:bg-[#1a2e5a] transition"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Ship Outfitting Stats Badge Bottom Left */}
      <div className="absolute bottom-3 left-3 bg-[#070B19]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono flex items-center gap-3 text-slate-300">
        <div>
          <span className="text-slate-400">HARDPOINTS:</span> <span className="text-cyan-400 font-bold">{state.selectedInstrumentIds.length} MOUNTED</span>
        </div>
      </div>
    </div>
  );
};
