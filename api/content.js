const crypto = require("crypto");

const reply = (res, status, body) => res.status(status).json(body);
const env = () => ({
  token: process.env.GITHUB_TOKEN,
  repo: process.env.GITHUB_REPO,
  branch: process.env.GITHUB_BRANCH || "main",
  secret: process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || ""
});
const authenticated = req => {
  const { secret } = env();
  if (!secret || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) return false;
  const raw = String(req.headers.cookie || "").split(";").map(x => x.trim()).find(x => x.startsWith("sb_admin="));
  if (!raw) return false;
  const [expires, signature] = decodeURIComponent(raw.slice(9)).split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  const expected = crypto.createHmac("sha256", secret).update(expires).digest("hex");
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};
const github = async (path, options = {}) => {
  const { token, repo, branch } = env();
  if (!token || !repo) throw Object.assign(new Error("Add GITHUB_TOKEN and GITHUB_REPO in Vercel before using the editor."), { status: 503 });
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const url = `https://api.github.com/repos/${repo}/contents/${encodedPath}`;
  const response = await fetch(options.method ? url : `${url}?ref=${encodeURIComponent(branch)}`, {
    ...options,
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28", ...(options.headers || {}) }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.message || "GitHub could not complete that request."), { status: response.status });
  return data;
};

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (!authenticated(req)) return reply(res, 401, { error: "Please sign in again." });
  try {
    if (req.method === "GET") {
      const file = await github("index.html");
      return reply(res, 200, { html: Buffer.from(file.content, "base64").toString("utf8"), sha: file.sha });
    }
    if (req.method === "PUT") {
      const html = String(req.body?.html || "");
      const sha = String(req.body?.sha || "");
      if (!html.toLowerCase().includes("<!doctype html>") || html.length > 500000) return reply(res, 400, { error: "Please provide a complete HTML page under 500 KB." });
      if (!sha) return reply(res, 400, { error: "Reload the latest page before saving." });
      const { branch } = env();
      const result = await github("index.html", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Update website from Spring Blossom admin", content: Buffer.from(html, "utf8").toString("base64"), sha, branch })
      });
      return reply(res, 200, { ok: true, sha: result.content.sha });
    }
    return reply(res, 405, { error: "Method not allowed." });
  } catch (error) {
    const status = error.status === 409 || error.status === 422 ? 409 : (error.status || 500);
    const message = status === 409 ? "The page changed elsewhere. Refresh the admin page and try again." : error.message;
    return reply(res, status, { error: message });
  }
};
