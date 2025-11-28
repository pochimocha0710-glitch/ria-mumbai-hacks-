import React from 'react';

export const GridPattern = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
                backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }}
        />
    </div>
);
