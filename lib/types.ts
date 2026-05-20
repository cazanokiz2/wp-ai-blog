export type ArticleType = "informational" | "comparison" | "issue-analysis";

export interface OutlineItem {
  id: string;
  level: "h2" | "h3";
  text: string;
}

export interface TitleOption {
  title: string;
  seoScore: number;
}

export interface BlogState {
  keyword: string;
  relatedKeywords: string[];
  articleType: ArticleType;
  titleOptions: TitleOption[];
  selectedTitle: string;
  outline: OutlineItem[];
  content: string;
  metaDescription: string;
  tags: string[];
  slug: string;
  thumbnailUrl: string;
  draftId?: string;
}

export interface Draft {
  id: string;
  createdAt: string;
  updatedAt: string;
  keyword: string;
  selectedTitle: string;
  data: BlogState;
}

export interface WpCheckResult {
  siteAccess: boolean;
  restApi: boolean;
  auth: boolean;
  draftTest: boolean;
  imageTest: boolean;
  categories: boolean;
}

export type StepStatus = "idle" | "running" | "done" | "error";

export interface Step {
  id: number;
  label: string;
  status: StepStatus;
  error?: string;
}

export const BLOG_STATE_KEY = "wpAiBlogData";

export function getBlogState(): BlogState | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(BLOG_STATE_KEY);
  return raw ? (JSON.parse(raw) as BlogState) : null;
}

export function setBlogState(state: BlogState): void {
  sessionStorage.setItem(BLOG_STATE_KEY, JSON.stringify(state));
}

export function updateBlogState(updates: Partial<BlogState>): void {
  const current = getBlogState() ?? ({} as BlogState);
  setBlogState({ ...current, ...updates });
}
