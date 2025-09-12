import React from 'react';

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-lg">🍽️</span>
      </div>
      <div>
        <span className="text-2xl font-black text-white">NOMO</span>
        <p className="text-xs text-white/80 font-medium -mt-1">Restaurant SaaS</p>
      </div>
    </div>
  );
}

export function LogoFooter({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
        <span className="text-white font-bold text-sm">🍽️</span>
      </div>
      <span className="text-xl font-black text-white">NOMO</span>
    </div>
  );
}