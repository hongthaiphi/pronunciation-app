// Mapping từ Azure SAPI phoneme → IPA chuẩn (en-US)
const AZURE_TO_IPA: Record<string, string> = {
  // Vowels
  aa: 'ɑː',   // "father"
  ae: 'æ',    // "cat"
  ah: 'ʌ',    // "cup"
  ao: 'ɔː',   // "law"
  aw: 'aʊ',   // "cow"
  ax: 'ə',    // "about" (schwa)
  ay: 'aɪ',   // "sky"
  eh: 'ɛ',    // "bed"
  er: 'ɜːr',  // "bird"
  ey: 'eɪ',   // "say"
  ih: 'ɪ',    // "sit"
  iy: 'iː',   // "see"
  ow: 'oʊ',   // "go"
  oy: 'ɔɪ',   // "boy"
  uh: 'ʊ',    // "book"
  uw: 'uː',   // "food"

  // Consonants
  b:  'b',
  ch: 'tʃ',   // "church"
  d:  'd',
  dh: 'ð',    // "this"
  f:  'f',
  g:  'ɡ',
  hh: 'h',
  jh: 'dʒ',   // "judge"
  k:  'k',
  l:  'l',
  m:  'm',
  n:  'n',
  ng: 'ŋ',    // "sing"
  p:  'p',
  r:  'r',
  s:  's',
  sh: 'ʃ',    // "she"
  t:  't',
  th: 'θ',    // "think"
  v:  'v',
  w:  'w',
  y:  'j',
  z:  'z',
  zh: 'ʒ',    // "measure"
};

export function toIPA(azurePhoneme: string): string {
  return AZURE_TO_IPA[azurePhoneme.toLowerCase()] ?? azurePhoneme;
}
