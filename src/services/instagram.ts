import { RawPost } from "../types/post";
import { apiPost } from "../utils/api-client";

export type { RawInstagramPost } from "./instagram-oembed";

export async function fetchInstagramPost(
  url: string,
): Promise<RawPost | null> {
  try {
    const post = await apiPost<RawPost>("/api/instagram", { url });
    return post;
  } catch (error) {
    console.error("[instagram] fetchInstagramPost via API route failed:", error);
    return null;
  }
}
