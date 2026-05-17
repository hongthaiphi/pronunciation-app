'use client';

import { useState } from 'react';
import type { PronunciationResult, WordResult } from '@/lib/azure';

interface ScoreDisplayProps {
  result: PronunciationResult;
  onWordClick?: (word: WordResult) => void;
}

function ScoreCircle({ label, score }: { label: string; score: number }) {
  const color =
    score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-500' : 'text-red-500';
  const ring =
    score >= 80 ? 'border-green-500' : score >= 60 ? 'border-yellow-400' : 'border-red-400';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-16 h-16 rounded-full border-4 ${ring} flex items-center justify-center`}>
        <span className={`text-lg font-bold ${color}`}>{Math.round(score)}</span>
      </div>
      <span className="text-xs text-gray-500 text-center leading-tight">{label}</span>
    </div>
  );
}

function WordChip({
  word,
  onClick,
}: {
  word: WordResult;
  onClick: () => void;
}) {
  const style =
    word.errorType === 'None' || word.accuracyScore >= 80
      ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200'
      : word.accuracyScore >= 60
      ? 'bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200'
      : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200';

  return (
    <button
      onClick={onClick}
      className={`inline-block px-2 py-1 rounded border text-base font-medium transition-colors cursor-pointer ${style}`}
      title={`Điểm: ${Math.round(word.accuracyScore)}`}
    >
      {word.word}
    </button>
  );
}

export default function ScoreDisplay({ result, onWordClick }: ScoreDisplayProps) {
  const overall = Math.round(
    (result.accuracyScore + result.fluencyScore + result.completenessScore + result.prosodyScore) / 4
  );

  return (
    <div className="space-y-6">
      {/* Overall score */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={`w-24 h-24 rounded-full border-4 flex items-center justify-center ${
            overall >= 80
              ? 'border-green-500 bg-green-50'
              : overall >= 60
              ? 'border-yellow-400 bg-yellow-50'
              : 'border-red-400 bg-red-50'
          }`}
        >
          <span
            className={`text-3xl font-bold ${
              overall >= 80 ? 'text-green-600' : overall >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}
          >
            {overall}
          </span>
        </div>
        <span className="text-sm font-semibold text-gray-600">Điểm tổng</span>
      </div>

      {/* Sub-scores */}
      <div className="grid grid-cols-4 gap-4">
        <ScoreCircle label="Chính xác" score={result.accuracyScore} />
        <ScoreCircle label="Trôi chảy" score={result.fluencyScore} />
        <ScoreCircle label="Hoàn chỉnh" score={result.completenessScore} />
        <ScoreCircle label="Ngữ điệu" score={result.prosodyScore} />
      </div>

      {/* Word-level highlight */}
      {result.words.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-3">
            Kết quả từng từ{' '}
            <span className="font-normal text-gray-400">(click để xem chi tiết phoneme)</span>
          </p>
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
            {result.words.map((w, i) => (
              <WordChip key={i} word={w} onClick={() => onWordClick?.(w)} />
            ))}
          </div>
          {/* Legend */}
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-green-200 border border-green-300 inline-block" />
              Đúng (≥80)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-yellow-100 border border-yellow-300 inline-block" />
              Gần đúng (60–79)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300 inline-block" />
              Sai (&lt;60)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
