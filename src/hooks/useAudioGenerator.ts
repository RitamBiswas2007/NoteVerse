import { useRef, useEffect, useState, useCallback } from 'react';

type SoundType = 'rain' | 'binaural' | 'white-noise' | 'forest';

export function useAudioGenerator() {
    const audioContext = useRef<AudioContext | null>(null);
    const gainNode = useRef<GainNode | null>(null);
    const sourceNode = useRef<AudioBufferSourceNode | OscillatorNode | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [activeType, setActiveType] = useState<SoundType | 'custom'>('rain');
    const [customBuffer, setCustomBuffer] = useState<AudioBuffer | null>(null);

    const initContext = () => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            gainNode.current = audioContext.current.createGain();
            gainNode.current.connect(audioContext.current.destination);
        } else if (audioContext.current.state === 'suspended') {
            audioContext.current.resume();
        }
    };

    const createNoiseBuffer = () => {
        if (!audioContext.current) return null;
        const bufferSize = 2 * audioContext.current.sampleRate;
        const buffer = audioContext.current.createBuffer(1, bufferSize, audioContext.current.sampleRate);
        const output = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5;
        }
        return buffer;
    };

    const handleFileUpload = async (file: File) => {
        // Stop current before decoding to prevent overlap noise/issues
        stop();
        initContext();
        if (!audioContext.current) return;

        try {
            const arrayBuffer = await file.arrayBuffer();
            const decodedBuffer = await audioContext.current.decodeAudioData(arrayBuffer);
            setCustomBuffer(decodedBuffer);
            setActiveType('custom');

            // Allow state to settle, then play
            // We'll call playSound('custom') explicitly effectively
            setTimeout(() => {
                if (activeType !== 'custom') setActiveType('custom');
                playCustom(decodedBuffer);
            }, 100);

        } catch (e) {
            console.error("Error decoding audio file:", e);
        }
    };

    const playCustom = (buffer: AudioBuffer) => {
        initContext();
        if (!audioContext.current || !gainNode.current) return;

        // Ensure disconnected
        if (sourceNode.current) {
            try { sourceNode.current.stop(); } catch (e) { }
            sourceNode.current.disconnect();
        }

        const source = audioContext.current.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gainNode.current);
        source.start();
        sourceNode.current = source;
        setIsPlaying(true);
    }

    const playSound = useCallback((type: SoundType | 'custom') => {
        initContext();
        if (!audioContext.current || !gainNode.current) return;

        // If custom, delegate
        if (type === 'custom') {
            if (customBuffer) {
                playCustom(customBuffer);
            }
            return;
        }

        // Stop current
        if (sourceNode.current) {
            try { sourceNode.current.stop(); } catch (e) { }
            sourceNode.current.disconnect();
            sourceNode.current = null;
        }

        gainNode.current.gain.setValueAtTime(volume, audioContext.current.currentTime);
        setActiveType(type);

        if (type === 'white-noise' || type === 'rain') {
            const buffer = createNoiseBuffer();
            if (!buffer) return;

            const noise = audioContext.current.createBufferSource();
            noise.buffer = buffer;
            noise.loop = true;

            // For rain, we add a lowpass filter
            if (type === 'rain') {
                const filter = audioContext.current.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.value = 400;
                noise.connect(filter);
                filter.connect(gainNode.current);
            } else {
                noise.connect(gainNode.current);
            }

            noise.start();
            sourceNode.current = noise;
        }
        else if (type === 'binaural') {
            // 40Hz Binaural Beat (Gamma for Focus) - approximated with single osc for simplicity here
            // Real binaural needs stereo separation. Let's do a simple 432Hz drone.
            const osc = audioContext.current.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 432;
            osc.connect(gainNode.current);
            osc.start();
            sourceNode.current = osc;
        } else if (type === 'forest') {
            // Placeholder for forest (using noise for now, typically needs assets)
            // Reusing rain logic but different filter for simplicity in procedural demo
            const buffer = createNoiseBuffer();
            if (buffer) {
                const noise = audioContext.current.createBufferSource();
                noise.buffer = buffer;
                noise.loop = true;
                const filter = audioContext.current.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.value = 800; // Hissing leaves
                noise.connect(filter);
                filter.connect(gainNode.current);
                noise.start();
                sourceNode.current = noise;
            }
        }

        setIsPlaying(true);
    }, [volume, customBuffer]);

    const stop = () => {
        if (sourceNode.current) {
            try { sourceNode.current.stop(); } catch (e) { }
            sourceNode.current.disconnect();
            sourceNode.current = null;
        }
        setIsPlaying(false);
    };

    const toggle = () => isPlaying ? stop() : playSound(activeType);

    useEffect(() => {
        if (gainNode.current && audioContext.current) {
            gainNode.current.gain.setValueAtTime(volume, audioContext.current.currentTime);
        }
    }, [volume]);

    return {
        isPlaying,
        toggle,
        volume,
        setVolume,
        activeType,
        setType: playSound,
        handleFileUpload
    };
}
