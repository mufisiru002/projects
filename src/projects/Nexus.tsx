import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Play, 
  Plus, 
  Trash2, 
  Settings, 
  Code, 
  Share2, 
  Cpu, 
  Webhook, 
  Mail, 
  MessageSquare, 
  Clock, 
  ChevronRight,
  Activity,
  Layers,
  Save,
  MousePointer2
} from 'lucide-react';

// --- Types ---

type NodeType = 'trigger' | 'action' | 'logic';

interface Node {
  id: string;
  type: NodeType;
  label: string;
  icon: any;
  x: number;
  y: number;
  config: Record<string, any>;
  status: 'idle' | 'running' | 'success' | 'error';
}

interface Connection {
  id: string;
  fromId: string;
  toId: string;
}

// --- Constants ---

const NODE_TEMPLATES = {
  webhook: { type: 'trigger', label: 'Webhook', icon: Webhook, color: '#10B981' },
  schedule: { type: 'trigger', label: 'Schedule', icon: Clock, color: '#3B82F6' },
  email: { type: 'action', label: 'Send Email', icon: Mail, color: '#F59E0B' },
  slack: { type: 'action', label: 'Slack Msg', icon: MessageSquare, color: '#A855F7' },
  filter: { type: 'logic', label: 'Filter', icon: Layers, color: '#6366F1' },
  script: { type: 'logic', label: 'JS Script', icon: Code, color: '#EC4899' },
};

// --- Components ---

const ConnectionLine = ({ from, to, active }: { from: { x: number, y: number }, to: { x: number, y: number }, active?: boolean }) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const curvature = 0.5;
  const path = `M ${from.x} ${from.y} C ${from.x + dx * curvature} ${from.y}, ${to.x - dx * curvature} ${to.y}, ${to.x} ${to.y}`;

  return (
    <g>
      <path
        d={path}
        fill="none"
        stroke={active ? '#6366f1' : '#334155'}
        strokeWidth={2}
        className={active ? 'animate-pulse' : ''}
      />
      {active && (
        <motion.circle
          r={4}
          fill="#818cf8"
          initial={{ offsetDistance: "0%" }}
          animate={{ offsetDistance: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          style={{ offsetPath: `path("${path}")` }}
        />
      )}
    </g>
  );
};

export default function Nexus() {
  const [nodes, setNodes] = useState<Node[]>([
    { id: '1', type: 'trigger', label: 'Webhook', icon: Webhook, x: 100, y: 200, config: {}, status: 'idle' },
    { id: '2', type: 'logic', label: 'Filter', icon: Layers, x: 400, y: 200, config: {}, status: 'idle' },
    { id: '3', type: 'action', label: 'Slack Msg', icon: MessageSquare, x: 700, y: 200, config: {}, status: 'idle' },
  ]);
  const [connections, setConnections] = useState<Connection[]>([
    { id: 'c1', fromId: '1', toId: '2' },
    { id: 'c2', fromId: '2', toId: '3' },
  ]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeConnectionId, setActiveConnectionId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);

  const handleNodeDrag = (id: string, e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
  };

  const addNode = (templateKey: keyof typeof NODE_TEMPLATES) => {
    const template = NODE_TEMPLATES[templateKey];
    const newNode: Node = {
      id: Math.random().toString(36).substr(2, 9),
      ...template,
      type: template.type as NodeType,
      x: 100 + Math.random() * 100,
      y: 100 + Math.random() * 100,
      config: {},
      status: 'idle'
    };
    setNodes([...nodes, newNode]);
  };

  const runWorkflow = async () => {
    setIsRunning(true);
    // Simulate execution flow
    for (const conn of connections) {
      setActiveConnectionId(conn.id);
      setNodes(prev => prev.map(n => n.id === conn.fromId ? { ...n, status: 'success' } : n));
      await new Promise(r => setTimeout(r, 1500));
    }
    setNodes(prev => prev.map(n => n.id === connections[connections.length - 1].toId ? { ...n, status: 'success' } : n));
    setActiveConnectionId(null);
    setIsRunning(false);
    
    // Reset status after a delay
    setTimeout(() => {
      setNodes(prev => prev.map(n => ({ ...n, status: 'idle' })));
    }, 3000);
  };

  return (
    <div className="h-screen w-full bg-[#050505] text-slate-300 font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-white/5 bg-black/50 backdrop-blur-xl flex items-center justify-between px-8 relative z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 rotate-3">
            <Zap className="text-white w-6 h-6 fill-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Nexus Engine</h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">v2.4.0 Stable</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-colors">
            <Save className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/5 text-slate-500 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/10 mx-2" />
          <button 
            onClick={runWorkflow}
            disabled={isRunning}
            className={`px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
              isRunning 
              ? 'bg-indigo-500/20 text-indigo-400 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
            }`}
          >
            {isRunning ? <Activity className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {isRunning ? 'Executing...' : 'Run Workflow'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar: Node Palette */}
        <aside className="w-72 border-r border-white/5 bg-[#0a0a0a] p-6 flex flex-col gap-8 relative z-40">
          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-6">Triggers</h2>
            <div className="space-y-2">
              {Object.entries(NODE_TEMPLATES).filter(([_, t]) => t.type === 'trigger').map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => addNode(key as any)}
                  className="w-full p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 group-hover:scale-110 transition-transform">
                    <template.icon className="w-5 h-5" style={{ color: template.color }} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-200">{template.label}</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-tighter">Event Source</div>
                  </div>
                  <Plus className="w-4 h-4 ml-auto text-slate-700 group-hover:text-indigo-400" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-6">Actions</h2>
            <div className="space-y-2">
              {Object.entries(NODE_TEMPLATES).filter(([_, t]) => t.type === 'action').map(([key, template]) => (
                <button
                  key={key}
                  onClick={() => addNode(key as any)}
                  className="w-full p-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 group-hover:scale-110 transition-transform">
                    <template.icon className="w-5 h-5" style={{ color: template.color }} />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-200">{template.label}</div>
                    <div className="text-[9px] text-slate-500 uppercase tracking-tighter">Integration</div>
                  </div>
                  <Plus className="w-4 h-4 ml-auto text-slate-700 group-hover:text-indigo-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto p-5 rounded-3xl bg-indigo-500/5 border border-indigo-500/10">
            <div className="flex items-center gap-3 mb-3">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Engine Status</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-slate-500">Memory</span>
                <span className="text-slate-300">124MB / 512MB</span>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="w-1/4 h-full bg-indigo-500" />
              </div>
            </div>
          </div>
        </aside>

        {/* Canvas Area */}
        <main 
          ref={containerRef}
          className="flex-1 relative bg-[#050505] overflow-hidden cursor-crosshair"
          onMouseMove={(e) => dragNodeId && handleNodeDrag(dragNodeId, e)}
          onMouseUp={() => setDragNodeId(null)}
        >
          {/* Background Grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ 
            backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }} />

          {/* Connections SVG Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {connections.map(conn => {
              const fromNode = nodes.find(n => n.id === conn.fromId);
              const toNode = nodes.find(n => n.id === conn.toId);
              if (!fromNode || !toNode) return null;
              return (
                <ConnectionLine
                  key={conn.id}
                  from={{ x: fromNode.x + 180, y: fromNode.y + 40 }}
                  to={{ x: toNode.x, y: toNode.y + 40 }}
                  active={activeConnectionId === conn.id}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <motion.div
              key={node.id}
              initial={false}
              animate={{ x: node.x, y: node.y }}
              className={`absolute w-48 rounded-2xl border bg-[#0f0f0f] shadow-2xl cursor-grab active:cursor-grabbing z-10 ${
                selectedNodeId === node.id ? 'border-indigo-500 ring-1 ring-indigo-500/50' : 'border-white/10'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedNodeId(node.id);
              }}
              onMouseDown={() => setDragNodeId(node.id)}
            >
              <div className="p-4 flex items-center gap-3 border-b border-white/5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white/5`}>
                  <node.icon className="w-4 h-4" style={{ color: NODE_TEMPLATES[node.label.toLowerCase().replace(' ', '') as keyof typeof NODE_TEMPLATES]?.color || '#fff' }} />
                </div>
                <div className="text-[11px] font-bold text-slate-200 truncate">{node.label}</div>
                {node.status === 'success' && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                )}
              </div>
              <div className="p-3 flex justify-between items-center">
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="text-[8px] text-slate-600 uppercase tracking-widest font-bold">In / Out</div>
                <div className="w-2 h-2 rounded-full bg-indigo-500/50" />
              </div>
            </motion.div>
          ))}

          {/* Canvas HUD */}
          <div className="absolute bottom-8 left-8 flex gap-3">
            <div className="px-5 py-3 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 flex items-center gap-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <MousePointer2 className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Select Mode</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-3 opacity-40">
                <Layers className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Pan View</span>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar: Node Inspector */}
        <aside className="w-80 border-l border-white/5 bg-[#0a0a0a] p-8 z-40">
          <AnimatePresence mode="wait">
            {selectedNodeId ? (
              <motion.div
                key={selectedNodeId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-white">Node Config</h2>
                    <button className="p-2 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[9px] font-bold uppercase tracking-widest border border-indigo-500/20">
                      ID: {selectedNodeId}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-500 text-[9px] font-bold uppercase tracking-widest border border-white/10">
                      Active
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">Parameters</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Display Name</label>
                      <input 
                        type="text" 
                        className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                        placeholder="Enter name..."
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">Retry Strategy</label>
                      <div className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-400 flex justify-between items-center cursor-pointer hover:bg-white/[0.05]">
                        Exponential Backoff
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-4 flex items-center gap-2">
                    <Settings className="w-3 h-3" /> Advanced
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-600">Timeout</span>
                      <span className="text-xs font-mono text-slate-400">3000ms</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-600">Concurrency</span>
                      <span className="text-xs font-mono text-slate-400">10</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6">
                  <MousePointer2 className="w-8 h-8 text-slate-800" />
                </div>
                <h3 className="text-sm font-bold text-slate-400 mb-2">No Node Selected</h3>
                <p className="text-[10px] text-slate-600 leading-relaxed uppercase tracking-widest">
                  Select a node on the canvas to configure its execution parameters.
                </p>
              </div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </div>
  );
}
