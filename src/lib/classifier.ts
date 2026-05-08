export type ClassifierResult = {
  label: string;
  confidence: number;
  engine: 'onnx' | 'fallback';
  details: string;
};

const labels = ['Leafy edible', 'Fruiting crop', 'Herb seedling', 'Stress or disease sign'];

export async function classifyPlantImage(file: File): Promise<ClassifierResult> {
  const features = await imageFeatures(file);
  const onnx = await tryOnnx(features);
  if (onnx) {
    return onnx;
  }
  return fallbackClassify(features);
}

async function tryOnnx(features: number[]): Promise<ClassifierResult | null> {
  try {
    const ort = await import('onnxruntime-web');
    const session = await ort.InferenceSession.create(
      `${import.meta.env.BASE_URL}models/plant_classifier.onnx`,
      { executionProviders: ['wasm'] },
    );
    const tensor = new ort.Tensor('float32', Float32Array.from(features), [1, features.length]);
    const output = await session.run({ features: tensor });
    const first = Object.values(output)[0];
    const scores = Array.from(first.data as Float32Array);
    const probabilities = softmax(scores);
    const index = probabilities.indexOf(Math.max(...probabilities));
    return {
      label: labels[index] ?? labels[0],
      confidence: Math.round((probabilities[index] ?? 0) * 100),
      engine: 'onnx',
      details: 'Tiny local ONNX model using image color and texture features.',
    };
  } catch {
    return null;
  }
}

async function imageFeatures(file: File): Promise<number[]> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const size = 96;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas is unavailable.');
  }
  ctx.drawImage(bitmap, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);

  let green = 0;
  let red = 0;
  let brown = 0;
  let bright = 0;
  let texture = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    if (g > r * 1.08 && g > b * 1.08) green += 1;
    if (r > g * 1.05 && r > b * 1.05) red += 1;
    if (r > 80 && g > 45 && b < 70 && r > g) brown += 1;
    bright += (r + g + b) / (3 * 255);
    texture += max - min;
  }

  const pixels = data.length / 4;
  return [green / pixels, red / pixels, brown / pixels, bright / pixels, texture / (pixels * 255)];
}

function fallbackClassify(features: number[]): ClassifierResult {
  const [green, red, brown, bright, texture] = features;
  if ((brown ?? 0) > 0.18 || ((bright ?? 0) < 0.22 && (texture ?? 0) > 0.2)) {
    return {
      label: 'Stress or disease sign',
      confidence: 67,
      engine: 'fallback',
      details: 'Brown or low-brightness regions are elevated. Inspect watering and leaf surfaces.',
    };
  }
  if ((red ?? 0) > 0.14) {
    return {
      label: 'Fruiting crop',
      confidence: 61,
      engine: 'fallback',
      details: 'Warm fruit-like color features are visible.',
    };
  }
  if ((green ?? 0) > 0.34 && (texture ?? 0) < 0.28) {
    return {
      label: 'Leafy edible',
      confidence: 64,
      engine: 'fallback',
      details: 'Leafy green area dominates the image.',
    };
  }
  return {
    label: 'Herb seedling',
    confidence: 54,
    engine: 'fallback',
    details: 'Small green clusters and mixed texture suggest seedling-scale growth.',
  };
}

function softmax(scores: number[]): number[] {
  const max = Math.max(...scores);
  const exps = scores.map((score) => Math.exp(score - max));
  const total = exps.reduce((sum, value) => sum + value, 0);
  return exps.map((value) => value / total);
}
