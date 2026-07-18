/**
 * 体制 · skill — DeepSeek 中转 Worker
 *
 * 作用：替公网页面持有 DeepSeek API Key（访客免配置），并做防刷限制。
 * 部署：见同目录 README.md。必须配置 Secret：DEEPSEEK_API_KEY
 * 可选环境变量：ALLOWED_ORIGINS（逗号分隔的允许来源，如 "https://onlylt.github.io"；不设则放行所有来源）
 *
 * 防刷三道闸：
 *  1. 按 IP 限流（wrangler 部署时用官方 ratelimit 绑定；控制台粘贴部署时退化为进程内软限流）
 *  2. 请求约束：模型/最大输出写死，消息条数与总字数设上限，只允许流式对话
 *  3. 兜底：DeepSeek 后台只保留少量余额，刷穿即停
 */

const UPSTREAM = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-chat";
const MAX_TOKENS = 1500;      // 单次回答输出上限
const MAX_MESSAGES = 40;      // 单次请求消息条数上限（含 system）
const MAX_CHARS = 60000;      // 所有消息总字符上限（system 提示词约 1.5 万字）
const WINDOW_LIMIT = 8;       // 每 IP 每分钟次数上限
const DAY_LIMIT = 60;         // 每 IP 每天次数上限（按上海时区零点重置）

/* 限流记录（进程内，Worker 实例回收会清零——属"尽力而为"，兜底靠 DeepSeek 余额） */
const hits = new Map();
function shanghaiDay(now) {
  return new Date(now + 8 * 3600e3).toISOString().slice(0, 10);
}
function checkLimits(ip, { windowLimit = WINDOW_LIMIT, windowMs = 60_000, dayLimit = DAY_LIMIT } = {}) {
  const now = Date.now();
  const today = shanghaiDay(now);
  let rec = hits.get(ip);
  if (!rec || rec.day !== today) rec = { day: today, dayCount: 0, stamps: [] };
  rec.stamps = rec.stamps.filter((t) => now - t < windowMs);
  if (rec.dayCount >= dayLimit) {
    hits.set(ip, rec);
    return { ok: false, why: "今天的份额用完了，明天再来问" };
  }
  if (rec.stamps.length >= windowLimit) {
    hits.set(ip, rec);
    return { ok: false, why: "问得太频繁了，歇一分钟再来" };
  }
  rec.stamps.push(now);
  rec.dayCount++;
  if (hits.size > 5000) hits.clear();
  hits.set(ip, rec);
  return { ok: true };
}

function corsHeaders(origin, env) {
  const conf = (env.ALLOWED_ORIGINS || "*").split(",").map((s) => s.trim());
  const ok = conf.includes("*") || conf.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? (origin || "*") : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Vary": "Origin",
  };
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get("Origin") || "";
    const h = corsHeaders(origin, env);

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });
    if (req.method !== "POST") return json({ error: "POST only" }, 405, h);

    // 来源白名单（配置了 ALLOWED_ORIGINS 才启用）
    const conf = env.ALLOWED_ORIGINS || "*";
    if (conf !== "*") {
      const list = conf.split(",").map((s) => s.trim());
      if (!list.includes(origin)) return json({ error: "origin not allowed" }, 403, h);
    }

    // 按 IP 限流：分钟级 + 日配额
    const ip = req.headers.get("CF-Connecting-IP") || "unknown";
    if (env.RATE_LIMITER) {
      // 分钟级交给官方绑定（跨实例更可靠），进程内只管日配额
      const { success } = await env.RATE_LIMITER.limit({ key: ip });
      if (!success) return json({ error: "问得太频繁了，歇一分钟再来" }, 429, h);
      const day = checkLimits(ip, { windowLimit: Infinity });
      if (!day.ok) return json({ error: day.why }, 429, h);
    } else {
      const r = checkLimits(ip);
      if (!r.ok) return json({ error: r.why }, 429, h);
    }

    // 请求体校验
    let body;
    try { body = await req.json(); } catch { return json({ error: "bad json" }, 400, h); }
    const msgs = Array.isArray(body.messages) ? body.messages : null;
    if (!msgs || msgs.length === 0 || msgs.length > MAX_MESSAGES) {
      return json({ error: "bad messages" }, 400, h);
    }
    let total = 0;
    for (const m of msgs) {
      if (!m || typeof m.content !== "string" || !["system", "user", "assistant"].includes(m.role)) {
        return json({ error: "bad message" }, 400, h);
      }
      total += m.content.length;
    }
    if (total > MAX_CHARS) return json({ error: "too long" }, 400, h);

    // 转发（模型与输出上限由本 Worker 写死，客户端无法改）
    const upstream = await fetch(UPSTREAM, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + env.DEEPSEEK_API_KEY,
      },
      body: JSON.stringify({ model: MODEL, stream: true, max_tokens: MAX_TOKENS, messages: msgs }),
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: { ...h, "Content-Type": upstream.headers.get("Content-Type") || "text/event-stream" },
    });
  },
};
