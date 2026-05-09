import type { DraftAnomaly, NormalizedInput } from './types';

export function normalizeGardenInput(raw: string): NormalizedInput {
  const issues: DraftAnomaly[] = [];
  let text = raw;

  if (text.startsWith('\uFEFF')) {
    issues.push({
      code: 'utf8_bom',
      severity: 'info',
      message: 'The pasted text started with a UTF-8 marker.',
      suggestion: 'Removed the marker before reading the garden data.',
    });
    text = text.slice(1);
  }

  text = text
    .replace(/\r\n?/g, '\n')
    .replace(/\u00A0/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/(\d),(\d)/g, '$1.$2');

  if (/[A-Za-z]-\n[A-Za-z]/.test(text)) {
    issues.push({
      code: 'wrapped_word',
      severity: 'warning',
      message: 'A word appears split across a line break.',
      suggestion: 'Merged the wrapped word and marked the draft for review.',
    });
    text = text.replace(/([A-Za-z])-\n([A-Za-z])/g, '$1$2');
  }

  text = text
    .split('\n')
    .map((line) =>
      line.includes('\t') || line.includes(',')
        ? line.trim()
        : line.trim().replace(/[ ]{2,}/g, ' '),
    )
    .join('\n')
    .trim();

  if (!text) {
    issues.push({
      code: 'empty_input',
      severity: 'blocker',
      message: 'No garden data was found in the input.',
      suggestion:
        'Paste a seed packet, planting guide row, soil report, harvest log, or garden note.',
    });
  }

  return { raw, text, issues };
}
