import React, { useState, useRef, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Float, 
  PerspectiveCamera,
  Line,
  Html
} from '@react-three/drei';
import { 
  Bloom, 
  EffectComposer, 
  Noise, 
  Vignette 
} from '@react-three/postprocessing';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Zap, 
  ShieldAlert, 
  Cpu, 
  Terminal, 
  Layers, 
  RefreshCw, 
  ArrowUpRight,
  Database,
  Network
} from 'lucide-react';

// --- Types ---

interface NodeData {
  id: string;
  name: string;
  type: 'service' | 'database' | 'gateway';
  status: 'healthy' | 'warning' | 'critical';
  load: number;
  position: THREE.Vector3;
}

interface LinkData {
  from: string;
  to: string;
}

// --- Components ---

const ConnectionLine = ({ from, to, status }: { from: THREE.Vector3, to: THREE.Vector3, status: string }) => {
  const color = status === 'critical' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981';
  
  return (
    <Line
      points={[from, to]}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.2}
    />
  );
};

const DataPacket = ({ from, to, speed = 0.5, color = '#ffffff' }: { from: THREE.Vector3, to: THREE.Vector3, speed?: number, color?: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [delay] = useState(() => Math.random() * 2);
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = ((state.clock.elapsedTime + delay) * speed) % 1;
      meshRef.current.position.lerpVectors(from, to, t);
      meshRef.current.scale.setScalar(Math.sin(t * Math.PI) * 0.5 + 0.5);
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={4} />
    </mesh>
  );
};

const ServiceNode = ({ data, isSelected, onSelect }: { data: NodeData, isSelected: boolean, onSelect: () => void }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = data.status === 'critical' ? '#ef4444' : data.status === 'warning' ? '#f59e0b' : '#10b981';

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.rotation.z += 0.005;
      if (isSelected) {
        const s = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.1;
        meshRef.current.scale.set(s, s, s);
      }
    }
  });

  return (
    <group position={data.position}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh ref={meshRef} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
          {data.type === 'service' ? (
            <icosahedronGeometry args={[0.6, 0]} />
          ) : data.type === 'database' ? (
            <torusKnotGeometry args={[0.4, 0.15, 64, 8]} />
          ) : (
            <dodecahedronGeometry args={[0.6, 0]} />
          )}
          <meshStandardMaterial 
            color={color} 
            emissive={color}
            emissiveIntensity={isSelected ? 3 : 0.8}
            roughness={0.1}
            metalness={0.9}
            wireframe={data.status !== 'healthy'}
          />
        </mesh>
      </Float>
      
      <Html
        position={[0, 1.2, 0]}
        center
        distanceFactor={10}
        className="pointer-events-none"
      >
        <div className="px-2 py-1 bg-black/50 backdrop-blur-sm border border-white/10 text-[8px] font-bold text-white whitespace-nowrap uppercase tracking-widest flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${data.status === 'healthy' ? 'bg-emerald-500' : data.status === 'warning' ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`} />
          {data.name}
        </div>
      </Html>
    </group>
  );
};

export default function Vortex() {
  const [nodes, setNodes] = useState<NodeData[]>([
    { id: '1', name: 'Auth-Service', type: 'gateway', status: 'healthy', load: 45, position: new THREE.Vector3(-4, 2, 0) },
    { id: '2', name: 'User-API', type: 'service', status: 'healthy', load: 30, position: new THREE.Vector3(0, 0, 0) },
    { id: '3', name: 'Payment-Worker', type: 'service', status: 'healthy', load: 12, position: new THREE.Vector3(4, -2, 0) },
    { id: '4', name: 'Postgres-Main', type: 'database', status: 'healthy', load: 60, position: new THREE.Vector3(0, -4, 0) },
    { id: '5', name: 'Redis-Cache', type: 'database', status: 'healthy', load: 10, position: new THREE.Vector3(-4, -2, 0) },
  ]);

  const links: LinkData[] = useMemo(() => [
    { from: '1', to: '2' },
    { from: '2', to: '3' },
    { from: '2', to: '4' },
    { from: '2', to: '5' },
  ], []);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isChaosActive, setIsChaosActive] = useState(false);
  const [logs, setLogs] = useState<string[]>(['System initialized...', 'Telemetry stream active.']);
  const chaosIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 10));
  };

  useEffect(() => {
    return () => {
      if (chaosIntervalRef.current) clearInterval(chaosIntervalRef.current);
    };
  }, []);

  const triggerChaos = () => {
    if (isChaosActive) return;
    setIsChaosActive(true);
    addLog('CRITICAL: Chaos Engineering simulation started.');
    
    chaosIntervalRef.current = setInterval(() => {
      setNodes(prev => prev.map(node => {
        if (Math.random() > 0.7) {
          const newStatus = Math.random() > 0.5 ? 'critical' : 'warning';
          if (newStatus === 'critical') addLog(`ALERT: ${node.name} reporting failure.`);
          return { ...node, status: newStatus as any, load: Math.min(100, node.load + 30) };
        }
        return node;
      }));
    }, 2000);

    setTimeout(() => {
      if (chaosIntervalRef.current) {
        clearInterval(chaosIntervalRef.current);
        chaosIntervalRef.current = null;
      }
      setIsChaosActive(false);
      addLog('Chaos simulation complete. Recovery initiated.');
      setNodes(prev => prev.map(n => ({ ...n, status: 'healthy', load: Math.floor(Math.random() * 40) })));
    }, 10000);
  };

  const selectedNode = nodes.find(n => n.id === selectedId);

  return (
    <div className="h-screen w-full bg-[#020202] text-slate-300 font-mono flex flex-col overflow-hidden">
      {/* HUD Layer */}
      <div className="absolute inset-0 pointer-events-none z-50 p-8 flex flex-col justify-between">
        <header className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/20 border border-red-500/50 rounded flex items-center justify-center">
                <Activity className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tighter text-white uppercase">Vortex Observability</h1>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isChaosActive ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {isChaosActive ? 'Chaos Simulation Active' : 'System Nominal'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pointer-events-auto relative z-20">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                triggerChaos();
              }}
              disabled={isChaosActive}
              className={`px-6 py-2 border ${isChaosActive ? 'border-red-500/20 text-red-500/50' : 'border-red-500 text-red-500 hover:bg-red-500/10'} transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest`}
            >
              <ShieldAlert className="w-4 h-4" /> Trigger Chaos
            </button>
          </div>
        </header>

        <footer className="flex justify-between items-end">
          <div className="w-80 space-y-4 pointer-events-auto">
            <div className="p-4 bg-black/80 border border-white/5 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-3">
                <Terminal className="w-3 h-3 text-slate-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">System Logs</span>
              </div>
              <div className="space-y-1">
                {logs.map((log, i) => (
                  <div key={i} className="text-[9px] text-slate-400 font-mono flex gap-2">
                    <span className="text-slate-700">[{new Date().toLocaleTimeString()}]</span>
                    <span className={log.includes('CRITICAL') || log.includes('ALERT') ? 'text-red-400' : ''}>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-8">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Active Nodes</div>
              <div className="text-3xl font-bold text-white">{nodes.length}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Network Load</div>
              <div className="text-3xl font-bold text-emerald-500">
                {Math.round(nodes.reduce((a, b) => a + b.load, 0) / nodes.length)}%
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 cursor-move relative z-0">
        <Canvas shadows camera={{ position: [0, 0, 15], fov: 50 }}>
          <Suspense fallback={null}>
            <OrbitControls enablePan={false} maxDistance={25} minDistance={5} />
            
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} color="#4f46e5" intensity={0.5} />
            <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={1} castShadow />

            <group>
              {links.map((link, i) => {
                const from = nodes.find(n => n.id === link.from);
                const to = nodes.find(n => n.id === link.to);
                if (!from || !to) return null;
                return (
                  <group key={i}>
                    <Line
                      points={[
                        [from.position.x, from.position.y, from.position.z],
                        [to.position.x, to.position.y, to.position.z]
                      ]}
                      color={from.status === 'critical' ? '#ef4444' : from.status === 'warning' ? '#f59e0b' : '#10b981'}
                      lineWidth={1}
                      transparent
                      opacity={0.2}
                    />
                    {/* Telemetry Packets */}
                    <DataPacket from={from.position} to={to.position} speed={0.4 + Math.random() * 0.4} color={from.status === 'healthy' ? '#10b981' : '#f59e0b'} />
                    <DataPacket from={from.position} to={to.position} speed={0.2 + Math.random() * 0.3} color={from.status === 'healthy' ? '#10b981' : '#f59e0b'} />
                  </group>
                );
              })}

              {nodes.map(node => (
                <ServiceNode 
                  key={node.id} 
                  data={node} 
                  isSelected={selectedId === node.id}
                  onSelect={() => setSelectedId(node.id)}
                />
              ))}
            </group>
            
            <EffectComposer>
              <Bloom intensity={1.0} luminanceThreshold={0.2} luminanceSmoothing={0.9} />
              <Noise opacity={0.02} />
              <Vignette eskil={false} offset={0.1} darkness={1.1} />
            </EffectComposer>
          </Suspense>
        </Canvas>
      </div>

      {/* Inspector Sidebar */}
      <AnimatePresence>
        {selectedNode && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-black/90 border-l border-white/10 backdrop-blur-xl z-20 p-8 pointer-events-auto"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tighter">{selectedNode.name}</h2>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Node ID: {selectedNode.id}</span>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-slate-500 hover:text-white transition-colors">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Status</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    selectedNode.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-500' : 
                    selectedNode.status === 'warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {selectedNode.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                    <span>Resource Load</span>
                    <span>{selectedNode.load}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${selectedNode.load > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${selectedNode.load}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded">
                  <Cpu className="w-4 h-4 text-indigo-400 mb-2" />
                  <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">CPU Usage</div>
                  <div className="text-sm font-bold text-white">12.4%</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded">
                  <Database className="w-4 h-4 text-emerald-400 mb-2" />
                  <div className="text-[8px] font-bold text-slate-500 uppercase mb-1">Memory</div>
                  <div className="text-sm font-bold text-white">2.1 GB</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold uppercase text-slate-500 tracking-widest">Network Topology</h3>
                <div className="space-y-2">
                  {links.filter(l => l.from === selectedNode.id || l.to === selectedNode.id).map((l, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded text-[10px]">
                      <span className="text-slate-400">{nodes.find(n => n.id === (l.from === selectedNode.id ? l.to : l.from))?.name}</span>
                      <ArrowUpRight className="w-3 h-3 text-slate-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button className="w-full mt-12 py-3 bg-white text-black text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors">
              Inspect Traces
            </button>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
