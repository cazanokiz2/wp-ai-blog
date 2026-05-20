import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateImage(prompt: string): Promise<string> {
  const res = await client.images.generate({
    model: "dall-e-3",
    prompt,
    size: "1792x1024",
    quality: "standard",
    response_format: "b64_json",
    n: 1,
  });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error("이미지 데이터를 받지 못했습니다");
  return b64;
}
