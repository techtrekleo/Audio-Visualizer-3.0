
import { useState, useRef, useCallback } from 'react';

// The callback now also provides the file extension
export const useMediaRecorder = (onRecordingComplete: (url: string, extension: string) => void) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback((canvasElement: HTMLCanvasElement, audioStream: MediaStream, isTransparent: boolean = false) => {
        if (!canvasElement) return;

        const webmTransparentOptions = { mimeType: 'video/webm;codecs=vp9,opus', extension: 'webm' };
        const webmVp8Options = { mimeType: 'video/webm;codecs=vp8,opus', extension: 'webm' };
        const webmFallbackOptions = { mimeType: 'video/webm', extension: 'webm' };
        const mp4Options = { mimeType: 'video/mp4;codecs=h264,aac', extension: 'mp4' };

        let selectedConfig;

        if (isTransparent) {
            // For transparency, WEBM is the only real choice. Prefer VP9 for better quality/alpha support.
            if (MediaRecorder.isTypeSupported(webmTransparentOptions.mimeType)) {
                selectedConfig = webmTransparentOptions;
            } else if (MediaRecorder.isTypeSupported(webmVp8Options.mimeType)) {
                selectedConfig = webmVp8Options;
            } else if (MediaRecorder.isTypeSupported(webmFallbackOptions.mimeType)) {
                selectedConfig = webmFallbackOptions;
            } else {
                alert("Your browser does not support recording with a transparent background. Please try a modern browser like Chrome or Firefox.");
                return;
            }
        } else {
            // For opaque backgrounds, prefer MP4 for better compatibility with video editors.
            if (MediaRecorder.isTypeSupported(mp4Options.mimeType)) {
                selectedConfig = mp4Options;
            } else if (MediaRecorder.isTypeSupported(webmTransparentOptions.mimeType)) {
                selectedConfig = webmTransparentOptions;
            } else if (MediaRecorder.isTypeSupported(webmVp8Options.mimeType)) {
                selectedConfig = webmVp8Options;
            } else if (MediaRecorder.isTypeSupported(webmFallbackOptions.mimeType)) {
                selectedConfig = webmFallbackOptions;
            } else {
                alert("Your browser does not support MP4 or WEBM video recording.");
                return;
            }
        }
        // Safari-friendly stream composition
        const canvasStream = canvasElement.captureStream(30); // 30 fps
        // Ensure audio is a proper MediaStreamTrack (avoid captureStream from <audio> directly)
        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...audioStream.getAudioTracks()
        ]);

        try {
            mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType: selectedConfig.mimeType });
        } catch (e) {
            console.error("MediaRecorder instantiation error:", e);
            alert("An unexpected error occurred while starting the recorder.");
            return;
        }

        mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordedChunksRef.current.push(event.data);
            }
        };

        mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(recordedChunksRef.current, { type: selectedConfig.mimeType });
            const url = URL.createObjectURL(blob);
            onRecordingComplete(url, selectedConfig.extension);
            recordedChunksRef.current = [];
        };
        
        recordedChunksRef.current = [];
        // Use small timeslice to flush data regularly; helps Safari stability
        mediaRecorderRef.current.start(1000);
        setIsRecording(true);

    }, [onRecordingComplete]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    }, []);

    return { isRecording, startRecording, stopRecording };
};