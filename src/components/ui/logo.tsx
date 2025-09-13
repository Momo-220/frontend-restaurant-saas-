import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIcon?: boolean;
  variant?: 'default' | 'white' | 'gradient';
}

export function Logo({ 
  className = '', 
  size = 'md', 
  showIcon = false, 
  variant = 'default' 
}: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'white':
        return 'text-white';
      case 'gradient':
        return 'text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600';
      default:
        return 'text-gray-900';
    }
  };

  const getIconVariantClasses = () => {
    switch (variant) {
      case 'white':
        return 'bg-white text-gray-900';
      case 'gradient':
        return 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white';
      default:
        return 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white';
    }
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showIcon && (
        <div className={`${iconSizes[size]} ${getIconVariantClasses()} rounded-lg flex items-center justify-center`}>
          <span 
            className={`${textSizes[size]} font-light`} 
            style={{ fontFamily: 'serif', fontWeight: 300 }}
          >
            N
          </span>
        </div>
      )}
      <span 
        className={`${sizeClasses[size]} font-light tracking-wide ${getVariantClasses()}`}
        style={{ fontFamily: 'serif', fontWeight: 300, letterSpacing: '0.1em' }}
      >
        NOMO
      </span>
    </div>
  );
}

export function LogoIcon({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  return (
    <div className={`${iconSizes[size]} bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center ${className}`}>
      <span 
        className={`${textSizes[size]} font-light text-white`} 
        style={{ fontFamily: 'serif', fontWeight: 300 }}
      >
        N
      </span>
    </div>
  );
}