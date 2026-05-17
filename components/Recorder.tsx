'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface RecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
}

type RecordingState = 'idle' | 'recording' | 'stopped';

export default function Recorder({ onRecordingComplete, disabled = false }: RecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const MAX_DURATION = 30;

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setState('stopped');
    setVolume(0);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      setAudioUrl(null);
      setDuration(0);

      // Volume analyser
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const trackVolume = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setVolume(Math.min(100, avg * 2));
        animFrameRef.current = requestAnimationFrame(trackVolume);
      };
      trackVolume();

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob);
      };

      recorder.start();
      setState('recording');

      let secs = 0;
      timerRef.current = setInterval(() => {
        secs++;
        setDuration(secs);
        if (secs >= MAX_DURATION) stopRecording();
      }, 1000);
    } catch {
      alert('Không thể truy cập microphone. Kiểm tra quyền truy cập của trình duyệt.');
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Volume meter */}
      {state === 'recording' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-red-500 font-medium animate-pulse">● REC</span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-75 rounded-full"
              style={{ width: `${volume}%` }}
            />
          </div>
          <span className="text-sm text-gray-500 w-10 text-right">
            {duration}s
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        {state !== 'recording' ? (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2H3v2a9 9 0 0 0 8 8.94V23h2v-2.06A9 9 0 0 0 21 12v-2h-2z"/>
            </svg>
            {state === 'stopped' ? 'Ghi âm lại' : 'Bắt đầu Ghi âm'}
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1"/>
            </svg>
            Dừng ({MAX_DURATION - duration}s còn lại)
          </button>
        )}
      </div>

      {/* Playback */}
      {audioUrl && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-500 mb-2">Nghe lại bản ghi âm của bạn:</p>
          <audio controls src={audioUrl} className="w-full h-10" />
        </div>
      )}
    </div>
  );
}
