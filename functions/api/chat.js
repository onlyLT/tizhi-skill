/**
 * 体制 · skill — 站长通道（Cloudflare Pages Functions 版）
 *
 * 放在仓库 /functions 目录下，Cloudflare Pages 连接本仓库后自动部署为
 * 站点同域名的 POST /api/chat 接口，页面零配置直连。
 *
 * 唯一需要手动做的一步：Pages 项目 → Settings → Environment variables →
 * 添加 Secret：DEEPSEEK_API_KEY（密钥不能进代码，只能进后台）。
 * 可选变量：ALLOWED_ORIGINS（逗号分隔的允许来源；不设则放行所有来源）。
 *
 * 独立 Worker 版本见 docs/deploy/worker.js，两者二选一即可，本函数更省事。
 * 防刷三道闸：按 IP 限流（8 次/分钟 + 60 次/天）→ 请求约束（模型/输出写死、
 * 消息数与字数封顶）→ DeepSeek 后台少充余额兜底。
 */

const UPSTREAM = "https://api.deepseek.com/v1/chat/completions";
const MODEL = "deepseek-chat";
const MAX_TOKENS = 1500;      // 单次回答输出上限
const MAX_MESSAGES = 40;      // 单次请求消息条数上限（含 system）
const MAX_CHARS = 60000;      // 所有消息总字符上限（system 提示词约 1.5 万字）
const WINDOW_LIMIT = 8;       // 每 IP 每分钟次数上限
const DAY_LIMIT = 60;         // 每 IP 每天次数上限（按上海时区零点重置）

/* 限流记录（进程内，实例回收会清零——属"尽力而为"，兜底靠 DeepSeek 余额） */
const hits = new Map();
function shanghaiDay(now) {
  return new Date(now + 8 * 3600e3).toISOString().slice(0, 10);
}
function checkLimits(ip) {
  const now = Date.now();
  const today = shanghaiDay(now);
  let rec = hits.get(ip);
  if (!rec || rec.day !== today) rec = { day: today, dayCount: 0, stamps: [] };
  rec.stamps = rec.stamps.filter((t) => now - t < 60_000);
  if (rec.dayCount >= DAY_LIMIT) {
    hits.set(ip, rec);
    return { ok: false, why: "今天的份额用完了，明天再来问" };
  }
  if (rec.stamps.length >= WINDOW_LIMIT) {
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

export function onRequestOptions(context) {
  const origin = context.request.headers.get("Origin") || "";
  return new Response(null, { status: 204, headers: corsHeaders(origin, context.env) });
}

export async function onRequestPost(context) {
  const req = context.request;
  const env = context.env;
  const origin = req.headers.get("Origin") || "";
  const h = corsHeaders(origin, env);

  if (!env.DEEPSEEK_API_KEY) {
    return json({ error: "站长尚未配置 DEEPSEEK_API_KEY（Pages 后台 Environment variables）" }, 500, h);
  }

  // 来源白名单（配置了 ALLOWED_ORIGINS 才启用）
  const conf = env.ALLOWED_ORIGINS || "*";
  if (conf !== "*") {
    const list = conf.split(",").map((s) => s.trim());
    if (!list.includes(origin)) return json({ error: "origin not allowed" }, 403, h);
  }

  // 按 IP 限流
  const ip = req.headers.get("CF-Connecting-IP") || "unknown";
  const r = checkLimits(ip);
  if (!r.ok) return json({ error: r.why }, 429, h);

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

  // 转发（模型与输出上限由本函数写死，客户端无法改）
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
}
