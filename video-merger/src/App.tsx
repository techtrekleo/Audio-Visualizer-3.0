import React, { useEffect, useMemo, useRef, useState } from 'react';
import { UnifiedHeader } from './components/UnifiedLayout';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

interface VideoFile {
  file: File;
  url: string;
  duration: number;
  name: string;
}

type Tab = 'merge_webm' | 'batch_render';

type BatchItem = {
  id: string;
  audioFile: File;
  audioUrl: string;
  duration: number; // seconds
  coverFile: File | null;
  coverUrl: string | null;
  lyricsText: string; // legacy plain text (fallback)
  lyricsFileName?: string | null;
  lyricsCues?: LyricCue[];
  template?: BatchTemplate;
  // KeYe V2 card text
  keYeText1?: string;
  keYeText2?: string;
};

type BatchTemplate = 'BASS_ENHANCEMENT' | 'KE_YE_CUSTOM_V2';

type LyricCue = {
  start: number; // seconds
  end: number; // seconds
  text: string;
};

function basenameNoExt(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

async function getMediaDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.src = url;
    audio.onloadedmetadata = () => resolve(Number.isFinite(audio.duration) ? audio.duration : 0);
    audio.onerror = () => resolve(0);
  });
}

function parseSrtTimeToSeconds(s: string): number {
  // "HH:MM:SS,mmm"
  const m = s.trim().match(/^(\d+):(\d+):(\d+)[,\.](\d+)$/);
  if (!m) return 0;
  const hh = parseInt(m[1], 10) || 0;
  const mm = parseInt(m[2], 10) || 0;
  const ss = parseInt(m[3], 10) || 0;
  const ms = parseInt(m[4].padEnd(3, '0').slice(0, 3), 10) || 0;
  return hh * 3600 + mm * 60 + ss + ms / 1000;
}

function parseSrt(text: string): LyricCue[] {
  const blocks = text
    .replace(/\r/g, '')
    .split('\n\n')
    .map((b) => b.trim())
    .filter(Boolean);

  const cues: LyricCue[] = [];
  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim());
    if (lines.length < 2) continue;
    const timeLine = lines[1].includes('-->') ? lines[1] : lines[0];
    const timeMatch = timeLine.match(/(.+?)\s*-->\s*(.+)$/);
    if (!timeMatch) continue;
    const start = parseSrtTimeToSeconds(timeMatch[1]);
    const end = parseSrtTimeToSeconds(timeMatch[2]);
    const textLines = (lines[1].includes('-->') ? lines.slice(2) : lines.slice(1)).filter(Boolean);
    const cueText = textLines.join('\n').trim();
    if (!cueText) continue;
    cues.push({ start, end: Math.max(end, start + 0.01), text: cueText });
  }
  return cues.sort((a, b) => a.start - b.start);
}

function parseLrcTimeToSeconds(tag: string): number | null {
  // "mm:ss.xx" or "mm:ss"
  const m = tag.match(/^(\d+):(\d+)(?:\.(\d+))?$/);
  if (!m) return null;
  const mm = parseInt(m[1], 10) || 0;
  const ss = parseInt(m[2], 10) || 0;
  const frac = m[3] ? m[3].padEnd(2, '0').slice(0, 2) : '00';
  const ms = parseInt(frac, 10) || 0;
  return mm * 60 + ss + ms / 100;
}

function parseLrc(text: string, durationHint: number): LyricCue[] {
  const lines = text.replace(/\r/g, '').split('\n');
  const raw: { t: number; text: string }[] = [];

  for (const line of lines) {
    const tags = Array.from(line.matchAll(/\[(\d+:\d+(?:\.\d+)?)\]/g)).map((m) => m[1]);
    const content = line.replace(/\[.*?\]/g, '').trim();
    if (!content) continue;
    for (const tag of tags) {
      const t = parseLrcTimeToSeconds(tag);
      if (t == null) continue;
      raw.push({ t, text: content });
    }
  }

  raw.sort((a, b) => a.t - b.t);
  const cues: LyricCue[] = [];
  for (let i = 0; i < raw.length; i++) {
    const cur = raw[i];
    const next = raw[i + 1];
    const end = next ? next.t : Math.max(cur.t + 2, durationHint || cur.t + 2);
    cues.push({ start: cur.t, end: Math.max(end, cur.t + 0.01), text: cur.text });
  }
  return cues;
}

function resolveActiveCue(cues: LyricCue[] | undefined, t: number): LyricCue | null {
  if (!cues || cues.length === 0) return null;
  // linear scan is OK for small cues; could binary search later
  for (const c of cues) {
    if (t >= c.start && t < c.end) return c;
  }
  return null;
}

function App() {
  const [tab, setTab] = useState<Tab>('merge_webm');

  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mergedVideoUrl, setMergedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  // Batch render state
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [batchIsRendering, setBatchIsRendering] = useState(false);
  const [batchStage, setBatchStage] = useState<string>('');
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [batchMergedUrl, setBatchMergedUrl] = useState<string | null>(null);
  const [batchFps, setBatchFps] = useState<number>(30);
  const [batchResolution, setBatchResolution] = useState<'720p' | '1080p'>('1080p');
  const [batchTemplateDefault, setBatchTemplateDefault] = useState<BatchTemplate>('BASS_ENHANCEMENT');
  const batchAudioInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // WYSIWYG preview state
  const [previewActive, setPreviewActive] = useState(false);
  const [previewSongName, setPreviewSongName] = useState<string>('');
  const [previewIndex, setPreviewIndex] = useState<number>(-1);
  const [previewTotal, setPreviewTotal] = useState<number>(0);
  const [previewTime, setPreviewTime] = useState<number>(0);
  const [previewDuration, setPreviewDuration] = useState<number>(0);
  const [previewLyric, setPreviewLyric] = useState<string>('');
  const [previewTemplate, setPreviewTemplate] = useState<BatchTemplate>('BASS_ENHANCEMENT');
  const batchStopRequestedRef = useRef(false);

  const batchSize = useMemo(() => {
    return batchResolution === '720p' ? { w: 1280, h: 720 } : { w: 1920, h: 1080 };
  }, [batchResolution]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const videoFilesData: VideoFile[] = [];

    for (const file of files) {
      if (file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        const duration = await getVideoDuration(url);
        videoFilesData.push({
          file,
          url,
          duration,
          name: file.name,
        });
      }
    }

    setVideoFiles((prev) => [...prev, ...videoFilesData]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getVideoDuration = (url: string): Promise<number> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.onerror = () => {
        resolve(0);
      };
    });
  };

  // ===== Batch helpers =====
  const batchAddAudioFiles = async (files: File[]) => {
    const audioFiles = files.filter((f) => f.type.startsWith('audio/') || f.type.startsWith('video/'));
    if (audioFiles.length === 0) return;

    // Create items in a deterministic order
    const newItems: BatchItem[] = [];
    for (const audioFile of audioFiles) {
      const audioUrl = URL.createObjectURL(audioFile);
      const duration = await getMediaDuration(audioUrl);
      newItems.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        audioFile,
        audioUrl,
        duration,
        coverFile: null,
        coverUrl: null,
        lyricsText: '',
        lyricsFileName: null,
        lyricsCues: [],
        template: batchTemplateDefault,
        keYeText1: basenameNoExt(audioFile.name),
        keYeText2: '',
      });
    }

    setBatchItems((prev) => [...prev, ...newItems]);
    if (batchAudioInputRef.current) batchAudioInputRef.current.value = '';
  };

  const batchApplyCoverToOne = async (itemId: string, file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setBatchItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        if (it.coverUrl) URL.revokeObjectURL(it.coverUrl);
        return { ...it, coverFile: file, coverUrl: url };
      })
    );
  };

  const clearItemCover = (itemId: string) => {
    setBatchItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        if (it.coverUrl) URL.revokeObjectURL(it.coverUrl);
        return { ...it, coverFile: null, coverUrl: null };
      })
    );
  };

  const batchApplyLyricsToOne = async (itemId: string, file: File) => {
    const nameLower = file.name.toLowerCase();
    const kind = nameLower.endsWith('.srt') ? 'srt' : nameLower.endsWith('.lrc') ? 'lrc' : null;
    if (!kind) return;
    const text = await file.text();
    setBatchItems((prev) =>
      prev.map((it) => {
        if (it.id !== itemId) return it;
        const cues = kind === 'srt' ? parseSrt(text) : parseLrc(text, it.duration || 0);
        return { ...it, lyricsFileName: file.name, lyricsCues: cues };
      })
    );
  };

  const clearItemLyrics = (itemId: string) => {
    setBatchItems((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, lyricsFileName: null, lyricsCues: [] } : it))
    );
  };

  const removeBatchItem = (id: string) => {
    setBatchItems((prev) => {
      const item = prev.find((x) => x.id === id);
      if (item) {
        URL.revokeObjectURL(item.audioUrl);
        if (item.coverUrl) URL.revokeObjectURL(item.coverUrl);
      }
      return prev.filter((x) => x.id !== id);
    });
    if (batchMergedUrl) {
      URL.revokeObjectURL(batchMergedUrl);
      setBatchMergedUrl(null);
    }
  };

  const moveBatchItem = (id: string, direction: 'up' | 'down') => {
    setBatchItems((prev) => {
      const idx = prev.findIndex((x) => x.id === id);
      if (idx < 0) return prev;
      if (direction === 'up' && idx === 0) return prev;
      if (direction === 'down' && idx === prev.length - 1) return prev;
      const next = [...prev];
      const j = direction === 'up' ? idx - 1 : idx + 1;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
    if (batchMergedUrl) {
      URL.revokeObjectURL(batchMergedUrl);
      setBatchMergedUrl(null);
    }
  };

  const splitLyricsLines = (lyricsText: string): string[] => {
    return lyricsText
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
  };

  const pickSupportedMime = (): string => {
    const candidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
    ];
    for (const c of candidates) {
      if ((window as any).MediaRecorder?.isTypeSupported?.(c)) return c;
    }
    return 'video/webm';
  };

  const renderOneItemToWebm = async (
    item: BatchItem,
    fps: number,
    {
      stopRef,
      onPreviewTick,
    }: {
      stopRef: React.MutableRefObject<boolean>;
      onPreviewTick: (payload: {
        t: number;
        duration: number;
        lyric: string;
        template: BatchTemplate;
      }) => void;
    }
  ): Promise<Blob> => {
    const canvas = previewCanvasRef.current;
    if (!canvas) throw new Error('找不到預覽畫布');

    canvas.width = batchSize.w;
    canvas.height = batchSize.h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('無法取得 Canvas 2D context');

    const audio = document.createElement('audio');
    audio.src = item.audioUrl;
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';

    await new Promise<void>((resolve, reject) => {
      audio.oncanplay = () => resolve();
      audio.onerror = () => reject(new Error('音訊載入失敗'));
    });

    let coverImg: HTMLImageElement | null = null;
    if (item.coverUrl) {
      coverImg = await new Promise((resolve) => {
        const img = new Image();
        img.src = item.coverUrl!;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      });
    }

    // Audio analyser for template animation
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.85;
    const source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    source.connect(audioCtx.destination);
    const freq = new Uint8Array(analyser.frequencyBinCount);

    const stream = canvas.captureStream(fps);
    const audioStream = (audio as any).captureStream?.() as MediaStream | undefined;
    const tracks: MediaStreamTrack[] = [...stream.getVideoTracks()];
    if (audioStream) tracks.push(...audioStream.getAudioTracks());
    const mixed = new MediaStream(tracks);

    const mimeType = pickSupportedMime();
    const recorder = new MediaRecorder(mixed, { mimeType });
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };

    const duration = Math.max(0.1, audio.duration || item.duration || 0.1);
    const fallbackLines = splitLyricsLines(item.lyricsText);
    const fallbackLineDur = fallbackLines.length > 0 ? duration / fallbackLines.length : duration;

    let rafId = 0;
    let lastUiUpdate = 0;
    const draw = () => {
      if (stopRef.current) {
        try {
          if (recorder.state !== 'inactive') recorder.stop();
        } catch {}
        try {
          audio.pause();
        } catch {}
        cancelAnimationFrame(rafId);
        return;
      }

      const t = audio.currentTime;
      analyser.getByteFrequencyData(freq);
      const bass = freq.slice(0, 16).reduce((a, b) => a + b, 0) / 16 / 255;
      const mid = freq.slice(16, 64).reduce((a, b) => a + b, 0) / 48 / 255;
      const treble = freq.slice(64, 128).reduce((a, b) => a + b, 0) / 64 / 255;
      const frame = Math.floor(t * fps);

      // background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // cover
      if (coverImg) {
        // cover fit
        const cw = canvas.width;
        const ch = canvas.height;
        const iw = coverImg.naturalWidth || coverImg.width;
        const ih = coverImg.naturalHeight || coverImg.height;
        const scale = Math.max(cw / iw, ch / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (cw - dw) / 2;
        const dy = (ch - dh) / 2;
        // subtle zoom with time
        const zoom = 1 + Math.sin(t * 0.6) * 0.01;
        ctx.save();
        ctx.translate(cw / 2, ch / 2);
        ctx.scale(zoom, zoom);
        ctx.translate(-cw / 2, -ch / 2);
        ctx.globalAlpha = 0.95;
        ctx.drawImage(coverImg, dx, dy, dw, dh);
        ctx.restore();

        // dark overlay for readability
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, cw, ch);
      }

      // ===== Templates (ported simplified) =====
      const template = item.template || 'BASS_ENHANCEMENT';
      if (template === 'BASS_ENHANCEMENT') {
        // Center "bass enhancement" visual
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const scale = 1 + Math.pow(bass, 1.4) * 0.8;
        const widthVis = canvas.width * 0.38 * scale;
        const seg = 24;
        const segW = widthVis / seg;
        const baseH = canvas.height * 0.14 * scale;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);

        // baseline glow
        ctx.save();
        ctx.strokeStyle = `rgba(255,255,255,${0.55 + bass * 0.35})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 28;
        ctx.shadowColor = 'rgba(255,255,255,0.7)';
        ctx.beginPath();
        ctx.moveTo(cx - widthVis / 2, cy);
        ctx.lineTo(cx + widthVis / 2, cy);
        ctx.stroke();
        ctx.restore();

        // segments
        ctx.save();
        ctx.lineWidth = 3;
        ctx.shadowBlur = 18;
        for (let i = 0; i < seg; i++) {
          const v = Math.pow(freq[Math.floor((i / seg) * 80)] / 255, 1.5);
          const h = v * baseH * (0.7 + bass * 1.6);
          const x = cx - widthVis / 2 + i * segW + segW / 2;
          const grad = ctx.createLinearGradient(0, cy - h, 0, cy + h);
          grad.addColorStop(0, `rgba(90, 200, 255, ${0.9})`);
          grad.addColorStop(0.5, `rgba(255, 90, 220, ${0.85})`);
          grad.addColorStop(1, `rgba(90, 200, 255, ${0.75})`);
          ctx.strokeStyle = grad;
          ctx.shadowColor = 'rgba(120,200,255,0.8)';
          ctx.beginPath();
          ctx.moveTo(x, cy - h);
          ctx.lineTo(x, cy + h);
          ctx.stroke();
        }
        ctx.restore();

        ctx.restore();
      } else if (template === 'KE_YE_CUSTOM_V2') {
        // Bottom pill card + visualizer (KeYe V2 inspired)
        const boxW = canvas.width * 0.82;
        const boxH = canvas.height * 0.18;
        const boxX = (canvas.width - boxW) / 2;
        const boxY = canvas.height - boxH - canvas.height * 0.05;
        const r = boxH / 2;
        const opacity = 0.55;

        // pill background
        ctx.save();
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.beginPath();
        ctx.moveTo(boxX + r, boxY);
        ctx.lineTo(boxX + boxW - r, boxY);
        ctx.arcTo(boxX + boxW, boxY, boxX + boxW, boxY + r, r);
        ctx.lineTo(boxX + boxW, boxY + boxH - r);
        ctx.arcTo(boxX + boxW, boxY + boxH, boxX + boxW - r, boxY + boxH, r);
        ctx.lineTo(boxX + r, boxY + boxH);
        ctx.arcTo(boxX, boxY + boxH, boxX, boxY + boxH - r, r);
        ctx.lineTo(boxX, boxY + r);
        ctx.arcTo(boxX, boxY, boxX + r, boxY, r);
        ctx.closePath();
        ctx.shadowBlur = 18;
        ctx.shadowColor = 'rgba(255,255,255,0.35)';
        ctx.fill();
        ctx.restore();

        // inner visualizer line
        ctx.save();
        const cy = boxY + boxH * 0.63;
        const left = boxX + boxW * 0.14;
        const right = boxX + boxW * 0.86;
        const w = right - left;
        const seg = 48;
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255,255,255,0.85)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i <= seg; i++) {
          const x = left + (i / seg) * w;
          const v = Math.pow(freq[Math.floor((i / seg) * 120)] / 255, 1.8);
          const amp = v * (canvas.height * 0.03) * (0.6 + bass * 2.0);
          const y = cy - amp + Math.sin(frame * 0.12 + i * 0.35) * 0.6;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();

        // text
        const t1 = item.keYeText1 ?? basenameNoExt(item.audioFile.name);
        const t2 = item.keYeText2 ?? '';
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255,255,255,0.0)';
        ctx.shadowBlur = 0;
        ctx.font = `900 ${Math.round(canvas.width * 0.035)}px Poppins, "Noto Sans TC", sans-serif`;
        ctx.fillText(t1, canvas.width / 2, boxY + boxH * 0.32);
        if (t2.trim()) {
          ctx.font = `800 ${Math.round(canvas.width * 0.024)}px Poppins, "Noto Sans TC", sans-serif`;
          ctx.fillText(t2, canvas.width / 2, boxY + boxH * 0.52);
        }
        ctx.restore();
      }

      // title (small, top)
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = `700 ${Math.round(canvas.width * 0.025)}px Poppins, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 8;
      ctx.fillText(basenameNoExt(item.audioFile.name), canvas.width / 2, canvas.height * 0.06);
      ctx.restore();

      // lyrics (center)
      const cue = resolveActiveCue(item.lyricsCues, t);
      const line =
        cue?.text ||
        (() => {
          if (fallbackLines.length === 0) return '';
          const idx = Math.min(
            fallbackLines.length - 1,
            Math.floor(t / Math.max(0.001, fallbackLineDur))
          );
          return fallbackLines[idx] || '';
        })();

      if (line.trim()) {
        const alpha = cue
          ? clamp01(
              (t - cue.start) < 0.2
                ? (t - cue.start) / 0.2
                : (cue.end - t) < 0.2
                  ? (cue.end - t) / 0.2
                  : 1
            )
          : 1;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.font = `800 ${Math.round(canvas.width * 0.05)}px Poppins, "Noto Sans TC", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.85)';
        ctx.shadowBlur = 18;
        // Place lyric above KeYe card if that template is used
        const y =
          (item.template || 'BASS_ENHANCEMENT') === 'KE_YE_CUSTOM_V2'
            ? canvas.height * 0.70
            : canvas.height * 0.78;
        ctx.fillText(line, canvas.width / 2, y);
        ctx.restore();
      }

      // Throttled UI updates for WYSIWYG
      const now = performance.now();
      if (now - lastUiUpdate > 150) {
        lastUiUpdate = now;
        onPreviewTick({
          t,
          duration,
          lyric: line.trim() ? line : '',
          template,
        });
      }

      if (!audio.paused && !audio.ended) {
        rafId = requestAnimationFrame(draw);
      }
    };

    const started = Date.now();
    const result = await new Promise<Blob>((resolve, reject) => {
      recorder.onerror = () => reject(new Error('錄製失敗'));
      recorder.onstop = () => {
        cancelAnimationFrame(rafId);
        const blob = new Blob(chunks, { type: 'video/webm' });
        // ensure minimum size
        if (blob.size < 1024) reject(new Error('錄製結果太小，可能被瀏覽器阻擋音訊錄製'));
        else resolve(blob);
      };

      recorder.start(1000);
      audio
        .play()
        .then(() => {
          audioCtx.resume().catch(() => {});
          draw();
          // safety stop
          const ms = Math.ceil(duration * 1000) + 800;
          window.setTimeout(() => {
            if (recorder.state !== 'inactive') {
              try {
                recorder.stop();
              } catch {}
            }
          }, ms);
          audio.onended = () => {
            const elapsed = Date.now() - started;
            const remain = Math.max(0, Math.ceil(duration * 1000) - elapsed);
            window.setTimeout(() => {
              if (recorder.state !== 'inactive') {
                try {
                  recorder.stop();
                } catch {}
              }
            }, Math.min(300, remain));
          };
        })
        .catch(() => reject(new Error('無法播放音訊（可能需要使用者互動或權限）')));
    });

    try {
      audio.pause();
    } catch {}
    try {
      source.disconnect();
      analyser.disconnect();
      await audioCtx.close();
    } catch {}

    return result;
  };

  const batchRenderAndMerge = async () => {
    if (batchItems.length === 0) {
      setError('請先新增歌曲項目');
      return;
    }
    setError(null);
    setBatchIsRendering(true);
    setBatchStage('載入 FFmpeg 中（第一次可能需要 10–60 秒）...');
    setBatchProgress(0);
    setProgress(0);
    batchStopRequestedRef.current = false;
    setPreviewActive(true);
    setPreviewIndex(-1);
    setPreviewTotal(batchItems.length);
    setPreviewTime(0);
    setPreviewDuration(0);
    setPreviewLyric('');

    try {
      const ffmpeg = (await Promise.race([
        loadFFmpeg(),
        new Promise<FFmpeg>((_, reject) =>
          window.setTimeout(() => reject(new Error('FFmpeg 載入逾時：請檢查網路/防火牆/擋廣告外掛是否阻擋 unpkg')), 45000)
        ),
      ])) as FFmpeg;

      // Render each item to webm clip
      const clips: Blob[] = [];
      for (let i = 0; i < batchItems.length; i++) {
        if (batchStopRequestedRef.current) throw new Error('已停止');
        const item = batchItems[i];
        setBatchStage(`錄製中：${item.audioFile.name} (${i + 1}/${batchItems.length})`);
        setBatchProgress(Math.round((i / Math.max(1, batchItems.length)) * 100));
        setPreviewIndex(i);
        setPreviewSongName(item.audioFile.name);
        setPreviewTemplate(item.template || batchTemplateDefault);
        // eslint-disable-next-line no-await-in-loop
        const clip = await renderOneItemToWebm(item, batchFps, {
          stopRef: batchStopRequestedRef,
          onPreviewTick: ({ t, duration, lyric, template }) => {
            setPreviewTime(t);
            setPreviewDuration(duration);
            setPreviewLyric(lyric);
            setPreviewTemplate(template);
          },
        });
        clips.push(clip);
      }

      setBatchStage('合併片段中...');
      setBatchProgress(98);

      // write clips
      for (let i = 0; i < clips.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        const data = await fetchFile(clips[i]);
        // eslint-disable-next-line no-await-in-loop
        await ffmpeg.writeFile(`batch${i}.webm`, data);
      }
      const concatContent = clips.map((_, i) => `file 'batch${i}.webm'`).join('\n');
      await ffmpeg.writeFile('batch-concat.txt', concatContent);

      await ffmpeg.exec([
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        'batch-concat.txt',
        '-c:v',
        'libvpx-vp9',
        '-c:a',
        'libopus',
        '-b:v',
        '1M',
        '-b:a',
        '128k',
        'batch-output.webm',
      ]);

      const out = await ffmpeg.readFile('batch-output.webm');
      const blob = new Blob([out], { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      if (batchMergedUrl) URL.revokeObjectURL(batchMergedUrl);
      setBatchMergedUrl(url);

      // cleanup
      for (let i = 0; i < clips.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        await ffmpeg.deleteFile(`batch${i}.webm`);
      }
      await ffmpeg.deleteFile('batch-concat.txt');
      await ffmpeg.deleteFile('batch-output.webm');

      setBatchStage('完成');
      setBatchProgress(100);
    } catch (err) {
      console.error('批次錄製合併失敗:', err);
      setError(`批次錄製合併失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
    } finally {
      setBatchIsRendering(false);
      setPreviewActive(false);
    }
  };

  const stopBatch = () => {
    batchStopRequestedRef.current = true;
    setBatchStage('停止中...');
  };

  const removeVideo = (index: number) => {
    const file = videoFiles[index];
    URL.revokeObjectURL(file.url);
    setVideoFiles((prev) => prev.filter((_, i) => i !== index));
    if (mergedVideoUrl) {
      URL.revokeObjectURL(mergedVideoUrl);
      setMergedVideoUrl(null);
    }
  };

  const moveVideo = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === videoFiles.length - 1)
    ) {
      return;
    }

    const newFiles = [...videoFiles];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
    setVideoFiles(newFiles);
    if (mergedVideoUrl) {
      URL.revokeObjectURL(mergedVideoUrl);
      setMergedVideoUrl(null);
    }
  };

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) {
      return ffmpegRef.current;
    }

    const ffmpeg = new FFmpeg();
    ffmpegRef.current = ffmpeg;

    ffmpeg.on('log', ({ message }) => {
      console.log(message);
    });

    ffmpeg.on('progress', ({ progress: p }) => {
      setProgress(Math.round(p * 100));
    });

    try {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
    } catch (error) {
      console.error('FFmpeg 載入失敗:', error);
      throw new Error('無法載入 FFmpeg，請檢查網路連線');
    }

    return ffmpeg;
  };

  const mergeVideos = async () => {
    if (videoFiles.length < 2) {
      setError('請至少選擇兩個影片檔案');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const ffmpeg = await loadFFmpeg();

      // 將所有影片檔案寫入 FFmpeg 的虛擬檔案系統
      for (let i = 0; i < videoFiles.length; i++) {
        const videoFile = videoFiles[i];
        const data = await fetchFile(videoFile.url);
        await ffmpeg.writeFile(`input${i}.webm`, data);
      }

      // 創建 concat 文件
      const concatContent = videoFiles
        .map((_, i) => `file 'input${i}.webm'`)
        .join('\n');
      await ffmpeg.writeFile('concat.txt', concatContent);

      // 執行合併 - 使用重新編碼以確保兼容性
      await ffmpeg.exec([
        '-f',
        'concat',
        '-safe',
        '0',
        '-i',
        'concat.txt',
        '-c:v',
        'libvpx-vp9',
        '-c:a',
        'libopus',
        '-b:v',
        '1M',
        '-b:a',
        '128k',
        'output.webm',
      ]);

      // 讀取合併後的影片
      const data = await ffmpeg.readFile('output.webm');
      const blob = new Blob([data], { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setMergedVideoUrl(url);

      // 清理
      for (let i = 0; i < videoFiles.length; i++) {
        await ffmpeg.deleteFile(`input${i}.webm`);
      }
      await ffmpeg.deleteFile('concat.txt');
      await ffmpeg.deleteFile('output.webm');
    } catch (err) {
      console.error('合併失敗:', err);
      setError(`合併失敗: ${err instanceof Error ? err.message : '未知錯誤'}`);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadMergedVideo = () => {
    if (!mergedVideoUrl) return;

    const a = document.createElement('a');
    a.href = mergedVideoUrl;
    a.download = `merged-video-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = videoFiles.reduce((sum, file) => sum + file.duration, 0);

  useEffect(() => {
    return () => {
      // cleanup URLs
      for (const v of videoFiles) URL.revokeObjectURL(v.url);
      for (const b of batchItems) {
        URL.revokeObjectURL(b.audioUrl);
        if (b.coverUrl) URL.revokeObjectURL(b.coverUrl);
      }
      if (mergedVideoUrl) URL.revokeObjectURL(mergedVideoUrl);
      if (batchMergedUrl) URL.revokeObjectURL(batchMergedUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
      <div className="min-h-screen bg-black flex flex-col">
        <UnifiedHeader />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24 flex-1">
        <div className="space-y-6">
          {/* 標題 */}
          <div className="card">
            <h1 className="text-3xl font-bold text-white mb-2">歐皇測試頁面</h1>
            <p className="text-gray-300">
              合併 WebM 影片，或批次把「歌曲+封面+歌詞」錄製後自動合併成同一支影片
            </p>
          </div>

          {/* Tabs */}
          <div className="card">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTab('merge_webm')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                  tab === 'merge_webm'
                    ? 'bg-cyan-600 border-cyan-500 text-white'
                    : 'bg-gray-900/60 border-gray-700 text-gray-200 hover:bg-gray-800'
                }`}
              >
                WebM 合併器
              </button>
              <button
                type="button"
                onClick={() => setTab('batch_render')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border ${
                  tab === 'batch_render'
                    ? 'bg-cyan-600 border-cyan-500 text-white'
                    : 'bg-gray-900/60 border-gray-700 text-gray-200 hover:bg-gray-800'
                }`}
              >
                批次錄製合併（歌曲+封面+歌詞）
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 leading-relaxed">
              批次錄製模式會在瀏覽器內逐首錄製成 WebM，再用 FFmpeg 串接成一支影片。第一次使用需要載入 FFmpeg（需網路）。
            </p>
          </div>

          {/* 錯誤訊息 */}
          {error && (
            <div className="card bg-red-900/50 border-red-700">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {tab === 'merge_webm' && (
            <>
              {/* 上傳區域 */}
              <div className="card">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  選擇影片檔案 (可多選)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/webm,video/*"
                  multiple
                  onChange={handleFileSelect}
                  className="input-field"
                  disabled={isProcessing}
                />
                <p className="text-xs text-gray-400 mt-2">
                  支援 WebM 格式，可一次選擇多個檔案
                </p>
              </div>

              {/* 影片列表 */}
              {videoFiles.length > 0 && (
                <div className="card">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">
                      影片列表 ({videoFiles.length} 個)
                    </h2>
                    <div className="text-sm text-gray-300">
                      總時長: {formatDuration(totalDuration)}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {videoFiles.map((videoFile, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="text-sm text-gray-400 w-8">
                            #{index + 1}
                          </div>
                          <video
                            src={videoFile.url}
                            className="w-24 h-16 object-cover rounded"
                            muted
                          />
                          <div className="flex-1">
                            <div className="text-sm text-white font-medium">
                              {videoFile.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatDuration(videoFile.duration)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => moveVideo(index, 'up')}
                            disabled={index === 0 || isProcessing}
                            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveVideo(index, 'down')}
                            disabled={index === videoFiles.length - 1 || isProcessing}
                            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeVideo(index)}
                            disabled={isProcessing}
                            className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            移除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 合併按鈕 */}
              {videoFiles.length >= 2 && (
                <div className="card">
                  <button
                    onClick={mergeVideos}
                    disabled={isProcessing}
                    className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? `處理中... ${progress}%` : '開始合併影片'}
                  </button>
                  {isProcessing && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div
                          className="bg-cyan-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 預覽和下載 */}
              {mergedVideoUrl && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    合併完成！
                  </h2>
                  <video
                    src={mergedVideoUrl}
                    controls
                    className="w-full rounded-lg mb-4"
                  />
                  <button
                    onClick={downloadMergedVideo}
                    className="w-full btn-primary py-3 text-lg"
                  >
                    下載合併後的影片
                  </button>
                </div>
              )}
            </>
          )}

          {tab === 'batch_render' && (
            <>
              <div className="card">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">歌曲（可多選）</label>
                    <input
                      ref={batchAudioInputRef}
                      type="file"
                      accept="audio/*,video/*"
                      multiple
                      onChange={(e) => batchAddAudioFiles(Array.from(e.target.files || []))}
                      className="input-field"
                      disabled={batchIsRendering}
                    />
                    <p className="text-xs text-gray-400 mt-2">支援音訊檔；若是影片檔會只取音軌（瀏覽器能力依平台而定）。</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">輸出 / 模板</label>
                    <div className="flex gap-2">
                      <select
                        value={batchTemplateDefault}
                        onChange={(e) => setBatchTemplateDefault(e.target.value as BatchTemplate)}
                        className="input-field"
                        disabled={batchIsRendering}
                      >
                        <option value="BASS_ENHANCEMENT">重低音強化</option>
                        <option value="KE_YE_CUSTOM_V2">可夜訂製二號</option>
                      </select>
                      <select
                        value={batchResolution}
                        onChange={(e) => setBatchResolution(e.target.value as any)}
                        className="input-field"
                        disabled={batchIsRendering}
                      >
                        <option value="720p">720p (1280x720)</option>
                        <option value="1080p">1080p (1920x1080)</option>
                      </select>
                      <select
                        value={batchFps}
                        onChange={(e) => setBatchFps(parseInt(e.target.value, 10))}
                        className="input-field"
                        disabled={batchIsRendering}
                      >
                        <option value={24}>24 fps</option>
                        <option value={30}>30 fps</option>
                        <option value={60}>60 fps</option>
                      </select>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">建議 1080p / 30fps；歌曲很多時可降到 720p 提升成功率。</p>
                  </div>
                </div>
              </div>

              {/* WYSIWYG preview */}
              <div className="card">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-white">錄製預覽（所見即所得）</h2>
                    <p className="text-xs text-gray-400 mt-1">
                      錄製時會即時顯示目前畫面/字幕/進度；完成後會進行合併。
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={stopBatch}
                      disabled={!batchIsRendering}
                      className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      停止
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
                  <div className="lg:col-span-2">
                    <div className="w-full bg-black rounded-lg border border-gray-700 overflow-hidden">
                      <canvas
                        ref={previewCanvasRef}
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          aspectRatio: batchResolution === '720p' ? '16 / 9' : '16 / 9',
                        }}
                      />
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-gray-300">
                        <span>
                          {previewIndex >= 0 ? `第 ${previewIndex + 1}/${previewTotal} 首` : '尚未開始'}
                          {previewSongName ? `：${previewSongName}` : ''}
                        </span>
                        <span>
                          {previewDuration > 0 ? `${formatDuration(previewTime)} / ${formatDuration(previewDuration)}` : ''}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-cyan-600 h-2.5 rounded-full transition-all duration-150"
                          style={{
                            width:
                              previewDuration > 0 ? `${Math.round((previewTime / Math.max(0.001, previewDuration)) * 100)}%` : '0%',
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        模板：{previewTemplate === 'BASS_ENHANCEMENT' ? '重低音強化' : '可夜訂製二號'}
                        {previewActive ? '（錄製中）' : ''}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="bg-gray-900/40 border border-gray-700 rounded-lg p-3">
                      <div className="text-sm text-gray-200 font-semibold mb-2">目前字幕</div>
                      <div className="text-sm text-white leading-relaxed whitespace-pre-wrap min-h-[4.5rem]">
                        {previewLyric || '—'}
                      </div>
                    </div>

                    <div className="mt-4 bg-gray-900/40 border border-gray-700 rounded-lg p-3">
                      <div className="text-sm text-gray-200 font-semibold mb-2">批次進度</div>
                      <div className="text-xs text-gray-300">{batchStage || '—'}</div>
                      <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                        <div
                          className="bg-cyan-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${batchIsRendering ? batchProgress : 0}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {batchIsRendering ? `${batchProgress}%` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {batchItems.length > 0 && (
                <div className="card">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">批次項目 ({batchItems.length} 首)</h2>
                    <div className="text-sm text-gray-300">
                      總時長: {formatDuration(batchItems.reduce((s, x) => s + (x.duration || 0), 0))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    {batchItems.map((it, idx) => (
                      <div key={it.id} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="text-sm text-gray-400 w-8 pt-1">#{idx + 1}</div>
                            <div className="w-20 h-20 bg-gray-800 rounded overflow-hidden flex items-center justify-center border border-gray-700">
                              {it.coverUrl ? (
                                <img src={it.coverUrl} alt="cover" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-xs text-gray-400">無封面</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-white font-medium truncate">{it.audioFile.name}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                時長: {formatDuration(it.duration || 0)} / 歌詞: {it.lyricsFileName ? `${it.lyricsFileName} (${(it.lyricsCues || []).length}段)` : `手動 (${splitLyricsLines(it.lyricsText).length}行)`}
                              </div>

                              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-300 mb-1">模板</label>
                                  <select
                                    value={it.template || batchTemplateDefault}
                                    onChange={(e) =>
                                      setBatchItems((prev) =>
                                        prev.map((x) => (x.id === it.id ? { ...x, template: e.target.value as BatchTemplate } : x))
                                      )
                                    }
                                    className="input-field"
                                    disabled={batchIsRendering}
                                  >
                                    <option value="BASS_ENHANCEMENT">重低音強化</option>
                                    <option value="KE_YE_CUSTOM_V2">可夜訂製二號</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-300 mb-1">上傳此首封面（圖片）</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (f) batchApplyCoverToOne(it.id, f);
                                        e.target.value = '';
                                      }}
                                      className="input-field"
                                      disabled={batchIsRendering}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => clearItemCover(it.id)}
                                      disabled={batchIsRendering}
                                      className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      清除
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-3">
                                <label className="block text-xs text-gray-300 mb-1">上傳此首字幕（SRT/LRC）</label>
                                <div className="flex gap-2">
                                  <input
                                    type="file"
                                    accept=".srt,.lrc"
                                    onChange={(e) => {
                                      const f = e.target.files?.[0];
                                      if (f) batchApplyLyricsToOne(it.id, f);
                                      e.target.value = '';
                                    }}
                                    className="input-field"
                                    disabled={batchIsRendering}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => clearItemLyrics(it.id)}
                                    disabled={batchIsRendering}
                                    className="px-3 py-2 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    清除字幕
                                  </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  字幕時間碼以「單首歌曲」為準（不需要先合併）。
                                </p>
                              </div>

                              {(it.template || batchTemplateDefault) === 'KE_YE_CUSTOM_V2' && (
                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs text-gray-300 mb-1">可夜文字1</label>
                                    <input
                                      type="text"
                                      value={it.keYeText1 ?? basenameNoExt(it.audioFile.name)}
                                      onChange={(e) =>
                                        setBatchItems((prev) =>
                                          prev.map((x) => (x.id === it.id ? { ...x, keYeText1: e.target.value } : x))
                                        )
                                      }
                                      className="input-field"
                                      disabled={batchIsRendering}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-300 mb-1">可夜文字2</label>
                                    <input
                                      type="text"
                                      value={it.keYeText2 ?? ''}
                                      onChange={(e) =>
                                        setBatchItems((prev) =>
                                          prev.map((x) => (x.id === it.id ? { ...x, keYeText2: e.target.value } : x))
                                        )
                                      }
                                      className="input-field"
                                      disabled={batchIsRendering}
                                      placeholder="可留空"
                                    />
                                  </div>
                                </div>
                              )}

                              <div className="mt-3">
                                <label className="block text-xs text-gray-300 mb-1">歌詞（每行一段，會平均分配整首時長）</label>
                                <textarea
                                  value={it.lyricsText}
                                  onChange={(e) =>
                                    setBatchItems((prev) =>
                                      prev.map((x) => (x.id === it.id ? { ...x, lyricsText: e.target.value } : x))
                                    )
                                  }
                                  placeholder="把歌詞貼在這裡，每行一段..."
                                  className="w-full h-24 px-3 py-2 bg-gray-950/60 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                                  disabled={batchIsRendering}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  若已上傳 SRT/LRC，錄製時會以 SRT/LRC 為準；這裡只做備用顯示。
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => moveBatchItem(it.id, 'up')}
                              disabled={idx === 0 || batchIsRendering}
                              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveBatchItem(it.id, 'down')}
                              disabled={idx === batchItems.length - 1 || batchIsRendering}
                              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => removeBatchItem(it.id)}
                              disabled={batchIsRendering}
                              className="px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              移除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="card">
                <button
                  onClick={batchRenderAndMerge}
                  disabled={batchIsRendering || batchItems.length === 0}
                  className="w-full btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {batchIsRendering ? `批次處理中... ${batchProgress}%` : '開始批次錄製並合併'}
                </button>
                {(batchIsRendering || batchStage) && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-300 mb-2">{batchStage}</div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-cyan-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${batchIsRendering ? batchProgress : 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {batchMergedUrl && (
                <div className="card">
                  <h2 className="text-xl font-semibold text-white mb-4">批次合併完成！</h2>
                  <video src={batchMergedUrl} controls className="w-full rounded-lg mb-4" />
                  <button
                    onClick={() => {
                      const a = document.createElement('a');
                      a.href = batchMergedUrl;
                      a.download = `batch-merged-${Date.now()}.webm`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="w-full btn-primary py-3 text-lg"
                  >
                    下載批次合併後的影片
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        </main>
        <footer className="border-t border-gray-800 py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="text-sm text-gray-400">© {new Date().getFullYear()} Sonic Pulse</div>
          </div>
        </footer>
      </div>
  );
}

export default App;

