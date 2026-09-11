import React from 'react';
import { Modal } from '../ui/Modal';
import { Logo } from './Logo';
import { Badge } from '../ui/Badge';
import { ShieldCheck, Code2, Sparkles, Cpu, Layers, Server, Database } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="System Specifications & Architecture"
      subtitle="Enterprise-grade Academic & Institutional Management Platform"
      maxWidth="lg"
    >
      <div className="space-y-6 text-zinc-300">
        <div className="flex flex-col items-center text-center p-6 bg-[#18181B]/80 rounded-xl border border-white/10">
          <Logo size="lg" showTagline={true} className="mb-2" />
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Badge variant="primary">v2.4.0 Commercial Release</Badge>
            <Badge variant="success">Role Security RBAC Active</Badge>
            <Badge variant="secondary">Smart Analytics Engine</Badge>
          </div>
        </div>

        <div className="space-y-3 text-sm leading-relaxed text-zinc-300">
          <p>
            <strong className="text-white">Smart Student Management System</strong> is a full-stack educational SaaS platform engineered to unify student records, faculty workflows, live QR attendance sessions, automated early academic warning indicators, and personalized study planning.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#18181B] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-400 uppercase tracking-[0.2em]">
            <Code2 className="w-4 h-4 text-[#C4A484]" />
            Engineering & Leadership
          </div>
          <div className="text-sm font-serif text-white">
            Developed by <span className="text-[#C4A484] font-semibold">Sonam Pal</span>
          </div>
          <p className="text-xs text-zinc-400">
            Institutional Administrator & Principal Developer. Designed for high scalability, zero-trust role security, and responsive touch UX.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl border border-white/10 bg-[#151518] flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-[#C4A484]" />
            <div>
              <div className="font-semibold text-white">React + Vite</div>
              <div className="text-zinc-500 text-[11px]">Frontend Engine</div>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-white/10 bg-[#151518] flex items-center gap-2.5">
            <Server className="w-4 h-4 text-[#C4A484]" />
            <div>
              <div className="font-semibold text-white">Node.js + Express</div>
              <div className="text-zinc-500 text-[11px]">RESTful APIs</div>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-white/10 bg-[#151518] flex items-center gap-2.5">
            <Database className="w-4 h-4 text-[#C4A484]" />
            <div>
              <div className="font-semibold text-white">MongoDB Schema</div>
              <div className="text-zinc-500 text-[11px]">Document Store</div>
            </div>
          </div>
          <div className="p-3 rounded-xl border border-white/10 bg-[#151518] flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#C4A484]" />
            <div>
              <div className="font-semibold text-white">JWT + bcrypt</div>
              <div className="text-zinc-500 text-[11px]">Zero-Trust RBAC</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
