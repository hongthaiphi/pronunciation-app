'use client';

import type { PronunciationResult, WordResult } from '@/lib/azure';
import { toIPA } from '@/lib/phoneme';

interface ScoreDisplayProps {
  result: PronunciationResult;
  onWordClick?: (word: WordResult) => void;
}

function scoreGradient(score: number) {
  if (score >= 80) return 'from-emerald-400 to-green-500';
  if (score >= 60) return 'from-amber-400 to-yellow-500';
  return 'from-red-400 to-rose-500';
}

function scoreBg(score: number) {
  if (score >= 80) return 'bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'bg-amber-50 border-amber-200';
  return 'bg-red-50 border-red-200';
}

function phonemeColor(score: number) {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-300';
  if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-300';
  return 'bg-red-100 text-red-600 border-red-300';
}

function ScoreCard({ label, score, icon }: { label: string; score: number; icon: string }) {
  return (
    <div className={`rounded-2xl border p-3 text-center ${scoreBg(score)}`}>
      <div className={`text-xl font-extrabold bg-gradient-to-br ${scoreGradient(score)} bg-clip-text text-transparent`}>
        {Math.round(score)}
      </div>
      <div className="text-lg">{icon}</div>
      <div className="text-[10px] text-gray-500 font-medium leading-tight mt-0.5">{label}</div>
    </div>
  );
}

function WordChip({ word, onClick }: { word: WordResult; onClick: () => void }) {
  const isOmitted = word.errorType === 'Omission';
  const hasPhonemes = word.phonemes.length > 0;
  const avgScore = hasPhonemes
    ? word.phonemes.reduce((s, p) => s + p.accuracyScore, 0) / word.phonemes.length
    : 100;

  return (
    <button
      onClick={onClick}
      title="Click để xem chi tiết"
      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer ${
        isOmitted
          ? 'border-red-200 bg-red-50'
          : avgScore >= 80
          ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-300'
          : avgScore >= 60
          ? 'border-amber-200 bg-amber-50 hover:border-amber-300'
          : 'border-red-200 bg-red-50 hover:border-red-300'
      }`}
    >
      <span className={`text-sm font-semibold ${isOmitted ? 'line-through text-gray-400' : 'text-gray-700'}`}>
        {word.word}
      </span>
      {!isOmitted && hasPhonemes && (
        <div className="flex flex-wrap justify-center gap-0.5">
          {word.phonemes.map((p, i) => (
            <span key={i} className={`text-[10px] font-mono px-1 rounded border ${phonemeColor(p.accuracyScore)}`}>
              {toIPA(p.phoneme)}
            </span>
          ))}
        </div>
      )}
      {isOmitted && <span className="text-[10px] text-red-400 font-medium">bỏ qua</span>}
    </button>
  );
}

export default function ScoreDisplay({ result, onWordClick }: ScoreDisplayProps) {
  const overall = Math.round(
    (result.accuracyScore + result.fluencyScore + result.completenessScore + result.prosodyScore) / 4
  );

  return (
    <div className="space-y-5">
      {/* Overall score */}
      <div className="flex flex-col items-center gap-2">
        <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${scoreGradient(overall)} flex items-center justify-center shadow-lg`}>
          <span className="text-3xl font-extrabold text-white">{overall}</span>
        </div>
        <span className="text-sm font-bold text-gray-600">Điểm tổng</span>
      </div>

      {/* Sub-scores */}
      <div className="grid grid-cols-4 gap-2">
        <ScoreCard label="Chính xác" score={result.accuracyScore} icon="🎯" />
        <ScoreCard label="Trôi chảy" score={result.fluencyScore} icon="🌊" />
        <ScoreCard label="Hoàn chỉnh" score={result.completenessScore} icon="✅" />
        <ScoreCard label="Ngữ điệu" score={result.prosodyScore} icon="🎵" />
      </div>

      {/* Word-level */}
      {result.words.length > 0 && (
        <div>
          <p className="text-sm font-bold text-gray-700 mb-3">
            Kết quả từng từ{' '}
            <span className="font-normal text-gray-400 text-xs">(click để xem phoneme)</span>
          </p>
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-2xl">
            {result.words.map((w, i) => (
              <WordChip key={i} word={w} onClick={() => onWordClick?.(w)} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" /> Đúng ≥80
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 inline-block" /> Gần đúng 60–79
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Sai &lt;60
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
