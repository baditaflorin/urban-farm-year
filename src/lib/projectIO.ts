import type { SmartDraft } from './inference';
import { inferGardenInput } from './inference';
import { stableHash } from './inference/stable';
import { parseStateEnvelope, type StateEnvelope } from './stateSchema';

export type InputRoute = 'state-json' | 'garden-text' | 'image' | 'unsupported';

export type ImportOutcome =
  | {
      id: string;
      fileName: string;
      route: 'state-json';
      status: 'state';
      message: string;
      envelope: StateEnvelope;
    }
  | {
      id: string;
      fileName: string;
      route: 'garden-text';
      status: 'draft';
      message: string;
      draft: SmartDraft;
    }
  | {
      id: string;
      fileName: string;
      route: 'image' | 'unsupported';
      status: 'skipped' | 'error';
      message: string;
    };

const textExtensions = ['.txt', '.csv', '.tsv', '.html', '.htm', '.md'];

export async function importGardenFiles(files: File[]): Promise<ImportOutcome[]> {
  const outcomes: ImportOutcome[] = [];
  for (const file of files) {
    outcomes.push(await importGardenFile(file));
  }
  return outcomes;
}

export async function importGardenFile(file: File): Promise<ImportOutcome> {
  const route = routeFile(file.name, file.type);
  const id = stableHash(`${file.name}:${file.size}:${file.lastModified}`);

  try {
    if (route === 'image') {
      return {
        id,
        fileName: file.name,
        route,
        status: 'skipped',
        message:
          'Images are handled in the Classifier tab. This project import keeps text and state files together.',
      };
    }
    if (route === 'unsupported') {
      return {
        id,
        fileName: file.name,
        route,
        status: 'error',
        message:
          'This file type is not supported. Use TXT, CSV, TSV, HTML, Markdown, or Urban Farm Year JSON.',
      };
    }

    const text = await file.text();
    return importText(file.name, text, route);
  } catch (error) {
    if (route === 'image' || route === 'unsupported') {
      return {
        id,
        fileName: file.name,
        route,
        status: 'error',
        message: friendlyError(error, 'The file could not be read. Try a different file.'),
      };
    }
    return {
      id,
      fileName: file.name,
      route: 'unsupported',
      status: 'error',
      message: friendlyError(
        error,
        'The file could not be read. Try exporting it as UTF-8 text, CSV, TSV, or JSON.',
      ),
    };
  }
}

export function importText(
  fileName: string,
  text: string,
  forcedRoute?: InputRoute,
): ImportOutcome {
  const route =
    forcedRoute === 'state-json' || looksLikeStateJSON(fileName, text)
      ? 'state-json'
      : 'garden-text';
  const id = stableHash(`${fileName}:${text}`);

  if (route === 'state-json') {
    const value: unknown = JSON.parse(text);
    const envelope = parseStateEnvelope(value);
    return {
      id,
      fileName,
      route,
      status: 'state',
      envelope,
      message: `Project file ready: ${envelope.state.profile.locationName}.`,
    };
  }

  const draft = inferGardenInput(text);
  return {
    id,
    fileName,
    route,
    status: 'draft',
    draft,
    message: `${draft.title}: ${Math.round(draft.confidence * 100)}% confidence.`,
  };
}

export async function readClipboardText(): Promise<string> {
  if (!navigator.clipboard?.readText) {
    throw new Error('Clipboard read is unavailable. Paste into the text box instead.');
  }
  const text = await navigator.clipboard.readText();
  if (!text.trim()) {
    throw new Error(
      'The clipboard did not contain text. Copy garden text, CSV, TSV, or JSON first.',
    );
  }
  return text;
}

export async function fetchImportUrl(url: string): Promise<string> {
  const parsed = new URL(url);
  const response = await fetch(parsed.toString(), {
    headers: { Accept: 'text/plain,text/html,application/json,*/*' },
  });
  if (!response.ok) {
    throw new Error(`The URL returned HTTP ${response.status}. Paste the page text instead.`);
  }
  return response.text();
}

export function routeFile(name: string, mime: string): InputRoute {
  const lowerName = name.toLowerCase();
  if (mime.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(lowerName)) {
    return 'image';
  }
  if (lowerName.endsWith('.json') || mime === 'application/json') {
    return 'state-json';
  }
  if (
    mime.startsWith('text/') ||
    textExtensions.some((extension) => lowerName.endsWith(extension))
  ) {
    return 'garden-text';
  }
  return 'unsupported';
}

export function makeShareUrl(stateJson: string, href: string): string {
  const url = new URL(href);
  url.hash = `state=${base64UrlEncode(stateJson)}`;
  return url.toString();
}

export function stateJSONFromHash(hash: string): string | null {
  const value = hash.startsWith('#') ? hash.slice(1) : hash;
  const params = new URLSearchParams(value);
  const encoded = params.get('state');
  return encoded ? base64UrlDecode(encoded) : null;
}

export function friendlyError(error: unknown, fallback: string): string {
  return error instanceof Error ? `${error.message} ${fallback}` : fallback;
}

function looksLikeStateJSON(fileName: string, text: string): boolean {
  return (
    fileName.toLowerCase().endsWith('.json') ||
    /"schema_version"\s*:\s*"urban-farm-year\.state\./.test(text)
  );
}

function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function base64UrlDecode(value: string): string {
  const padded = value
    .replaceAll('-', '+')
    .replaceAll('_', '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
