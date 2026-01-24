import { useState, useRef, useCallback } from 'react';

export const useAudioAnalysis = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const destinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);
    const auxSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const auxGainRef = useRef<GainNode | null>(null);
    const auxElementRef = useRef<HTMLMediaElement | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const initializeAudio = useCallback((audioElement: HTMLAudioElement) => {
        if (!audioElement) return;

        // If context exists, check if we can reuse the existing source
        // If context exists, check if we can reuse the existing source
        if (audioContextRef.current && sourceRef.current) {
            // Ensure state is ready.
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            // Proceed to verify connections below instead of returning early
        }

        const context = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;

        // Create Analyser & Destination if needed
        if (!analyserRef.current) {
            const analyser = context.createAnalyser();
            analyser.fftSize = 2048;
            analyserRef.current = analyser;
        }

        if (!destinationNodeRef.current) {
            const destinationNode = context.createMediaStreamDestination();
            destinationNodeRef.current = destinationNode;
        }

        // Re-connect static parts of the graph
        if (analyserRef.current && destinationNodeRef.current) {
            // Ensure analyser is connected to outputs
            try {
                // Disconnect first to avoid duplicate connections if re-initializing
                analyserRef.current.disconnect();
                analyserRef.current.connect(context.destination);
                analyserRef.current.connect(destinationNodeRef.current);
            } catch (e) {
                console.warn("Graph reconnection warning:", e);
            }
        }

        // Create/Connect Source
        try {
            // Only create source if not tracking this element
            if (!sourceRef.current) {
                const source = context.createMediaElementSource(audioElement);
                sourceRef.current = source;
            }

            // ALWAYS ensure connection (Aggressive Reconnect Strategy)
            // This fixes the issue where reusable nodes might silently detach on src change
            if (sourceRef.current && analyserRef.current) {
                try {
                    sourceRef.current.disconnect();
                } catch (e) { /* ignore if already disconnected */ }

                sourceRef.current.connect(analyserRef.current);
            }

        } catch (e) {
            console.error("Source connection failed:", e);
        }

        setIsInitialized(true);
    }, []);

    const resetAudioAnalysis = useCallback(() => {
        // Soft reset: Do NOT close context or disconnect source/destination.
        // We want the MediaStream to persist across song changes so MediaRecorder keeps working.
        // We only suspend context if needed, or just do nothing.
        // If we really need to "stop" analysis, we could disconnect the source from the analyser,
        // but since we reuse the same <audio> element, keeping it connected is fine.

        // We only clear auxiliary inputs here.
        if (auxGainRef.current) {
            auxGainRef.current.disconnect();
        }
        if (auxSourceRef.current) {
            auxSourceRef.current.disconnect();
        }
        auxGainRef.current = null;
        auxSourceRef.current = null;
        auxElementRef.current = null;

        // We DO NOT set isInitialized=false, because the primary graph remains valid.
    }, []);

    const setAuxMediaElement = useCallback((mediaElement: HTMLMediaElement | null, enabled: boolean) => {
        const context = audioContextRef.current;
        const destinationNode = destinationNodeRef.current;
        if (!context || !destinationNode) return;

        // If the element changed, tear down existing aux nodes and recreate for the new element.
        if (auxElementRef.current !== mediaElement) {
            try {
                if (auxGainRef.current) auxGainRef.current.disconnect();
                if (auxSourceRef.current) auxSourceRef.current.disconnect();
            } catch {
                // ignore
            }
            auxGainRef.current = null;
            auxSourceRef.current = null;
            auxElementRef.current = mediaElement;

            if (mediaElement) {
                try {
                    const src = context.createMediaElementSource(mediaElement);
                    const gain = context.createGain();
                    gain.gain.value = 1.0;
                    // Always connect source -> gain, then toggle gain's outputs.
                    src.connect(gain);
                    auxSourceRef.current = src;
                    auxGainRef.current = gain;
                } catch (e) {
                    console.warn('Failed to create aux MediaElementSourceNode:', e);
                    auxElementRef.current = null;
                }
            }
        }

        // Toggle mix outputs
        if (!auxGainRef.current) return;
        try {
            auxGainRef.current.disconnect();
        } catch {
            // ignore
        }

        if (enabled && auxGainRef.current && auxElementRef.current) {
            // Mix into speakers + recording stream, but DO NOT go through analyser (avoid affecting visuals)
            auxGainRef.current.connect(context.destination);
            auxGainRef.current.connect(destinationNode);
        }
    }, []);


    const getAudioStream = useCallback(() => {
        return destinationNodeRef.current?.stream ?? null;
    }, []);

    return {
        analyser: analyserRef.current,
        initializeAudio,
        isAudioInitialized: isInitialized,
        getAudioStream,
        setAuxMediaElement,
        resetAudioAnalysis,
    };
};