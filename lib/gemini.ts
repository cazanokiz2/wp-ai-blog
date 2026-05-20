export async function generateImageGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY가 설정되지 않았습니다");

  // Imagen 4 시도, 실패 시 Imagen 3으로 fallback
  const models = ["imagen-4.0-generate-001", "imagen-3.0-generate-002"];

  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: { sampleCount: 1, aspectRatio: "16:9" },
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = (err as { error?: { message?: string } }).error?.message ?? res.statusText;
        throw new Error(msg);
      }

      const data = await res.json() as {
        predictions?: Array<{ bytesBase64Encoded?: string; mimeType?: string }>;
      };

      const b64 = data.predictions?.[0]?.bytesBase64Encoded;
      if (!b64) throw new Error("이미지 데이터를 받지 못했습니다");

      const mimeType = data.predictions?.[0]?.mimeType ?? "image/png";
      return `data:${mimeType};base64,${b64}`;
    } catch (e) {
      if (model === models[models.length - 1]) throw e;
      console.warn(`[gemini] ${model} 실패, 다음 모델 시도:`, e);
    }
  }

  throw new Error("모든 Gemini 모델 실패");
}
