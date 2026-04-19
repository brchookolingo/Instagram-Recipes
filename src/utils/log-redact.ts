export function redactUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.hostname}/…`;
  } catch {
    return "[invalid url]";
  }
}

export function redactError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message.slice(0, 200)}`;
  }
  if (typeof error === "string") return error.slice(0, 200);
  return "unknown error";
}
