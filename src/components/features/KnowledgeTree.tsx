import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Wind, Zap } from 'lucide-react';

interface KnowledgeTreeProps {
    activityScore: number; // 0 to 100
    streakDays: number;
}

const COLORS = {
    trunk: '#ffffff', // Pure white for max visibility check
    branch: '#22d3ee', // Cyan
    leaf: '#39ff14',   // Neon Green
    bloom: '#d946ef',  // Magenta
    energy: '#ffffff'
};

export function KnowledgeTree({ activityScore, streakDays }: KnowledgeTreeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [phase, setPhase] = useState<'growing' | 'blooming' | 'withered'>('growing');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Reset
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Parameters based on activity AND streak
        const treeSizeScore = activityScore + (streakDays * 8);
        const maxDepth = Math.max(5, Math.floor(treeSizeScore / 10));
        const branchAngle = Math.PI / (3 + (Math.random() * 2));
        const trunkHeight = canvas.height * 0.28;

        console.log("Initializing Tree:", { activityScore, streakDays, maxDepth, trunkHeight, width: canvas.width });

        // Animation loop variables
        let frame = 0;

        const drawTree = (startX: number, startY: number, length: number, angle: number, depth: number, width: number) => {
            ctx.beginPath();
            ctx.moveTo(startX, startY);

            const endX = startX + length * Math.cos(angle);
            const endY = startY + length * Math.sin(angle);

            ctx.lineTo(endX, endY);

            // Solid Color for High Visibility Check
            ctx.strokeStyle = depth === maxDepth ? COLORS.trunk : COLORS.branch;
            ctx.lineWidth = width;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Leaves/Blooms at tips
            if (depth <= 1 && (activityScore > 30 || streakDays >= 3)) {
                // Determine bloom size based on streak
                const size = 3 + (streakDays * 0.6);

                ctx.beginPath();
                ctx.arc(endX, endY, size, 0, Math.PI * 2);
                ctx.fillStyle = (activityScore > 80 || streakDays >= 5) ? COLORS.bloom : COLORS.leaf;

                // Glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = ctx.fillStyle;
                ctx.fill();
                ctx.shadowBlur = 0;

                // Occasional particle
                if (Math.random() > 0.95 && activityScore > 50) {
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(endX + (Math.random() * 10 - 5), endY + (Math.random() * 10 - 5), 1, 1);
                }
            }

            if (depth > 0) {
                const newLength = length * 0.75;
                // Sway effect with time
                const sway = Math.sin(frame * 0.02 + depth) * 0.05;

                drawTree(endX, endY, newLength, angle - branchAngle + sway, depth - 1, width * 0.7);
                drawTree(endX, endY, newLength, angle + branchAngle + sway, depth - 1, width * 0.7);
            }
        };

        const animate = () => {
            // Robust Resize Check
            if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frame++;

            // Root position
            const rootX = canvas.width / 2;
            const rootY = canvas.height;

            drawTree(rootX, rootY, trunkHeight, -Math.PI / 2, maxDepth, maxDepth * 1.5);

            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationId);
    }, [activityScore, streakDays]);

    return (
        <div className="relative w-full h-full min-h-[300px] rounded-2xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-black border border-white/5 overflow-hidden group">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
            <div className={`absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t ${activityScore > 50 ? 'from-indigo-900/20' : 'from-zinc-900/20'} to-transparent`} />

            {/* The Tree Canvas */}
            <canvas ref={canvasRef} className="w-full h-full relative z-10" />

            {/* Overlay UI */}
            <div className="absolute top-4 left-4 z-20">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                        <Leaf className="w-3 h-3" /> Habitat Status
                    </span>
                </div>
                <h3 className={`text-xl font-display font-bold ${activityScore > 50 || streakDays >= 3 ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600' : 'text-zinc-500'}`}>
                    {activityScore > 80 || streakDays >= 7 ? "Thriving Ecosystem" : activityScore > 40 || streakDays >= 3 ? "Steady Growth" : "Decaying"}
                </h3>
            </div>

            <div className="absolute top-4 right-4 z-20 flex flex-col items-end">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-white/10 backdrop-blur-md">
                    <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-mono font-bold text-white">{streakDays} Day Streak</span>
                </div>
            </div>

            {/* Hint */}
            <div className="absolute bottom-4 left-0 right-0 text-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-[10px] text-zinc-600 bg-black/50 px-2 py-1 rounded-full border border-white/5">
                    <Wind className="w-3 h-3 inline mr-1" />
                    Your activity fuels this tree. Keep studying to make it bloom.
                </span>
            </div>
        </div>
    );
}
