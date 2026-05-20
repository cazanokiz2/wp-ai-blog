import { Redis } from "@upstash/redis";
import type { BlogState, Draft } from "./types";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const DRAFTS_KEY = "drafts";

async function read(): Promise<Draft[]> {
  const drafts = await redis.get<Draft[]>(DRAFTS_KEY);
  return drafts ?? [];
}

async function write(drafts: Draft[]): Promise<void> {
  await redis.set(DRAFTS_KEY, drafts);
}

export async function getAllDrafts(): Promise<Draft[]> {
  const drafts = await read();
  return drafts.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function saveDraft(data: BlogState): Promise<Draft> {
  const drafts = await read();
  const draft: Draft = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    keyword: data.keyword,
    selectedTitle: data.selectedTitle,
    data,
  };
  drafts.push(draft);
  await write(drafts);
  return draft;
}

export async function updateDraft(
  id: string,
  data: Partial<BlogState>,
): Promise<Draft | null> {
  const drafts = await read();
  const idx = drafts.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  drafts[idx] = {
    ...drafts[idx],
    data: { ...drafts[idx].data, ...data },
    selectedTitle: data.selectedTitle ?? drafts[idx].selectedTitle,
    updatedAt: new Date().toISOString(),
  };
  await write(drafts);
  return drafts[idx];
}

export async function deleteDraft(id: string): Promise<boolean> {
  const drafts = await read();
  const idx = drafts.findIndex((d) => d.id === id);
  if (idx === -1) return false;
  drafts.splice(idx, 1);
  await write(drafts);
  return true;
}
