# 站长通道部署指南（Cloudflare Worker 中转）

让公网访客**免配置 Key** 直接使用页面：Worker 替你持有 DeepSeek Key 并做防刷限制。

```
访客浏览器 → Cloudflare Worker（持 Key + 限流）→ DeepSeek
```

## 方式 A：控制台粘贴（最简单，5 分钟）

1. 注册/登录 [Cloudflare](https://dash.cloudflare.com) → 左侧 **Workers & Pages** → **Create Worker** → 随便起名（如 `tizhi-relay`）→ Deploy。
2. 点 **Edit code**，把本目录 `worker.js` 的内容整个粘贴进去，覆盖原有代码 → **Deploy**。
3. Worker 页面 → **Settings → Variables and Secrets** → **Add**：
   - 类型选 **Secret**，名称 `DEEPSEEK_API_KEY`，值填你的 DeepSeek Key。
   - （可选）类型 Text，名称 `ALLOWED_ORIGINS`，值 `https://onlylt.github.io`（限定只有你的页面能调用）。
4. 记下 Worker 地址，形如 `https://tizhi-relay.<你的子域>.workers.dev`。

> 此方式下限流是"软限流"（单实例内每 IP 每分钟 8 次），能挡住绝大多数手工滥用；要更硬的限流用方式 B。

## 方式 B：wrangler CLI（限流更可靠）

```bash
npm i -g wrangler
wrangler login
cd deploy
wrangler deploy                      # 按 wrangler.toml 部署，含官方按 IP 限流绑定
wrangler secret put DEEPSEEK_API_KEY # 粘贴你的 Key
```

## 接入页面

打开 `docs/index.html`，找到脚本开头的：

```js
const HOSTED_ENDPOINT = "";
```

填入你的 Worker 地址：

```js
const HOSTED_ENDPOINT = "https://tizhi-relay.<你的子域>.workers.dev";
```

提交推送后，公网页面默认走"站长通道"，访客零配置即可提问；访客也仍可在"设置 API"里改用自己的 Key（自带 Key 的流量不经过你的 Worker，不花你的钱）。

> 页面上线方式：GitHub 仓库 **Settings → Pages → Deploy from a branch**，分支选 `main`、目录选 **/docs**，站点地址为 `https://onlylt.github.io/tizhi-skill/`。

## 防刷与成本控制

- **三道闸**：按 IP 限流（8 次/分钟 + 60 次/天，日配额按上海时区零点重置）→ 请求约束（模型固定、单次输出 1500 token 封顶、消息数与字数封顶、仅流式）→ DeepSeek 余额兜底。
- **强烈建议**：DeepSeek 后台只充少量余额（如 10–20 元），刷穿即停，损失可控。
- **来源白名单**：上线后把 `ALLOWED_ORIGINS` 设为你的 Pages 域名，挡掉脚本直调（Origin 可伪造，属于"加一道门"而非绝对防御）。

## 大陆访问提示

`*.workers.dev` 域名在大陆时常不稳定。若目标读者主要在大陆：给 Worker 绑一个自己的域名（Cloudflare 托管 DNS 后在 Worker → Triggers → Custom Domains 添加），连通性会好很多。

## 一点提醒

面向公众提供生成式 AI 服务在国内有备案相关要求，个人小站一般无人问津，但心里有数：控制传播范围、保留免责声明、余额限额，都是让它保持"个人玩具"体量的手段。
