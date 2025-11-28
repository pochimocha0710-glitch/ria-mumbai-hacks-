import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PillButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'accent';
    className?: string;
    icon?: LucideIcon;
    disabled?: boolean;
}

export const PillButton = ({ children, onClick, variant = 'primary', className = "", icon: Icon, disabled }: PillButtonProps) => {
    const base = "px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed";
    const styles = {
        primary: "bg-white text-zinc-950 hover:bg-zinc-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]",
        secondary: "bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700",
        accent: "bg-orange-600 text-white hover:bg-orange-500 shadow-[0_0_20px_-5px_rgba(234,88,12,0.3)]"
    };

    return (
        <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]} ${className}`}>
            {children}
            {Icon && (
                <div className={`p-1 rounded-full transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 ${variant === 'primary' ? 'bg-zinc-950 text-white' : 'bg-white/20'}`}>
                    <Icon className="w-3 h-3" />
                </div>
            )}
        </button>
    );
};
