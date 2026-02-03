import { getStore } from "netlify:blobs";

// Rule: 2 letters + 2 digits + (a | t)
const TOKEN_REGEX = /^[a-zA-Z]{2}[0-9]{2}[atAT]$/;

export default async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response(
      JSON.stringify({ ok: false, reason: "missing_token" }),
      { status: 400 }
    );
  }

  if (!TOKEN_REGEX.test(token)) {
    return new Response(
      JSON.stringify({ ok: false, reason: "invalid_format" }),
      { status: 403 }
    );
  }

  const normalizedToken = token.toLowerCase();

  const store = getStore("valentine-tokens");
  const used = await store.get(normalizedToken);

  if (used) {
    return new Response(
      JSON.stringify({ ok: false, reason: "already_used" }),
      { status: 403 }
    );
  }

  await store.set(normalizedToken, "used");

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200 }
  );
};
