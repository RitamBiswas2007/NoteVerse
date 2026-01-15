import { useState, useRef } from 'react';
import {
    Play,
    Pause,
    Volume2,
    CloudRain,
    Wind,
    BrainCircuit,
    Music,
    Upload,
    Trees
} from 'lucide-react';
import { useAudioGenerator } from '@/hooks/useAudioGenerator';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export function AmbientPlayer() {
    const { isPlaying, toggle, volume, setVolume, activeType, setType, handleFileUpload } = useAudioGenerator();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const sounds = [
        { id: 'rain', icon: CloudRain, label: 'Deep Rain' },
        { id: 'white-noise', icon: Wind, label: 'White Noise' },
        { id: 'forest', icon: Trees, label: 'Forest' },
        { id: 'binaural', icon: BrainCircuit, label: '432Hz Focus' },
    ] as const;

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className={cn(
                        "gap-2 transition-all duration-300",
                        isPlaying
                            ? "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 border border-indigo-500/20"
                            : "text-zinc-400 hover:text-white"
                    )}
                >
                    {isPlaying ? (
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            <span className="font-medium text-xs hidden sm:inline">Focus Audio</span>
                        </div>
                    ) : (
                        <Music className="w-4 h-4" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 glass-card border-white/10 shadow-2xl mr-4" align="end">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-2">
                        <Music className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-sm">Sonic Environment</h4>
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    {/* Play/Pause Main Control */}
                    <div className="flex items-center justify-center -mt-2 mb-2">
                        <Button
                            onClick={toggle}
                            className={cn(
                                "rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all",
                                isPlaying ? "bg-red-500 hover:bg-red-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"
                            )}
                        >
                            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                        </Button>
                    </div>

                    {/* Sound Grid */}
                    <div className="grid grid-cols-2 gap-2">
                        {sounds.map((sound) => (
                            <button
                                key={sound.id}
                                onClick={() => setType(sound.id)}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl text-xs transition-all border border-transparent",
                                    activeType === sound.id
                                        ? "bg-primary/10 text-primary border-primary/20"
                                        : "bg-zinc-900/50 hover:bg-zinc-900 text-zinc-400 border-white/5"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    activeType === sound.id ? "bg-primary/20" : "bg-white/5"
                                )}>
                                    <sound.icon className="w-4 h-4" />
                                </div>
                                <span className="font-medium">{sound.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Custom Upload */}
                    <div className="pt-2">
                        <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={onFileChange}
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                                "w-full border-dashed border-white/20 hover:border-primary/50 hover:bg-primary/5 text-zinc-400 hover:text-primary gap-2 h-10",
                                activeType === 'custom' && "border-primary text-primary bg-primary/5 border-solid"
                            )}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-3 h-3" />
                            {activeType === 'custom' ? 'Playing Custom Track' : 'Upload Custom Music'}
                        </Button>
                    </div>

                    {/* Volume Control */}
                    <div className="space-y-3 pt-2 border-t border-white/10">
                        <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            <span>Master Volume</span>
                            <span>{Math.round(volume * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Volume2 className="w-4 h-4 text-zinc-500" />
                            <Slider
                                value={[volume]}
                                max={1}
                                step={0.01}
                                onValueChange={([v]) => setVolume(v)}
                                className="cursor-pointer"
                            />
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
