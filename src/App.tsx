import React, { useState, useEffect } from 'react';
import Aether from './projects/Aether';
import Nexus from './projects/Nexus';
import Vortex from './projects/Vortex';
import { 
  Layers, 
  Zap, 
  ChevronRight, 
  Layout, 
  Cpu, 
  Terminal,
  ExternalLink,
  Activity,
  ArrowRight,
  Download,
  Github,
  Linkedin,
  Monitor,
  Box,
  Workflow
} from 'lucide-react';

const PROJECTS = [
  { 
    id: 'vortex', 
    name: 'Vortex Observability', 
    description: '3D Real-time Distributed System Observability & Chaos Engineering Dashboard', 
    icon: Activity, 
    color: '#ef4444',
    tag: '3D / Telemetry',
    component: Vortex 
  },
  { 
    id: 'nexus', 
    name: 'Nexus Engine', 
    description: 'Visual Logic Flow & Automation Engine with Real-time Execution Tracing', 
    icon: Workflow, 
    color: '#f59e0b',
    tag: 'Automation / Logic',
    component: Nexus 
  },
  { 
    id: 'aether', 
    name: 'Aether Architect', 
    description: 'Collaborative Cloud Topology Designer with Live Cost Engine & IaC Export', 
    icon: Box, 
    color: '#06b6d4',
    tag: 'Cloud / Collaboration',
    component: Aether 
  },
];

export default function App() {
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (currentProject) {
    const Project = PROJECTS.find(p => p.id === currentProject)?.component || Nexus;
    return (
      <div className="relative h-screen w-full overflow-hidden">
        <Project />
        <button 
          onClick={() => setCurrentProject(null)}
          className="fixed bottom-8 right-8 z-[100] px-6 py-3 rounded-none bg-black border border-white/20 text-[10px] font-bold text-white hover:bg-white hover:text-black flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] transition-all active:translate-x-1 active:translate-y-1 active:shadow-none uppercase tracking-widest"
        >
          <Layout className="w-4 h-4" /> Exit to Lab
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#050505] text-slate-300 font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden">
      {/* Technical Grid Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{ 
        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
        backgroundSize: '40px 40px' 
      }} />
      
      {/* Dynamic Spotlight */}
      <div 
        className="fixed inset-0 pointer-events-none transition-opacity duration-1000"
        style={{ 
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(245, 158, 11, 0.03), transparent 80%)` 
        }}
      />

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24 relative z-10 pointer-events-auto">
        {/* Navigation / Meta */}
        <nav className="flex justify-between items-center mb-24 relative z-[100]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-black text-lg">L</div>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-white">Engineering Lab</span>
          </div>
          <div className="hidden md:flex gap-12">
            <button onClick={() => document.getElementById('projects-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors cursor-pointer">Projects</button>
            <button onClick={() => document.getElementById('capabilities-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors cursor-pointer">Capabilities</button>
            <button onClick={() => document.getElementById('footer-section')?.scrollIntoView({ behavior: 'smooth' })} className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors cursor-pointer">Contact</button>
          </div>
          <button 
            onClick={() => alert('Resume download initiated (demo)')}
            className="px-5 py-2 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all cursor-pointer relative z-[110]"
          >
            Resume.pdf
          </button>
        </nav>

        {/* Hero Section */}
        <header className="mb-32 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">Available for New Challenges</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-bold text-white tracking-tighter leading-[0.85] mb-12">
            CRAFTING <br />
            <span className="text-slate-700">DIGITAL</span> <br />
            SYSTEMS.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
            A specialized laboratory focused on high-performance frontend engineering, 
            real-time distributed systems, and advanced visual computing.
          </p>
        </header>

        {/* Project Grid - Brutalist Style */}
        <div id="projects-section" className="grid grid-cols-1 gap-px bg-white/10 border border-white/10 mb-32 relative z-20">
          {PROJECTS.map((project, idx) => (
            <button 
              key={project.id}
              onClick={() => {
                console.log('Selecting project:', project.id);
                setCurrentProject(project.id);
              }}
              className="group relative bg-[#050505] p-12 md:p-20 transition-all cursor-pointer overflow-hidden hover:bg-[#0a0a0a] active:scale-[0.98] text-left w-full block border-none outline-none"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-12 relative z-10 pointer-events-none">
                <div className="flex-1 space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-amber-500 font-bold">0{idx + 1}</span>
                    <div className="h-px w-8 bg-amber-500/30" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{project.tag}</span>
                  </div>
                  
                  <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight group-hover:text-amber-500 transition-colors duration-500">
                    {project.name}
                  </h2>
                  
                  <p className="text-slate-500 text-lg max-w-xl leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {['React 19', 'TypeScript', 'Tailwind', 'Real-time'].map(tag => (
                      <span key={tag} className="px-3 py-1 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-8">
                  <div className="w-24 h-24 md:w-32 md:h-32 border border-white/10 flex items-center justify-center group-hover:border-amber-500/50 group-hover:scale-110 transition-all duration-700">
                    <project.icon className="w-10 h-10 md:w-12 md:h-12 text-slate-700 group-hover:text-amber-500 transition-colors" />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 group-hover:text-white transition-colors">
                    View Project <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Background Number */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 text-[20vw] font-black text-white/[0.02] pointer-events-none select-none">
                0{idx + 1}
              </div>
            </button>
          ))}
        </div>

        {/* Capabilities Section */}
        <section id="capabilities-section" className="mb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-12 h-12 border border-white/10 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Visual Computing</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Advanced 2D/3D rendering using Konva.js and Three.js for complex data visualization and interactive environments.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 border border-white/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Real-time Systems</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Low-latency synchronization using WebSockets and Socket.io for collaborative multi-user experiences.
              </p>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 border border-white/10 flex items-center justify-center">
                <Terminal className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">System Architecture</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Robust frontend architecture with React 19, focusing on performance, scalability, and clean state management.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="footer-section" className="pt-24 border-t border-white/10 relative z-30">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div className="space-y-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-white">Engineering Lab</div>
              <p className="text-xs text-slate-600 max-w-xs">
                Pushing the boundaries of what's possible on the web through experimentation and precision engineering.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-8 md:gap-16">
              <div className="space-y-4">
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Social</div>
                <div className="flex gap-6">
                  <a href="#" className="text-slate-400 hover:text-amber-500 transition-colors"><Github className="w-5 h-5" /></a>
                  <a href="#" className="text-slate-400 hover:text-amber-500 transition-colors"><Linkedin className="w-5 h-5" /></a>
                </div>
              </div>
              <div className="space-y-4">
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Download</div>
                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white hover:text-amber-500 transition-colors">
                  <Download className="w-4 h-4" /> Full Source Code
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-24 flex justify-between items-center text-[9px] font-bold uppercase tracking-[0.3em] text-slate-800">
            <span>© 2026 LAB_SYSTEMS</span>
            <span>EST. 2024</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
