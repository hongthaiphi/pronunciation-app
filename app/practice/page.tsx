'use client';

import { useState } from 'react';
import Recorder from '@/components/Recorder';
import ScoreDisplay from '@/components/ScoreDisplay';
import PhonemeDetail from '@/components/PhonemeDetail';
import sentences from '@/data/sentences.json';
import type { PronunciationResult, WordResult } from '@/lib/azure';
import { audioToWav } from '@/lib/audio';

type Step = 'select' | 'record' | 'result';
type Level = 'All' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

const LEVELS: Level[] = ['All', 'A1', 'A2', 'B1', 'B2', 'C1'];

const LEVEL_COLOR: Record<Level, string> = {
  All: 'bg-gray-100 text-gray-600 border-gray-200',
  A1:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  A2:  'bg-teal-100 text-teal-700 border-teal-200',
  B1:  'bg-blue-100 text-blue-700 border-blue-200',
  B2:  'bg-indigo-100 text-indigo-700 border-indigo-200',
  C1:  'bg-purple-100 text-purple-700 border-purple-200',
};

const LEVEL_ACTIVE: Record<Level, string> = {
  All: 'bg-gray-700 text-white border-gray-700',
  A1:  'bg-emerald-500 text-white border-emerald-500',
  A2:  'bg-teal-500 text-white border-teal-500',
  B1:  'bg-blue-500 text-white border-blue-500',
  B2:  'bg-indigo-500 text-white border-indigo-500',
  C1:  'bg-purple-500 text-white border-purple-500',
};

export default function PracticePage() {
  const [step, setStep] = useState<Step>('select');
  const [selectedText, setSelectedText] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [customText, setCustomText] = useState('');
  const [activeLevel, setActiveLevel] = useState<Level>('All');
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
      const wavBuffer = await audioToWav(blob, 16000);
      const formData = new FormData();
      formData.append('audio', new Blob([wavBuffer], { type: 'audio/wav' }), 'recording.wav');
      formData.append('referenceText', referenceText);

      const assessRes = await fetch('/api/assess', { method: 'POST', body: formData });
      if (!assessRes.ok) throw new Error('Lỗi đánh giá phát âm');
      const assessResult: PronunciationResult = await assessRes.json();
      setResult(assessResult);

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
    setSelectedImage('');
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:py-10">
      <div className="max-w-2xl mx-auto">

        {/* Colorful header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl p-5 mb-6 shadow-lg">
          <a href="/" className="text-white/70 hover:text-white text-sm transition-colors">← Trang chủ</a>
          <div className="flex items-center gap-3 mt-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-xl">🎤</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Luyện Phát Âm</h1>
              <p className="text-blue-100 text-xs mt-0.5">60 câu · 5 cấp độ · AI feedback</p>
            </div>
          </div>
        </div>

        {/* Step: Select */}
        {step === 'select' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 mb-4">Chọn câu luyện tập</h2>

              {/* Level tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                {LEVELS.map((level) => {
                  const count = level === 'All'
                    ? sentences.sentences.length
                    : sentences.sentences.filter(s => s.level === level).length;
                  const isActive = activeLevel === level;
                  return (
                    <button
                      key={level}
                      onClick={() => { setActiveLevel(level); setSelectedText(''); }}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                        isActive ? LEVEL_ACTIVE[level] : LEVEL_COLOR[level] + ' hover:opacity-80'
                      }`}
                    >
                      {level}
                      <span className={`ml-1.5 text-xs ${isActive ? 'opacity-80' : 'opacity-60'}`}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Sentence list */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {sentences.sentences
                  .filter(s => activeLevel === 'All' || s.level === activeLevel)
                  .map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedText(s.text); setSelectedImage((s as { image?: string }).image || ''); setCustomText(''); setStep('record'); }}
                      className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                        selectedText === s.text && !customText
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/40'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {(s as { image?: string }).image && (
                          <img
                            src={(s as { image?: string }).image}
                            alt=""
                            className="w-14 h-10 object-cover rounded-lg shrink-0 mt-0.5"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-gray-800 text-sm leading-snug">{s.text}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              {s.focus && s.focus.length > 0 && s.focus.map((ph: string) => (
                                <span key={ph} className="text-[10px] font-mono bg-orange-100 text-orange-600 border border-orange-200 px-1 rounded">
                                  /{ph}/
                                </span>
                              ))}
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${LEVEL_COLOR[s.level as Level]}`}>
                                {s.level}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h2 className="font-bold text-gray-800 mb-3">Hoặc tự nhập câu</h2>
              <textarea
                value={customText}
                onChange={(e) => { setCustomText(e.target.value); setSelectedText(''); }}
                placeholder="Nhập câu tiếng Anh bất kỳ..."
                rows={3}
                className="w-full border-2 border-gray-100 focus:border-blue-400 rounded-xl p-3 text-gray-800 resize-none outline-none transition-colors text-sm bg-gray-50 focus:bg-white"
              />
              <button
                disabled={!referenceText}
                onClick={() => setStep('record')}
                className="w-full mt-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-sm"
              >
                Tiếp tục →
              </button>
            </div>
          </div>
        )}

        {/* Step: Record */}
        {step === 'record' && (
          <div className="space-y-4">
            {selectedImage && (
              <img
                src={selectedImage}
                alt="illustration"
                className="w-full h-36 sm:h-44 object-cover rounded-2xl shadow-sm"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Câu luyện tập</p>
              <p className="text-base sm:text-xl text-gray-900 font-semibold leading-relaxed">{referenceText}</p>
            </div>

            {/* Step 1 */}
            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">1</div>
                <span className="font-semibold text-gray-800">Nghe phát âm mẫu</span>
              </div>
              <button
                onClick={playNative}
                disabled={isTTSLoading}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-5 rounded-xl transition-colors text-sm shadow-sm"
              >
                {isTTSLoading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Đang tải...
                  </>
                ) : <>🔊 Phát âm mẫu (Jenny Neural)</>}
              </button>
            </div>

            {/* Step 2 */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">2</div>
                <span className="font-semibold text-gray-800">Đọc to và ghi âm</span>
              </div>
              {isAssessing ? (
                <div className="flex items-center justify-center py-6 gap-3 text-blue-600">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span className="font-medium">Đang đánh giá phát âm...</span>
                </div>
              ) : (
                <Recorder onRecordingComplete={handleRecordingComplete} />
              )}
              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
            </div>

            <button onClick={reset} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              ← Chọn câu khác
            </button>
          </div>
        )}

        {/* Step: Result */}
        {step === 'result' && result && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-2">Câu đã luyện</p>
              <p className="text-base text-gray-800 leading-relaxed">{referenceText}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <ScoreDisplay result={result} onWordClick={setSelectedWord} />
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-amber-700 text-sm">🤖 Nhận xét từ AI</span>
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
                  <div className="h-3 bg-amber-200 rounded-full w-full" />
                  <div className="h-3 bg-amber-200 rounded-full w-5/6" />
                  <div className="h-3 bg-amber-200 rounded-full w-4/6" />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('record')}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold py-3 rounded-xl transition-all shadow-sm"
              >
                Thử lại
              </button>
              <button
                onClick={reset}
                className="flex-1 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3 rounded-xl transition-colors"
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
