const crypto = require("crypto");

const allowed = new Set(["INTERIOR.png","FOOD_1.png","FOOD_2.png","COCKTAIL.png","11 (3).png","12 (3).png","13 (3).png","14 (3).png","15 (3).png","16 (3).png","17 (3).png","18 (3).png","WEBSITE QR.png","FACEBOOK QR.png","INSTAGRAM QR.png"]);
const reply = (res, status, body) => res.status(status).json(body);
const settings = () => ({ token:process.env.GITHUB_TOKEN, repo:process.env.GITHUB_REPO, branch:process.env.GITHUB_BRANCH || "main", secret:process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "" });
const authenticated = req => {
  const { secret } = settings();
  const raw = String(req.headers.cookie || "").split(";").map(x => x.trim()).find(x => x.startsWith("sb_admin="));
  if (!secret || !process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !raw) return false;
  const [expires, signature] = decodeURIComponent(raw.slice(9)).split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  const expected = crypto.createHmac("sha256", secret).update(expires).digest("hex");
  return signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};
const github = async (path, options = {}) => {
  const { token, repo, branch } = settings();
  if (!token || !repo) throw Object.assign(new Error("Add GITHUB_TOKEN and GITHUB_REPO in Vercel before uploading pictures."), { status:503 });
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const base = `https://api.github.com/repos/${repo}/contents/${encoded}`;
  const response = await fetch(options.method ? base : `${base}?ref=${encodeURIComponent(branch)}`, { ...options, headers:{ Accept:"application/vnd.github+json", Authorization:`Bearer ${token}`, "X-GitHub-Api-Version":"2022-11-28", ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.message || "GitHub could not complete the upload."), { status:response.status });
  return data;
};

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "PUT") return reply(res, 405, { error:"Method not allowed." });
  if (!authenticated(req)) return reply(res, 401, { error:"Please sign in again." });
  const path = String(req.body?.path || "");
  const content = String(req.body?.content || "");
  if (!allowed.has(path)) return reply(res, 400, { error:"That image slot cannot be changed." });
  if (req.body?.mime !== "image/png" || !content || content.length > 4.1 * 1024 * 1024) return reply(res, 400, { error:"Please upload a PNG image smaller than 3 MB." });
  try {
    const current = await github(path);
    const { branch } = settings();
    await github(path, { method:"PUT", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ message:`Replace ${path} from Spring Blossom admin`, content, sha:current.sha, branch }) });
    return reply(res, 200, { ok:true });
  } catch (error) {
    return reply(res, error.status || 500, { error:error.message });
  }
};
