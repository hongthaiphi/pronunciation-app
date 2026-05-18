'use client';

import type { PronunciationResult, WordResult } from '@/lib/azure';
import { toIPA } from '@/lib/phoneme';

interface PassageResultProps {
  result: PronunciationResult;
  onPlayWord?: (word: string) => void;
  onWordDetails?: (word: WordResult) => void;
}

type WordStatus = 'correct' | 'fair' | 'wrong' | 'omitted';

function getStatus(word: WordResult): WordStatus {
  if (word.errorType === 'Omission') return 'omitted';
  if (word.accuracyScore >= 80) return 'correct';
  if (word.accuracyScore >= 60) return 'fair';
  return 'wrong';
}

const STATUS_STYLE: Record<WordStatus, string> = {
  correct: 'bg-green-100 text-green-800 hover:bg-green-200',
  fair:    'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  wrong:   'bg-red-100 text-red-600 hover:bg-red-200',
  omitted: 'bg-red-100 text-red-400 line-through hover:bg-red-200',
};

function WordToken({
  word,
  onPlay,
  onDetails,
}: {
  word: WordResult;
  onPlay: () => void;
  onDetails: () => void;
}) {
  const status = getStatus(word);
  const isDifficult = status === 'fair' || status === 'wrong' || status === 'omitted';
  const ipa = word.phonemes.map((p) => toIPA(p.phoneme)).join('');

  return (
    <span className="inline-flex flex-col items-center mx-0.5 mb-2">
      <span
        onClick={onPlay}
        title={`Tap để nghe "${word.word}" — ${Math.round(word.accuracyScore)}/100`}
        className={`px-1.5 py-0.5 rounded text-sm font-medium transition-colors cursor-pointer active:scale-95 ${STATUS_STYLE[status]}`}
      >
        {word.word}
      </span>
      {isDifficult && ipa && (
        <span
          onClick={onDetails}
          title="Xem chi tiết phoneme"
          className="text-[9px] text-blue-400 hover:text-blue-600 font-mono leading-none mt-0.5 cursor-pointer transition-colors"
        >
          /{ipa}/
        </span>
      )}
    </span>
  );
}

export default function PassageResult({ result, onPlayWord, onWordDetails }: PassageResultProps) {
  const correct = result.words.filter((w) => w.accuracyScore >= 80).length;
  const fair = result.words.filter((w) => w.accuracyScore >= 60 && w.accuracyScore < 80).length;
  const wrong = result.words.filter((w) => w.accuracyScore < 60 && w.errorType !== 'Omission').length;
  const omitted = result.words.filter((w) => w.errorType === 'Omission').length;

  const overall = Math.round(
    (result.accuracyScore + result.fluencyScore + result.completenessScore) / 3
  );

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{overall}</div>
          <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Tổng</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-xl sm:text-2xl font-bold text-green-600">{correct}</div>
          <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Đúng</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <div className="text-xl sm:text-2xl font-bold text-yellow-600">{fair}</div>
          <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Khá</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <div className="text-xl sm:text-2xl font-bold text-red-500">{wrong + omitted}</div>
          <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Sai/bỏ</div>
        </div>
      </div>

      {/* Passage display */}
      <div>
        <p className="text-xs text-gray-400 mb-2">
          Tap từ để nghe phát âm — tap <span className="font-mono text-blue-400">/ipa/</span> để xem chi tiết phoneme
        </p>
        <div className="bg-gray-50 rounded-lg p-4 leading-[2.5rem]">
          <div className="flex flex-wrap items-end">
            {result.words.map((w, i) => (
              <WordToken
                key={i}
                word={w}
                onPlay={() => onPlayWord?.(w.word)}
                onDetails={() => onWordDetails?.(w)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" />
          Đúng (≥80)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300 inline-block" />
          Khá (60–79)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" />
          Sai / Bỏ qua (&lt;60)
        </span>
        <span className="flex items-center gap-1 font-mono text-[10px]">
          /ɪPA/ = từ cần luyện thêm
        </span>
      </div>
    </div>
  );
}
