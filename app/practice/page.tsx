'use client';

import { useState } from 'react';
import Recorder from '@/components/Recorder';
import ScoreDisplay from '@/components/ScoreDisplay';
import PhonemeDetail from '@/components/PhonemeDetail';
import sentences from '@/data/sentences.json';
import type { PronunciationResult, WordResult } from '@/lib/azure';
import { audioToWav } from '@/lib/audio';

type Step = 'select' | 'record' | 'result';

export default function PracticePage() {
  const [step, setStep] = useState<Step>('select');
  const [selectedText, setSelectedText] = useState('');
  const [customText, setCustomText] = useState('');
  const [isAssessing, setIsAssessing] = useState(false);
  const [result, setResult] = useState<PronunciationResult | null>(null);
  const [feedback, setFeedback] = useState('');
  const [selectedWord, setSelectedWord] = useState<WordResult | null>(null);
  const [error, setError] = useState('');
  const [isTTSLoading, setIsTTSLoading] = useState(false);

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
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.play();
    } catch {
      // fallback về browser TTS nếu Azure lỗi
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(referenceText);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } finally {
      setIsTTSLoading(false);
    }
  };

  const handleRecordingComplete = async (blob: Blob) => {
    setIsAssessing(true);
    setError('');
    try {
      // Convert to WAV PCM 16kHz mono (Azure requirement)
      const wavBuffer = await audioToWav(blob, 16000);

      const formData = new FormData();
      formData.append('audio', new Blob([wavBuffer], { type: 'audio/wav' }), 'recording.wav');
      formData.append('referenceText', referenceText);

      const assessRes = await fetch('/api/assess', { method: 'POST', body: formData });
      if (!assessRes.ok) throw new Error('Lỗi đánh giá phát âm');
      const assessResult: PronunciationResult = await assessRes.json();
      setResult(assessResult);

      // Fetch Claude feedback in parallel (non-blocking for UX)
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...assessResult, referenceText }),
      })
        .then(r => r.json())
        .then(d => setFeedback(d.feedback ?? ''))
        .catch(() => {});

      setStep('result');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Đã xảy ra lỗi, thử lại nhé.');
    } finally {
      setIsAssessing(false);
    }
  };

  const reset = () => {
    setStep('select');
    setResult(null);
    setFeedback('');
    setError('');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <a href="/" className="text-gray-400 hover:text-gray-600 transition-colors">
            ← Trang chủ
          </a>
          <h1 className="text-2xl font-bold text-gray-900">Luyện Phát Âm</h1>
        </div>

        {/* Step: Select sentence */}
        {step === 'select' && (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div>
              <h2 className="font-semibold text-gray-700 mb-3">Chọn câu từ thư viện</h2>
              <div className="space-y-2">
                {sentences.sentences.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedText(s.text); setCustomText(''); }}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                      selectedText === s.text && !customText
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-gray-800">{s.text}</span>
                    <span className="ml-2 text-xs text-gray-400 font-mono">[{s.level}]</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-gray-700 mb-2">Hoặc tự nhập câu</h2>
              <textarea
                value={customText}
                onChange={(e) => { setCustomText(e.target.value); setSelectedText(''); }}
                placeholder="Nhập câu tiếng Anh bất kỳ..."
                rows={3}
                className="w-full border-2 border-gray-200 focus:border-blue-400 rounded-lg p-3 text-gray-800 resize-none outline-none transition-colors"
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
              <p className="text-sm text-blue-600 font-medium mb-1">Câu luyện tập:</p>
              <p className="text-base sm:text-xl text-gray-800 font-medium">{referenceText}</p>
            </div>

            <div>
              <h2 className="font-semibold text-gray-700 mb-3">Bước 1 — Nghe mẫu</h2>
              <button
                onClick={playNative}
                disabled={isTTSLoading}
                className="flex items-center gap-2 bg-green-100 hover:bg-green-200 disabled:opacity-60 disabled:cursor-not-allowed text-green-700 font-medium py-2 px-4 rounded-lg transition-colors"
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
                  <>🔊 Phát âm mẫu (Jenny Neural)</>
                )}
              </button>
            </div>

            <div>
              <h2 className="font-semibold text-gray-700 mb-3">Bước 2 — Ghi âm</h2>
              {isAssessing ? (
                <div className="flex items-center justify-center py-8 gap-3 text-blue-600">
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Đang đánh giá phát âm...
                </div>
              ) : (
                <Recorder onRecordingComplete={handleRecordingComplete} />
              )}
              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            </div>

            <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600">
              ← Chọn câu khác
            </button>
          </div>
        )}

        {/* Step: Result */}
        {step === 'result' && result && (
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium mb-1">Câu đã luyện:</p>
              <p className="text-base sm:text-lg text-gray-800">{referenceText}</p>
            </div>

            <ScoreDisplay result={result} onWordClick={setSelectedWord} />

            {/* AI Feedback */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-semibold text-amber-700">🤖 Nhận xét từ AI</span>
                {!feedback && (
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                )}
              </div>
              {feedback ? (
                <p className="text-gray-700 text-sm leading-relaxed">{feedback}</p>
              ) : (
                <div className="space-y-2 animate-pulse">
                  <div className="h-3 bg-amber-200 rounded w-full" />
                  <div className="h-3 bg-amber-200 rounded w-5/6" />
                  <div className="h-3 bg-amber-200 rounded w-4/6" />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('record')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Thử lại
              </button>
              <button
                onClick={reset}
                className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition-colors"
              >
                Câu mới
              </button>
            </div>
          </div>
        )}
      </div>

      <PhonemeDetail word={selectedWord} onClose={() => setSelectedWord(null)} />
    </div>
  );
}
