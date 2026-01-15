import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function WinterTheme() {
    const [snowflakes, setSnowflakes] = useState<number[]>([]);

    useEffect(() => {
        // Generate static snowflake IDs
        setSnowflakes(Array.from({ length: 60 }).map((_, i) => i));
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden" aria-hidden="true">
            {/* 1. Background Ambience */}
            {/* Dark Mode: Midnight Aurora (Deep Navy/Cyan/Magenta) */}
            {/* 1. Background Ambience */}
            {/* Dark Mode: Midnight Aurora (Deep Navy/Cyan/Magenta Effects Only) */}
            <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-1000 bg-transparent">
                {/* Electric Cyan Beam */}
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[100%] bg-[radial-gradient(ellipse_at_center,rgba(0,255,255,0.1),transparent_60%)] animate-aurora mix-blend-screen filter blur-[90px]" />
                {/* Soft Magenta Glow */}
                <div className="absolute top-[10%] right-[-10%] w-[100%] h-[80%] bg-[radial-gradient(circle_at_center,rgba(199,125,255,0.08),transparent_50%)] animate-aurora-2 mix-blend-screen filter blur-[80px]" />
                {/* Deep Purple/Cyan Blend at Bottom */}
                <div className="absolute bottom-[0%] left-[20%] w-[100%] h-[50%] bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.08),transparent_70%)] animate-pulse-slow mix-blend-screen filter blur-[100px]" />
            </div>

            {/* Light Mode: Arctic Twilight (Royal Blue/Indigo) */}
            <div className="absolute inset-0 opacity-100 dark:opacity-0 transition-opacity duration-1000 bg-gradient-to-br from-blue-900/10 via-indigo-900/5 to-transparent">
                {/* Subtle "Blue Hour" Sky Gradient Overlay */}
                <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-blue-600/10 to-transparent filter blur-3xl" />
                {/* Warm Village Light Glow at Bottom */}
                <div className="absolute bottom-[-10%] right-[20%] w-[60%] h-[40%] bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.08),transparent_70%)] filter blur-[50px]" />
            </div>

            {/* 2. Falling Snowflakes */}
            {snowflakes.map((i) => {
                const left = Math.random() * 100;
                const animationDuration = 8 + Math.random() * 12; // Slower, more realistic fall (8-20s)
                const animationDelay = Math.random() * 5;
                const opacity = 0.4 + Math.random() * 0.6;
                const size = 3 + Math.random() * 5; // Mixed sizes for depth
                const isBlurry = Math.random() > 0.6; // 40% chance of being blurry (depth of field)

                return (
                    <div
                        key={i}
                        className={cn(
                            "absolute top-[-20px] rounded-full animate-snow",
                            "bg-white dark:bg-[#00FFFF] shadow-[0_0_4px_rgba(255,255,255,0.8)] dark:shadow-[0_0_8px_rgba(0,255,255,0.6)]", // Light: Pure White, Dark: Neon Cyan
                            isBlurry && "blur-[1.5px]"
                        )}
                        style={{
                            left: `${left}%`,
                            width: `${size}px`,
                            height: `${size}px`,
                            opacity: opacity,
                            animationName: 'snowfall',
                            animationDuration: `${animationDuration}s`,
                            animationTimingFunction: 'linear',
                            animationIterationCount: 'infinite',
                            animationDelay: `-${animationDelay}s`,
                            willChange: 'transform',
                        }}
                    />
                );
            })}

            {/* 3. Snow on Ground (Enhanced Realism) */}
            <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none">
                {/* Light Mode: Icy Blue-White Drift */}
                <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-blue-100/80 via-white/60 to-transparent opacity-100 dark:opacity-0 transition-opacity duration-1000 filter blur-xl" />
                <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-blue-50 to-transparent opacity-100 dark:opacity-0 blur-md" />

                {/* Dark Mode: Midnight Aurora Ground (Navy/Cyan Mist) */}
                <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-[#0B0F1A] via-[#1A233A] to-transparent opacity-0 dark:opacity-100 transition-opacity duration-1000 filter blur-2xl" />
                <div className="absolute bottom-0 w-full h-12 bg-gradient-to-t from-[#00FFFF]/10 to-transparent opacity-0 dark:opacity-80 blur-lg" />
            </div>

            <style>{`
                @keyframes snowfall {
                    0% { transform: translate(0, -20px); opacity: 0; }
                    10% { opacity: 1; transform: translate(-5px, 5vh); }
                    25% { transform: translate(10px, 25vh); }
                    50% { transform: translate(-10px, 50vh); opacity: 0.9; }
                    75% { transform: translate(8px, 75vh); }
                    100% { transform: translate(0, 105vh); opacity: 0.2; }
                }
                @keyframes aurora {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
                    50% { transform: translate(20px, -20px) scale(1.1); opacity: 0.8; }
                }
                @keyframes aurora-2 {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    50% { transform: translate(-30px, 10px) rotate(5deg); }
                }
            `}</style>
        </div>
    );
}
