import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateImage(prompt: string): Promise<string> {
  const res = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1536x1024",
    quality: "high",
    n: 1,
  });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new Error("이미지 데이터를 받지 못했습니다");
  return b64;
}
