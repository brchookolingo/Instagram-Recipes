import { fetchInstagramPost } from "../../src/services/instagram";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const url = body?.url;

    if (!url || typeof url !== "string") {
      return Response.json(
        { error: "Missing or invalid url in request body" },
        { status: 400 },
      );
    }

    const post = await fetchInstagramPost(url);

    if (!post) {
      return Response.json({ error: "NOT_FOUND" }, { status: 422 });
    }

    return Response.json(post);
  } catch (error) {
    console.error("[api/instagram] POST failed:", error);
    return Response.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
