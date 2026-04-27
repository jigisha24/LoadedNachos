import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
}

export function Card({ children, className = '', glow = false, ...props }: CardProps) {
  return (
    <div
      className={`bg-charcoal-900 border border-charcoal-800 rounded-xl p-6 shadow-lg transition-all duration-300 ${
        glow ? 'hover:border-neon-teal/50 hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]' : 'hover:border-charcoal-700'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
