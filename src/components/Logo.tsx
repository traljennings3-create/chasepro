import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="8" />
      <path 
        d="M50 20V80M30 40H70" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round" 
      />
      <path 
        d="M35 60L50 80L65 60" 
        stroke="currentColor" 
        strokeWidth="8" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      {/* Subtle dollar sign negative space inspired logo */}
      <circle cx="50" cy="50" r="48" fill="transparent" />
      <text 
        x="50" 
        y="68" 
        textAnchor="middle" 
        className="font-display text-4xl" 
        fill="currentColor"
        style={{ fontSize: '40px', fontWeight: 'bold' }}
      >$</text>
    </svg>
  );
};
