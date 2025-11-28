import React, { useEffect, useRef } from 'react';

interface AgenticLoaderProps {
    onComplete: () => void;
}

export const AgenticLoader = ({ onComplete }: AgenticLoaderProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const nodes = Array.from({ length: 50 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5
        }));

        let progress = 0;
        let animationFrame: number;

        const render = () => {
            ctx.fillStyle = '#09090b'; // Zinc 950
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = `rgba(255, 255, 255, 0.15)`;
            ctx.lineWidth = 1;

            // Draw Grid
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                node.x += node.vx;
                node.y += node.vy;

                if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
                if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

                ctx.fillStyle = i < (nodes.length * (progress / 100)) ? '#f97316' : '#27272a'; // Orange vs Zinc
                ctx.beginPath();
                ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            progress += 1;

            // Text
            ctx.fillStyle = 'white';
            ctx.font = '700 32px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("Initialising Agent...", canvas.width / 2, canvas.height / 2);

            if (progress < 120) {
                animationFrame = requestAnimationFrame(render);
            } else {
                onComplete();
            }
        };
        render();
        return () => cancelAnimationFrame(animationFrame);
    }, [onComplete]);

    return <canvas ref={canvasRef} className="fixed inset-0 z-[60]" />;
};
