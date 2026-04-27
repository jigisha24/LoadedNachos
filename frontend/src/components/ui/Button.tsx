import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  className = '', 
  variant = 'primary', 
  isLoading = false,
  disabled,
  ...props 
}: ButtonProps) {
  
  const baseStyles = "relative inline-flex items-center justify-center font-medium rounded-lg px-6 py-2.5 transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-neon-teal text-charcoal-950 hover:bg-[#00d0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.4)]",
    secondary: "bg-charcoal-800 text-white hover:bg-charcoal-700 hover:text-neon-green border border-charcoal-700",
    outline: "bg-transparent text-neon-teal border border-neon-teal hover:bg-neon-teal/10",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
      {children}
    </button>
  );
}
