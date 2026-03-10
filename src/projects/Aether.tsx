/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Stage, Layer, Rect, Text, Circle, Line, Group } from 'react-konva';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { 
  Cloud, 
  Database, 
  Server, 
  Cpu, 
  HardDrive, 
  Zap, 
  Code, 
  Download, 
  Trash2, 
  Plus, 
  MousePointer2,
  DollarSign,
  Layers,
  ChevronRight,
  Info,
  Terminal,
  X
} from 'lucide-react';

// --- Types ---

interface Resource {
  id: string;
  type: 'EC2' | 'RDS' | 'S3' | 'Lambda';
  name: string;
  x: number;
  y: number;
  cost: number;
  specs: string;
}

interface RemoteUser {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
}

// --- Constants ---

const RESOURCE_TYPES = {
  EC2: { icon: Server, color: '#FF9900', baseCost: 45, specs: 't3.medium' },
  RDS: { icon: Database, color: '#3B82F6', baseCost: 80, specs: 'db.t3.small' },
  S3: { icon: HardDrive, color: '#10B981', baseCost: 5, specs: 'Standard' },
  Lambda: { icon: Zap, color: '#A855F7', baseCost: 0.2, specs: '128MB' },
};

const COLORS = ['#F43F5E', '#3B82F6', '#10B981', '#A855F7', '#F59E0B'];

// --- Components ---

const BlueprintGrid = ({ width, height }: { width: number; height: number }) => {
  const lines = [];
  const spacing = 40;
  for (let i = 0; i < width / spacing; i++) {
    lines.push(<Line key={`v${i}`} points={[i * spacing, 0, i * spacing, height]} stroke="#1e293b" strokeWidth={1} />);
  }
  for (let i = 0; i < height / spacing; i++) {
    lines.push(<Line key={`h${i}`} points={[0, i * spacing, width, i * spacing]} stroke="#1e293b" strokeWidth={1} />);
  }
  return <Group opacity={0.5}>{lines}</Group>;
};

export default function Aether() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });

  // Handle Resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth || 1000,
          height: containerRef.current.offsetHeight || 800,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Socket Connection
  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    const myColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const myName = `User-${Math.floor(Math.random() * 1000)}`;

    newSocket.on('connect', () => {
      newSocket.emit('join', { name: myName, color: myColor, x: 0, y: 0 });
    });

    newSocket.on('init', ({ resources: initialResources }) => {
      setResources(initialResources);
    });

    newSocket.on('users:update', (users: any) => {
      setRemoteUsers(users.filter((u: any) => u.id !== newSocket.id));
    });

    newSocket.on('resource:added', (resource: any) => {
      setResources(prev => [...prev, resource]);
    });

    newSocket.on('resource:moved', ({ id, x, y }: any) => {
      setResources(prev => prev.map(r => r.id === id ? { ...r, x, y } : r));
    });

    newSocket.on('resource:deleted', (id: any) => {
      setResources(prev => prev.filter(r => r.id !== id));
      setSelectedId(prev => prev === id ? null : prev);
    });

    newSocket.on('cursor:moved', ({ id, x, y }: any) => {
      setRemoteUsers(prev => prev.map(u => u.id === id ? { ...u, x, y } : u));
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const totalCost = useMemo(() => resources.reduce((acc, r) => acc + r.cost, 0), [resources]);

  const addResource = (type: keyof typeof RESOURCE_TYPES) => {
    const newResource: Resource = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      name: `${type}-${resources.length + 1}`,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      cost: RESOURCE_TYPES[type].baseCost,
      specs: RESOURCE_TYPES[type].specs,
    };
    setResources(prev => [...prev, newResource]);
    setSelectedId(newResource.id);
    socket?.emit('resource:add', newResource);
  };

  const handleDragEnd = (id: string, e: any) => {
    const x = e.target.x();
    const y = e.target.y();
    setResources(prev => prev.map(r => r.id === id ? { ...r, x, y } : r));
    socket?.emit('resource:move', { id, x, y });
  };

  const deleteResource = () => {
    if (selectedId) {
      setResources(prev => prev.filter(r => r.id !== selectedId));
      socket?.emit('resource:delete', selectedId);
      setSelectedId(null);
    }
  };

  const handleMouseMove = (e: any) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    if (pos) {
      socket?.emit('cursor:move', pos);
    }
  };

  const generateTerraform = () => {
    let tf = '';
    resources.forEach(res => {
      if (res.type === 'EC2') {
        tf += `resource "aws_instance" "${res.name.toLowerCase().replace(/-/g, '_')}" {\n  ami           = "ami-0c55b159cbfafe1f0"\n  instance_type = "${res.specs}"\n  tags = {\n    Name = "${res.name}"\n  }\n}\n\n`;
      } else if (res.type === 'RDS') {
        tf += `resource "aws_db_instance" "${res.name.toLowerCase().replace(/-/g, '_')}" {\n  allocated_storage    = 20\n  engine               = "postgres"\n  instance_class       = "${res.specs}"\n  name                 = "${res.name.replace(/-/g, '_')}"\n  skip_final_snapshot  = true\n}\n\n`;
      } else if (res.type === 'S3') {
        tf += `resource "aws_s3_bucket" "${res.name.toLowerCase().replace(/-/g, '_')}" {\n  bucket = "${res.name.toLowerCase()}"\n  acl    = "private"\n}\n\n`;
      } else if (res.type === 'Lambda') {
        tf += `resource "aws_lambda_function" "${res.name.toLowerCase().replace(/-/g, '_')}" {\n  function_name = "${res.name}"\n  role          = aws_iam_role.iam_for_lambda.arn\n  handler       = "index.handler"\n  runtime       = "nodejs18.x"\n}\n\n`;
      }
    });
    return tf || '# No resources to export';
  };

  const selectedResource = resources.find(r => r.id === selectedId);

  return (
    <div className="h-screen w-full bg-[#0f172a] text-slate-200 font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between px-6 relative z-30">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Cloud className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">Aether Architect</h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Live Session: {remoteUsers.length + 1} Users</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex -space-x-2 mr-4">
            {remoteUsers.map(user => (
              <div 
                key={user.id} 
                className="w-7 h-7 rounded-full border-2 border-[#0f172a] flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.name[0]}
              </div>
            ))}
            <div className="w-7 h-7 rounded-full border-2 border-[#0f172a] bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
              ME
            </div>
          </div>
          
          <button 
            onClick={() => setIsExporting(true)}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <Code className="w-3.5 h-3.5" /> Export IaC
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Resource Library */}
        <aside className="w-64 border-r border-slate-800 bg-[#0f172a] p-4 flex flex-col gap-6 relative z-20">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4">Resource Library</h2>
            <div className="grid grid-cols-1 gap-2">
              {(Object.entries(RESOURCE_TYPES) as [keyof typeof RESOURCE_TYPES, any][]).map(([type, config]) => (
                <button
                  key={type}
                  onClick={() => addResource(type)}
                  className="w-full p-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex items-center gap-3 group"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${config.color}20` }}>
                    <config.icon className="w-4 h-4" style={{ color: config.color }} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-300 group-hover:text-white">{type}</div>
                    <div className="text-[9px] text-slate-600 uppercase tracking-tighter">AWS Managed</div>
                  </div>
                  <Plus className="w-3 h-3 ml-auto text-slate-700 group-hover:text-indigo-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Monthly Projection</span>
              <DollarSign className="w-3 h-3 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">${totalCost.toFixed(2)}</div>
            <p className="text-[9px] text-slate-500 mt-1 italic">Based on on-demand pricing</p>
          </div>
        </aside>

        {/* Canvas Area */}
        <main ref={containerRef} className="flex-1 relative bg-[#0f172a] cursor-crosshair">
          <Stage 
            width={dimensions.width} 
            height={dimensions.height} 
            ref={stageRef}
            onMouseMove={handleMouseMove}
          >
            <Layer>
              <BlueprintGrid width={dimensions.width} height={dimensions.height} />
              
              {/* Connections (Simple logic for now: connect all to first EC2 if exists) */}
              {resources.length > 1 && resources.filter(r => r.id !== resources[0].id).map(res => (
                <Line
                  key={`conn-${res.id}`}
                  points={[resources[0].x + 40, resources[0].y + 40, res.x + 40, res.y + 40]}
                  stroke="#475569"
                  strokeWidth={2}
                  dash={[10, 5]}
                  opacity={0.3}
                />
              ))}

              {/* Resources */}
              {resources.map(res => {
                const config = RESOURCE_TYPES[res.type];
                return (
                  <Group
                    key={res.id}
                    x={res.x}
                    y={res.y}
                    draggable
                    onDragEnd={(e) => handleDragEnd(res.id, e)}
                    onClick={() => setSelectedId(res.id)}
                  >
                    <Rect
                      width={80}
                      height={80}
                      fill="#1e293b"
                      cornerRadius={12}
                      stroke={selectedId === res.id ? '#6366f1' : '#334155'}
                      strokeWidth={selectedId === res.id ? 2 : 1}
                      shadowBlur={selectedId === res.id ? 15 : 0}
                      shadowColor="#6366f1"
                    />
                    <Text
                      text={res.type}
                      x={0}
                      y={85}
                      width={80}
                      align="center"
                      fill={selectedId === res.id ? '#fff' : '#64748b'}
                      fontSize={10}
                      fontStyle="bold"
                    />
                    <Circle x={40} y={40} radius={20} fill={`${config.color}20`} />
                    <Circle x={40} y={40} radius={8} fill={config.color} />
                  </Group>
                );
              })}

              {/* Remote Cursors */}
              {remoteUsers.map(user => (
                <Group key={user.id} x={user.x} y={user.y}>
                  <Circle radius={4} fill={user.color} />
                  <Rect x={8} y={8} width={40} height={14} fill={user.color} cornerRadius={4} />
                  <Text text={user.name} x={12} y={11} fill="#fff" fontSize={8} fontStyle="bold" />
                </Group>
              ))}
            </Layer>
          </Stage>

          {/* Canvas Floating Controls */}
          <div className="absolute bottom-6 left-6 flex gap-2">
            <div className="px-4 py-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-800 flex items-center gap-4 shadow-xl">
              <div className="flex items-center gap-2">
                <MousePointer2 className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Select</span>
              </div>
              <div className="w-px h-4 bg-slate-800" />
              <div className="flex items-center gap-2 opacity-50">
                <Layers className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Pan</span>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Properties */}
        <aside className="w-72 border-l border-slate-800 bg-[#0f172a] p-6 z-20">
          <AnimatePresence mode="wait">
            {selectedResource ? (
              <motion.div
                key={selectedResource.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-bold text-white">{selectedResource.name}</h2>
                    <button onClick={deleteResource} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[9px] font-bold uppercase tracking-widest border border-indigo-500/20">
                    {selectedResource.type} Resource
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Configuration</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-600 font-bold uppercase">Instance Type</label>
                      <div className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 flex justify-between items-center">
                        {selectedResource.specs}
                        <ChevronRight className="w-3 h-3 text-slate-600" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-600 font-bold uppercase">Region</label>
                      <div className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                        us-east-1
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
                  <h3 className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-amber-400" /> Performance Metrics
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-600">Est. Latency</span>
                      <span className="text-xs font-mono text-slate-300">12ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-600">Availability</span>
                      <span className="text-xs font-mono text-emerald-400">99.99%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4">
                  <Info className="w-6 h-6 text-slate-700" />
                </div>
                <h3 className="text-sm font-bold text-slate-400 mb-2">No Resource Selected</h3>
                <p className="text-[10px] text-slate-600 leading-relaxed uppercase tracking-tight">
                  Select a node on the canvas to view and edit infrastructure properties.
                </p>
              </div>
            )}
          </AnimatePresence>
        </aside>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {isExporting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-bold">Terraform Export</h2>
                </div>
                <button onClick={() => setIsExporting(false)} className="p-2 rounded-full hover:bg-white/5 text-slate-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 bg-black/40 font-mono text-[11px] text-indigo-300 overflow-y-auto max-h-[400px]">
                <pre className="whitespace-pre-wrap">
                  {generateTerraform()}
                </pre>
              </div>
              <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
                <button onClick={() => setIsExporting(false)} className="px-6 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button className="px-6 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2">
                  <Download className="w-3.5 h-3.5" /> Download .tf
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
