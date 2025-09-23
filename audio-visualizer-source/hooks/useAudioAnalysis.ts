import { useState, useRef, useCallback } from 'react';

export const useAudioAnalysis = () => {
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
    const destinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const initializeAudio = useCallback((audioElement: HTMLAudioElement) => {
        // Guard against re-initialization on the same audio setup
        if (isInitialized || !audioElement) return;

        // Creating a new context ensures a clean slate, preventing errors from
        // re-using a context that might be in a suspended or closed state.
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = context;

        // This can throw an InvalidStateError if the HTMLMediaElement is already connected
        // to a source node from a previous AudioContext that wasn't fully torn down.
        // The robust `resetAudioAnalysis` function is designed to prevent this.
        sourceRef.current = context.createMediaElementSource(audioElement);
        
        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;

        const destinationNode = context.createMediaStreamDestination();
        destinationNodeRef.current = destinationNode;

        // Connect the audio graph
        sourceRef.current.connect(analyser);
        analyser.connect(context.destination); // Play through speakers
        analyser.connect(destinationNode); // Send to stream for recording
        
        setIsInitialized(true);
    }, [isInitialized]);

    const resetAudioAnalysis = useCallback(() => {
        // Explicitly disconnect all nodes before closing the context. This is the
        // most robust way to prevent an 'InvalidStateError' when a new audio
        // file is loaded and a new audio graph needs to be created.
        if (sourceRef.current) {
            sourceRef.current.disconnect();
        }
        if (analyserRef.current) {
            analyserRef.current.disconnect();
        }

        // Close the existing AudioContext if it exists.
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close();
        }

        // Nullify refs to ensure they are re-created cleanly
        audioContextRef.current = null;
        analyserRef.current = null;
        sourceRef.current = null;
        destinationNodeRef.current = null;
        // Allow re-initialization
        setIsInitialized(false);
    }, []);


    const getAudioStream = useCallback(() => {
        return destinationNodeRef.current?.stream ?? null;
    }, []);

    return {
        analyser: analyserRef.current,
        initializeAudio,
        isAudioInitialized: isInitialized,
        getAudioStream,
        resetAudioAnalysis,
    };
};