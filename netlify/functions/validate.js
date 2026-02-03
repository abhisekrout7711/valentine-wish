import { getStore } from "@netlify/blobs";

// Rule: 2 letters + 2 digits + (a | t)
const TOKEN_REGEX = /^[a-zA-Z]{2}[0-9]{2}[atAT]$/;

export default async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, reason: "missing_token" })
    };
  }

  if (!TOKEN_REGEX.test(token)) {
    return {
      statusCode: 403,
      body: JSON.stringify({ ok: false, reason: "invalid_format" })
    };
  }

  const normalizedToken = token.toLowerCase();
  const store = getStore("valentine-tokens");

  const used = await store.get(normalizedToken);
  if (used) {
    return {
      statusCode: 403,
      body: JSON.stringify({ ok: false, reason: "already_used" })
    };
  }

  await store.set(normalizedToken, "used");

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true })
  };
};
