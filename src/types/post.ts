import { Recipe } from "./recipe";

/** Fields common to every fetched post, regardless of platform. */
interface BasePost {
  caption?: string;
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  authorName?: string;
  isVideoPost?: boolean;
  html?: string;
  /** Pre-extracted structured recipe data (skips AI parsing step). */
  partialRecipe?: Partial<Recipe> & { imageUrl?: string };
}

export interface InstagramPost extends BasePost {
  platform: "instagram";
}

export interface TikTokPost extends BasePost {
  platform: "tiktok";
}

export interface PinterestPost extends BasePost {
  platform: "pinterest";
}

/** A post fetched from any supported platform. */
export type RawPost = InstagramPost | TikTokPost | PinterestPost;
