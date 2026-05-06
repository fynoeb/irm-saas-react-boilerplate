import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  onClick?: () => void;
}

/**
 * GlassCard Component
 * 
 * A foundational UI layout primitive implementing a "Glassmorphism" aesthetic.
 * Utilizes backdrop-blur and semi-transparent borders for high-fidelity layering.
 * 
 * @param children - React nodes to be rendered within the container.
 * @param className - Optional CSS classes for custom geometric adjustments.
 * @param id - Optional unique identifier for DOM targeting.
 * @param onClick - Optional pointer event handler.
 */
export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', id, onClick }) => (
  <div 
    id={id}
    onClick={onClick}
    className={`glass rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] ${className}`}
  >
    {children}
  </div>
);
