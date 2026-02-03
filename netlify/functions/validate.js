import { getStore } from "@netlify/blobs";

// Rule: 2 letters + 2 digits + (a | t)
const TOKEN_REGEX = /^[a-zA-Z]{2}[0-9]{2}[atAT]$/;

export default async (req) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  // 1️⃣ Token must exist
  if (!token) {
    return Response.json({ ok: false, reason: "missing_token" });
  }

  // 2️⃣ Token must match the rule
  if (!TOKEN_REGEX.test(token)) {
    return Response.json({ ok: false, reason: "invalid_format" });
  }

  // Normalize token (optional but recommended)
  const normalizedToken = token.toLowerCase();

  // 3️⃣ One-time usage check
  const store = getStore("valentine-tokens");
  const used = await store.get(normalizedToken);

  if (used) {
    return Response.json({ ok: false, reason: "already_used" });
  }

  // 4️⃣ Burn token (mark as used)
  await store.set(normalizedToken, "used");

  // 5️⃣ Allow exactly once
  return Response.json({ ok: true });
};
