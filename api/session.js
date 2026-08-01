const crypto = require("crypto");

const json = (res, status, body) => res.status(status).json(body);
const secret = () => process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
const sign = value => crypto.createHmac("sha256", secret()).update(value).digest("hex");

module.exports = async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", "sb_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0");
    return json(res, 200, { ok: true });
  }
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed." });
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !secret()) return json(res, 503, { error: "Admin credentials have not been configured in Vercel yet." });

  const matches = (supplied, expected) => {
    const suppliedHash = crypto.createHash("sha256").update(String(supplied)).digest();
    const expectedHash = crypto.createHash("sha256").update(String(expected)).digest();
    return crypto.timingSafeEqual(suppliedHash, expectedHash);
  };
  const validUsername = matches(req.body?.username || "", process.env.ADMIN_USERNAME);
  const validPassword = matches(req.body?.password || "", process.env.ADMIN_PASSWORD);
  if (!validUsername || !validPassword) return json(res, 401, { error: "The username or password is incorrect." });

  const expires = String(Date.now() + 8 * 60 * 60 * 1000);
  const token = `${expires}.${sign(expires)}`;
  res.setHeader("Set-Cookie", `sb_admin=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`);
  return json(res, 200, { ok: true });
};
