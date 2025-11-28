import React from 'react';

interface BentoCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverEffect?: boolean;
}

export const BentoCard = ({ children, className = "", onClick, hoverEffect = true }: BentoCardProps) => (
    <div
        onClick={onClick}
        className={`
      relative overflow-hidden bg-zinc-900/50 backdrop-blur-sm 
      border border-zinc-800/60 rounded-[2rem] 
      ${hoverEffect ? 'hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-500 cursor-pointer group' : ''}
      ${className}
    `}
    >
        {children}
    </div>
);
