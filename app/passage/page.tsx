'use client';

import { useState } from 'react';
import Recorder from '@/components/Recorder';
import PassageResult from '@/components/PassageResult';
import PhonemeDetail from '@/components/PhonemeDetail';
import passages from '@/data/passages.json';
import type { PronunciationResult, WordResult } from '@/lib/azure';
import { audioToWav } from '@/lib/audio';

type Step = 'select' | 'record' | 'result';

export default function PassagePage() {
  const [step, setStep] = useState<Step>('select');
  const [selectedText, setSelectedText] = useState('');
  const [customText, setCustomText] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const [playingWord, setPlayingWord] = useState<string | null>(null);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [selectedWord, setSelectedWord] = useState<WordResult | null>(null);
  const [error, setError] = useState('');

  const referenceText = customText.trim() || selectedText;

  const playNative = async () => {
    if (!referenceText || isTTSLoading) return;
    setIsTTSLoading(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: referenceText }),
      });
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.play();
    } catch {
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(referenceText);
      utt.lang = 'en-US';
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    } finally {
      setIsTTSLoading(false);
    }
  };

  const playWord = (token: string) => {
    const clean = token.replace(/[^a-zA-Z'-]/g, '');
    if (!clean) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(clean);
    utt.lang = 'en-US';
    utt.rate = 0.9;
    setPlayingWord(clean);
    utt.onend = () => setPlayingWord(null);
    utt.onerror = () => setPlayingWord(null);
    window.speechSynthesis.speak(utt);
  };

  const handleRecordingComplete = async (blob: Blob) => {
    setIsAssessing(true);
    setError('');
    try {
      const wavBuffer = await audioToWav(blob, 16000);
      const formData = new FormData();
      formData.append('audio', new Blob([wavBuffer], { type: 'audio/wav' }), 'recording.wav');
      formData.append('referenceText', referenceText);

      const res = await fetch('/api/assess', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Lỗi đánh giá phát âm');
      const data: PronunciationResult = await res.json();
      setResult(data);
      setStep('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Đã xảy ra lỗi, thử lại nhé.');
    } finally {
      setIsAssessing(false);
    }
  };

  const reset = () => { setStep('select'); setResult(null); setError(''); };

  return (
    <div className="min-h-screen p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <a href="/" className="text-gray-400 hover:text-gray-600 transition-colors text-sm">
            ← Trang chủ
          </a>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Đọc Đoạn Văn</h1>
        </div>

        {/* Step: Select */}
        {step === 'select' && (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div>
              <h2 className="font-semibold text-gray-700 mb-3">Chọn đoạn văn mẫu</h2>
              <div className="space-y-2">
                {passages.passages.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedText(p.text); setCustomText(''); }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      selectedText === p.text && !customText
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800 text-sm">{p.title}</span>
                      <span className="text-xs text-gray-400 font-mono">[{p.level}]</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2">{p.text}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-gray-700 mb-2">Hoặc tự nhập đoạn văn</h2>
              <textarea
                value={customText}
                onChange={(e) => { setCustomText(e.target.value); setSelectedText(''); }}
                placeholder="Nhập đoạn văn tiếng Anh bất kỳ..."
                rows={5}
                className="w-full border-2 border-gray-200 focus:border-blue-400 rounded-lg p-3 text-gray-800 resize-none outline-none transition-colors text-sm"
              />
            </div>

            <button
              disabled={!referenceText}
              onClick={() => setStep('record')}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Tiếp tục →
            </button>
          </div>
        )}

        {/* Step: Record */}
        {step === 'record' && (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-blue-600 font-medium mb-2">Đoạn văn luyện tập:</p>
              <p className="text-sm sm:text-base text-gray-800 leading-loose">
                {referenceText.split(/\s+/).filter(Boolean).map((token, i) => {
                  const clean = token.replace(/[^a-zA-Z'-]/g, '');
                  const isPlaying = playingWord === clean;
                  return (
                    <span
                      key={i}
                      onClick={() => playWord(token)}
                      className={`rounded px-0.5 transition-colors select-none ${
                        clean
                          ? isPlaying
                            ? 'bg-blue-500 text-white cursor-default'
                            : 'hover:bg-blue-200 active:bg-blue-300 cursor-pointer'
                          : ''
                      }`}
                    >
                      {token}{' '}
                    </span>
                  );
                })}
              </p>
              <p className="text-[11px] text-blue-400 mt-2">💡 Chạm vào từ để nghe phát âm</p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-700 mb-3">Bước 1 — Nghe mẫu</h2>
              <button
                onClick={playNative}
                disabled={isTTSLoading}
                className="flex items-center gap-2 bg-green-100 hover:bg-green-200 disabled:opacity-60 disabled:cursor-not-allowed text-green-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                {isTTSLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Đang tải...
                  </>
                ) : (
                  <>🔊 Nghe mẫu (Jenny Neural)</>
                )}
              </button>
            </div>

            <div>
              <h2 className="font-semibold text-gray-700 mb-3">Bước 2 — Đọc to và ghi âm</h2>
              {isAssessing ? (
                <div className="flex items-center justify-center py-8 gap-3 text-blue-600">
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Đang đánh giá...
                </div>
              ) : (
                <Recorder onRecordingComplete={handleRecordingComplete} />
              )}
              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            </div>

            <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600">
              ← Chọn đoạn khác
            </button>
          </div>
        )}

        {/* Step: Result */}
        {step === 'result' && result && (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <PassageResult
              result={result}
              onPlayWord={playWord}
              onWordDetails={setSelectedWord}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setStep('record')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Đọc lại
              </button>
              <button
                onClick={reset}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
              >
                Đoạn mới
              </button>
            </div>
          </div>
        )}
      </div>

      <PhonemeDetail word={selectedWord} onClose={() => setSelectedWord(null)} />
    </div>
  );
}
