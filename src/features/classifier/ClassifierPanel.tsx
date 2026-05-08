import { ImageUp, ScanSearch } from 'lucide-react';
import { useEffect, useState } from 'react';
import { classifyPlantImage, type ClassifierResult } from '../../lib/classifier';

export function ClassifierPanel() {
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ClassifierResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const onFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setLoading(true);
    try {
      setResult(await classifyPlantImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to classify this image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <section className="panel">
        <div className="flex items-center gap-2">
          <ImageUp size={20} aria-hidden="true" />
          <h2 className="section-title">Plant Classifier</h2>
        </div>
        <label className="upload-zone mt-4">
          <ScanSearch size={30} aria-hidden="true" />
          <span>Upload a plant image</span>
          <input
            accept="image/*"
            type="file"
            onChange={(event) => void onFile(event.target.files?.[0])}
          />
        </label>
      </section>

      {preview ? (
        <section className="panel media-panel">
          <img src={preview} alt="Uploaded plant" />
          <div>
            {loading ? <p className="muted">Running local classifier...</p> : null}
            {error ? <p className="text-clay">{error}</p> : null}
            {result ? (
              <div className="result-box">
                <span>{result.engine.toUpperCase()}</span>
                <strong>{result.label}</strong>
                <p>
                  {result.confidence}% confidence · {result.details}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
