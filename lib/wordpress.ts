import { readFileSync } from "fs";
import path from "path";

export interface WpPublishOptions {
  title: string;
  content: string;
  status: "draft" | "publish";
  excerpt?: string;
  slug?: string;
  tagNames?: string[];
  imageUrl?: string;
}

function wpHeaders(): HeadersInit {
  const creds = Buffer.from(
    `${process.env.WP_USERNAME}:${process.env.WP_APP_PASSWORD}`,
  ).toString("base64");
  return {
    Authorization: `Basic ${creds}`,
    "Content-Type": "application/json",
  };
}

function imageHeaders(): HeadersInit {
  const creds = Buffer.from(
    `${process.env.WP_USERNAME}:${process.env.WP_APP_PASSWORD}`,
  ).toString("base64");
  return {
    Authorization: `Basic ${creds}`,
    "Content-Type": "image/png",
    "Content-Disposition": 'attachment; filename="thumbnail.png"',
  };
}

export async function checkWordPress(): Promise<{
  siteAccess: boolean;
  restApi: boolean;
  auth: boolean;
  draftTest: boolean;
  imageTest: boolean;
  categories: boolean;
}> {
  const url = process.env.WP_URL!;
  const h = wpHeaders();
  const r = { siteAccess: false, restApi: false, auth: false, draftTest: false, imageTest: false, categories: false };

  try { r.siteAccess = (await fetch(url)).ok; } catch {}
  try { r.restApi = (await fetch(`${url}/wp-json/`)).ok; } catch {}
  try { r.auth = (await fetch(`${url}/wp-json/wp/v2/users/me`, { headers: h })).ok; } catch {}

  try {
    const res = await fetch(`${url}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: h,
      body: JSON.stringify({ title: "Connection Test", status: "draft" }),
    });
    if (res.ok) {
      const post = await res.json() as { id: number };
      r.draftTest = true;
      await fetch(`${url}/wp-json/wp/v2/posts/${post.id}?force=true`, { method: "DELETE", headers: h });
    }
  } catch {}

  try {
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
      "base64",
    );
    const imgH = { ...imageHeaders(), "Content-Type": "image/png", "Content-Disposition": 'attachment; filename="test.png"' };
    const res = await fetch(`${url}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: imgH,
      body: png,
    });
    if (res.ok) {
      const media = await res.json() as { id: number };
      r.imageTest = true;
      await fetch(`${url}/wp-json/wp/v2/media/${media.id}?force=true`, { method: "DELETE", headers: h });
    }
  } catch {}

  try { r.categories = (await fetch(`${url}/wp-json/wp/v2/categories`, { headers: h })).ok; } catch {}

  return r;
}

async function resolveTagIds(tagNames: string[]): Promise<number[]> {
  const url = process.env.WP_URL!;
  const h = wpHeaders();
  const ids: number[] = [];
  for (const name of tagNames) {
    try {
      const searchRes = await fetch(
        `${url}/wp-json/wp/v2/tags?search=${encodeURIComponent(name)}`,
        { headers: h },
      );
      const existing = await searchRes.json() as Array<{ id: number; name: string }>;
      const found = existing.find((t) => t.name.toLowerCase() === name.toLowerCase());
      if (found) {
        ids.push(found.id);
      } else {
        const createRes = await fetch(`${url}/wp-json/wp/v2/tags`, {
          method: "POST",
          headers: h,
          body: JSON.stringify({ name }),
        });
        if (createRes.ok) {
          const tag = await createRes.json() as { id: number };
          ids.push(tag.id);
        }
      }
    } catch {}
  }
  return ids;
}

export async function publishToWordPress(
  options: WpPublishOptions,
): Promise<{ url: string; id: number }> {
  const wpUrl = process.env.WP_URL!;
  const h = wpHeaders();

  let featuredMediaId: number | undefined;
  if (options.imageUrl) {
    try {
      let mediaBody: ArrayBuffer;
      if (options.imageUrl.startsWith("/")) {
        // 로컬 파일 (public/thumbnails/xxx.png)
        const data = readFileSync(path.join(process.cwd(), "public", options.imageUrl));
        mediaBody = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
      } else {
        // 외부 URL
        const imgRes = await fetch(options.imageUrl);
        mediaBody = await imgRes.arrayBuffer();
      }
      const mediaRes = await fetch(`${wpUrl}/wp-json/wp/v2/media`, {
        method: "POST",
        headers: imageHeaders(),
        body: mediaBody,
      });
      if (mediaRes.ok) {
        const media = await mediaRes.json() as { id: number };
        featuredMediaId = media.id;
      }
    } catch {}
  }

  const tagIds = options.tagNames ? await resolveTagIds(options.tagNames) : [];

  const body: Record<string, unknown> = {
    title: options.title,
    content: options.content,
    status: options.status,
    slug: options.slug,
    excerpt: options.excerpt,
  };
  if (featuredMediaId) body.featured_media = featuredMediaId;
  if (tagIds.length) body.tags = tagIds;

  const res = await fetch(`${wpUrl}/wp-json/wp/v2/posts`, {
    method: "POST",
    headers: h,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json() as { message?: string };
    throw new Error(err.message ?? "WordPress 발행에 실패했습니다");
  }

  const post = await res.json() as { link: string; id: number };
  return { url: post.link, id: post.id };
}
