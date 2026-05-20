import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateImage(prompt: string): Promise<string> {
  const res = await client.images.generate({
    model: "dall-e-3",
    prompt,
    size: "1792x1024",
    quality: "standard",
    n: 1,
  });
  const url = res.data?.[0]?.url;
  if (!url) throw new Error("이미지 URL을 받지 못했습니다");
  return url;
}
