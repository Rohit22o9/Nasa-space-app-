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
import { Layers, RotateCcw, Sparkles } from 'lucide-react';
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
  const rotationTargetRef = useRef({ x: 0.25, y: 0.5 });

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Centered camera for optimal spacecraft framing
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 4.8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    // Warm Key Light & Cyan Rim Lighting (Hangar sci-fi look)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const keySun = new THREE.DirectionalLight(0xfff5e6, 2.5);
    keySun.position.set(6, 6, 7);
    scene.add(keySun);

    const rimCyan = new THREE.DirectionalLight(0x00e5ff, 0.9);
    rimCyan.position.set(-6, -2, -5);
    scene.add(rimCyan);

    // Spacecraft root group - centered at origin
    const scGroup = new THREE.Group();
    scGroup.position.set(0, 0, 0);
    scene.add(scGroup);
    spacecraftGroupRef.current = scGroup;

    // Subtle background stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 300;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 30;
      starPos[i + 1] = (Math.random() - 0.5) * 30;
      starPos[i + 2] = (Math.random() - 0.5) * 30;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.08, transparent: true, opacity: 0.5 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Mouse Controls
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
        2.5,
        7.5
      );
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (spacecraftGroupRef.current) {
        if (!isDraggingRef.current) {
          rotationTargetRef.current.y += 0.004; // Smooth idle rotation
        }
        spacecraftGroupRef.current.rotation.y += (rotationTargetRef.current.y - spacecraftGroupRef.current.rotation.y) * 0.1;
        spacecraftGroupRef.current.rotation.x += (rotationTargetRef.current.x - spacecraftGroupRef.current.rotation.x) * 0.1;
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

  // Rebuild 3D Model dynamically
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

    // Materials
    const goldMliMaterial = new THREE.MeshStandardMaterial({
      color: 0xdfa028,
      metalness: 0.88,
      roughness: 0.2
    });

    const alloyMaterial = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.7,
      roughness: 0.35
    });

    const solarCellMaterial = new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      metalness: 0.95,
      roughness: 0.15
    });

    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.2,
      roughness: 0.5
    });

    // 1. CHASSIS BUS
    const busGeo = new THREE.BoxGeometry(0.85, 1.0, 0.85);
    const busMesh = new THREE.Mesh(busGeo, goldMliMaterial);
    scGroup.add(busMesh);

    // 2. POWER SYSTEM
    if (power.type === 'solar_deployable') {
      [-1, 1].forEach((dir) => {
        const wingGroup = new THREE.Group();
        const strutGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.35);
        const strut = new THREE.Mesh(strutGeo, alloyMaterial);
        strut.rotation.z = Math.PI / 2;
        strut.position.x = dir * 0.6;
        wingGroup.add(strut);

        const panelGeo = new THREE.BoxGeometry(1.0, 0.55, 0.03);
        const panel = new THREE.Mesh(panelGeo, solarCellMaterial);
        panel.position.x = dir * 1.25;
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
        const discGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.02, 24);
        const disc = new THREE.Mesh(discGeo, solarCellMaterial);
        disc.rotation.x = Math.PI / 2;
        disc.position.x = dir * 1.45;
        wingGroup.add(disc);

        const strutGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.8);
        const strut = new THREE.Mesh(strutGeo, alloyMaterial);
        strut.rotation.z = Math.PI / 2;
        strut.position.x = dir * 0.8;
        wingGroup.add(strut);

        scGroup.add(wingGroup);
        explodedPartsRef.current.push({
          mesh: wingGroup,
          basePos: wingGroup.position.clone(),
          explodeDir: new THREE.Vector3(dir * 1.3, 0, 0)
        });
      });
    } else if (power.type === 'rtg_nextgen') {
      const rtgGroup = new THREE.Group();
      const cylGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.65, 16);
      const cyl = new THREE.Mesh(cylGeo, alloyMaterial);
      rtgGroup.add(cyl);

      for (let f = 0; f < 6; f++) {
        const finGeo = new THREE.BoxGeometry(0.42, 0.55, 0.02);
        const fin = new THREE.Mesh(finGeo, alloyMaterial);
        fin.rotation.y = (f * Math.PI) / 3;
        rtgGroup.add(fin);
      }
      rtgGroup.position.set(0.68, 0, -0.4);
      scGroup.add(rtgGroup);
      explodedPartsRef.current.push({
        mesh: rtgGroup,
        basePos: rtgGroup.position.clone(),
        explodeDir: new THREE.Vector3(1.2, 0.3, -0.6)
      });
    }

    // 3. COMMS DISH
    const dishGroup = new THREE.Group();
    const dishGeo = new THREE.SphereGeometry(0.45, 24, 12, 0, Math.PI * 2, 0, Math.PI / 3);
    const dish = new THREE.Mesh(dishGeo, whiteMat);
    dish.rotation.x = Math.PI;
    dishGroup.add(dish);

    const feedGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.4);
    const feed = new THREE.Mesh(feedGeo, alloyMaterial);
    feed.position.z = -0.2;
    feed.rotation.x = Math.PI / 2;
    dishGroup.add(feed);

    dishGroup.position.set(0, 0.75, 0);
    scGroup.add(dishGroup);
    explodedPartsRef.current.push({
      mesh: dishGroup,
      basePos: dishGroup.position.clone(),
      explodeDir: new THREE.Vector3(0, 1.1, 0)
    });

    // 4. PROPULSION ENGINE NOZZLE
    const engineGroup = new THREE.Group();
    const nozzleGeo = new THREE.ConeGeometry(0.25, 0.45, 16, 1, true);
    const nozzle = new THREE.Mesh(nozzleGeo, alloyMaterial);
    nozzle.rotation.x = Math.PI;
    engineGroup.add(nozzle);
    engineGroup.position.set(0, -0.72, 0);
    scGroup.add(engineGroup);
    explodedPartsRef.current.push({
      mesh: engineGroup,
      basePos: engineGroup.position.clone(),
      explodeDir: new THREE.Vector3(0, -1.1, 0)
    });

    // 5. SCIENCE INSTRUMENTS
    selectedInsts.forEach((inst, idx) => {
      const instGroup = new THREE.Group();
      if (inst.category === 'optical') {
        const tubeGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.35, 12);
        const tube = new THREE.Mesh(tubeGeo, alloyMaterial);
        tube.rotation.x = Math.PI / 2;
        instGroup.add(tube);
        const lensGeo = new THREE.CircleGeometry(0.09, 16);
        const lensMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const lens = new THREE.Mesh(lensGeo, lensMat);
        lens.position.z = 0.18;
        instGroup.add(lens);
      } else if (inst.category === 'radar_lidar') {
        const antGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.4);
        const ant = new THREE.Mesh(antGeo, whiteMat);
        ant.rotation.z = Math.PI / 2;
        instGroup.add(ant);
      } else {
        const boxGeo = new THREE.BoxGeometry(0.2, 0.2, 0.22);
        const box = new THREE.Mesh(boxGeo, whiteMat);
        instGroup.add(box);
      }

      const angle = (idx / Math.max(1, selectedInsts.length)) * Math.PI * 2;
      const x = Math.cos(angle) * 0.48;
      const z = Math.sin(angle) * 0.48;
      instGroup.position.set(x, -0.1, z);
      scGroup.add(instGroup);

      explodedPartsRef.current.push({
        mesh: instGroup,
        basePos: instGroup.position.clone(),
        explodeDir: new THREE.Vector3(x * 1.6, 0.2, z * 1.6)
      });
    });

  }, [state.chassisId, state.powerSystemId, state.commsSystemId, state.propulsionSystemId, state.selectedInstrumentIds]);

  // Handle exploded toggle
  useEffect(() => {
    explodedPartsRef.current.forEach(item => {
      const targetPos = exploded 
        ? item.basePos.clone().add(item.explodeDir) 
        : item.basePos.clone();
      item.mesh.position.copy(targetPos);
    });
  }, [exploded]);

  const toggleExploded = () => {
    soundFx.playClick();
    setExploded(!exploded);
  };

  const resetView = () => {
    soundFx.playClick();
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 0.8, 4.8);
      rotationTargetRef.current = { x: 0.25, y: 0.5 };
    }
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] bg-[#0A1329]/90 rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl flex flex-col justify-between p-3.5">
      
      {/* ThreeJS WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Badge */}
      <div className="relative z-10 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-[#070B19]/85 px-3 py-1.5 rounded-lg border border-cyan-500/30 text-xs font-mono text-cyan-400 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>3D SPACECRAFT BAY</span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className="relative z-10 flex items-center justify-between gap-2 pt-2">
        <div className="bg-[#070B19]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[11px] font-mono text-slate-300">
          <span className="text-cyan-400 font-bold">{state.selectedInstrumentIds.length}</span> Payloads Attached
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleExploded}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition backdrop-blur-md ${
              exploded 
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' 
                : 'bg-[#0E172F]/90 text-slate-200 border border-white/15 hover:bg-[#152347]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{exploded ? 'ASSEMBLE' : 'EXPLODE'}</span>
          </button>

          <button
            onClick={resetView}
            className="p-1.5 rounded-lg bg-[#0E172F]/90 text-slate-300 hover:text-white border border-white/15 transition backdrop-blur-md"
            title="Reset Angle"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
