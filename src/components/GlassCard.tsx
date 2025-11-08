import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function GlassCard({ children, className = '', style = {} }: GlassCardProps) {
  return (
    <div 
      className={`glass-card bg-white/70 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}