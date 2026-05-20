export function generateImageFree(prompt: string): string {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=1536&height=1024&nologo=true&seed=${Date.now()}`;
}
