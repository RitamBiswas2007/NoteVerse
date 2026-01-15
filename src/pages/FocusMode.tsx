import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Maximize,
    Minimize,
    Play,
    Pause,
    RotateCcw,
    Volume2,
    VolumeX,
    ArrowLeft,
    Moon,
    Sun,
    Music,
    Tv
} from "lucide-react";
import screenfull from "screenfull";
import { motion, AnimatePresence } from "framer-motion";
import { SEO } from "@/components/layout/SEO";
import { toast } from "sonner";

// Ambient Tracks (Using reliable public domain/creative commons placeholders)
const AMBIENT_TRACKS = [
    { id: 'rain', name: 'Gentle Rain', url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_052e008104.mp3?filename=rain-11234.mp3' },
    { id: 'forest', name: 'Forest Birds', url: 'https://cdn.pixabay.com/download/audio/2022/02/07/audio_658686d1a4.mp3?filename=forest-birds-11440.mp3' },
    { id: 'piano', name: 'Soft Piano', url: 'https://cdn.pixabay.com/download/audio/2022/03/09/audio_c8c8a73467.mp3?filename=relaxing-piano-music-11438.mp3' }
];

export default function FocusMode() {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isTimerActive, setIsTimerActive] = useState(false);
    const [timerMode, setTimerMode] = useState<'focus' | 'break'>('focus');
    const [content, setContent] = useState("");

    // Audio State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(AMBIENT_TRACKS[0]);
    const [volume, setVolume] = useState([0.5]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (screenfull.isEnabled) {
            screenfull.on("change", () => setIsFullscreen(screenfull.isFullscreen));
        }
        return () => {
            if (screenfull.isEnabled) {
                screenfull.off("change", () => setIsFullscreen(screenfull.isFullscreen));
            }
        };
    }, []);

    // Timer Logic
    useEffect(() => {
        let interval: any;
        if (isTimerActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        } else if (timeLeft === 0) {
            setIsTimerActive(false);
            const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
            audio.play().catch(e => console.error(e));
            toast.success(timerMode === 'focus' ? "Focus session complete! Take a break." : "Break over! Time to focus.");
        }
        return () => clearInterval(interval);
    }, [isTimerActive, timeLeft, timerMode]);

    // Audio Logic
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume[0];
            if (isPlaying) {
                audioRef.current.play().catch(() => setIsPlaying(false));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, volume, currentTrack]);

    const toggleFullscreen = () => {
        if (screenfull.isEnabled) {
            screenfull.toggle();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const toggleTimer = () => setIsTimerActive(!isTimerActive);

    const resetTimer = () => {
        setIsTimerActive(false);
        setTimeLeft(timerMode === 'focus' ? 25 * 60 : 5 * 60);
    };

    const switchMode = () => {
        const newMode = timerMode === 'focus' ? 'break' : 'focus';
        setTimerMode(newMode);
        setTimeLeft(newMode === 'focus' ? 25 * 60 : 5 * 60);
        setIsTimerActive(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30">
            <SEO title="Focus Flow | NoteVerse" description="Distraction-free writing and study environment." />

            {/* Hidden Audio Element */}
            <audio
                ref={audioRef}
                src={currentTrack.url}
                loop
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
            />

            {/* Top Bar */}
            <motion.header
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50"
            >
                <div className="flex items-center gap-4">
                    <Link to="/dashboard">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-white/10 mx-2" />
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Tv className="w-4 h-4 text-indigo-400" />
                        <span>Focus Flow</span>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Timer Controls */}
                    <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-1.5 border border-white/5">
                        <span className={`text-xs font-bold uppercase tracking-wider ${timerMode === 'focus' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                            {timerMode}
                        </span>
                        <span className="font-mono text-lg font-medium w-16 text-center">{formatTime(timeLeft)}</span>
                        <div className="flex gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full hover:bg-white/10"
                                onClick={toggleTimer}
                            >
                                {isTimerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-full hover:bg-white/10"
                                onClick={resetTimer}
                            >
                                <RotateCcw className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Audio Controls */}
                    <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-1.5 border border-white/5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className={`h-7 w-7 rounded-full ${isPlaying ? 'text-indigo-400 bg-indigo-500/10' : 'hover:bg-white/10'}`}
                            onClick={() => setIsPlaying(!isPlaying)}
                        >
                            <Music className="w-3.5 h-3.5" />
                        </Button>

                        <div className="w-24 px-2">
                            <Slider
                                value={volume}
                                max={1}
                                step={0.01}
                                onValueChange={setVolume}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleFullscreen}
                        className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
                    >
                        {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                    </Button>
                </div>
            </motion.header>

            {/* Main Content */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
                {/* Ambient Background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/5 via-slate-950 to-slate-950" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/5 rounded-full blur-[120px] animate-pulse-slow" />
                </div>

                <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full p-8 md:p-12">
                    <textarea
                        className="flex-1 w-full bg-transparent border-none resize-none focus:ring-0 text-xl md:text-2xl leading-relaxed text-slate-300 placeholder:text-slate-700 font-serif outline-none tracking-wide"
                        placeholder="Start writing... clear your mind..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        spellCheck={false}
                        autoFocus
                    />

                    <div className="flex justify-between items-center text-xs text-slate-600 mt-4 font-mono uppercase tracking-widest border-t border-white/5 pt-4">
                        <span>{content.split(/\s+/).filter(Boolean).length} words</span>
                        <span>{content.length} chars</span>
                    </div>
                </div>
            </main>

            {/* Track Selector Overlay (Bottom Right) */}
            <div className="absolute bottom-6 right-6 z-50">
                <div className="bg-black/40 backdrop-blur-md border border-white/5 rounded-2xl p-2 flex flex-col gap-1">
                    {AMBIENT_TRACKS.map(track => (
                        <button
                            key={track.id}
                            onClick={() => {
                                setCurrentTrack(track);
                                setIsPlaying(true);
                            }}
                            className={`text-xs font-medium px-3 py-2 rounded-xl text-left transition-all ${currentTrack.id === track.id ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                        >
                            {track.name}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
}
