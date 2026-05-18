'use client';

import type { WordResult } from '@/lib/azure';
import { toIPA } from '@/lib/phoneme';

interface PhonemeDetailProps {
  word: WordResult | null;
  onClose: () => void;
}

export default function PhonemeDetail({ word, onClose }: PhonemeDetailProps) {
  if (!word) return null;

  const playNative = (azurePhoneme: string) => {
    const utterance = new SpeechSynthesisUtterance(toIPA(azurePhoneme));
    utterance.lang = 'en-US';
    utterance.rate = 0.6;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{word.word}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Điểm: {Math.round(word.accuracyScore)}/100
              {word.errorType !== 'None' && (
                <span className="ml-2 text-red-500">({word.errorType})</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 mb-3">Chi tiết Phoneme:</p>
          {word.phonemes.map((p, i) => {
            const color =
              p.accuracyScore >= 80
                ? 'bg-green-50 border-green-300 text-green-700'
                : p.accuracyScore >= 60
                ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                : 'bg-red-50 border-red-300 text-red-700';

            return (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-lg border ${color}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-lg font-bold">/{toIPA(p.phoneme)}/</span>
                  <div className="w-16 sm:w-24 h-2 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-current opacity-60"
                      style={{ width: `${p.accuracyScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{Math.round(p.accuracyScore)}</span>
                </div>
                <button
                  onClick={() => playNative(p.phoneme)}
                  className="text-gray-500 hover:text-blue-600 transition-colors text-lg"
                  title="Nghe phát âm chuẩn"
                >
                  🔊
                </button>
              </div>
            );
          })}
        </div>

        {word.phonemes.some((p) => p.accuracyScore < 60) && (
          <p className="mt-4 text-sm text-gray-500 bg-blue-50 p-3 rounded-lg">
            💡 Nhấn 🔊 để nghe phát âm chuẩn của từng âm vị rồi luyện theo
          </p>
        )}
      </div>
    </div>
  );
}
