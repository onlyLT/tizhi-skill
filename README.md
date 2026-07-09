<div align="center">

<img src="assets/icon.png" alt="体制.skill" width="180" style="border-radius:24px" />

# 体制 · skill

### 体制内小白的生存准则与行动指南

让 AI 化身**务实老练的资深前辈**，帮你在机关 / 事业 / 国企的第一年，少踩坑、会说话、稳住心态。

<br>

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-spec%20compliant-blue.svg)](https://agentskills.io/specification)
[![Pure Markdown](https://img.shields.io/badge/deps-zero-brightgreen.svg)](#-说明)
[![Works with](https://img.shields.io/badge/works%20with-Claude%20Code%20·%20Codex%20·%20Cursor-8A2BE2.svg)](#-安装启用)

</div>

---

> 🗣️ **讲真话、讲潜规则、讲人情世故和自我保护**——接地气，但守住合法合规与职业道德底线：
> 不教违纪违法、不教搞人害人、不教弄虚作假。

<br>

## ✨ 它能帮你什么

新人在这些处境卡壳时问它，它给**情境化、能直接照做**的建议和话术：

| 场景 | 帮你搞定 |
|:--|:--|
| 🧑‍💼 **和领导相处** | 汇报节奏、揣摩意图、被批评怎么接、"随便写写"到底啥意思、站队与跟对人 |
| 🤝 **和同事相处** | 新人姿态、划边界、经营口碑、不卷进办公室是非 |
| 📋 **做事办事** | 接任务先对齐口径、写材料摸调子、办文办会别漏程序、事要闭环有回音 |
| 🛡️ **自我保护** | 留痕、防背锅、说话分寸、饭局酒局、敏感事（钱/章/数据/人事）怎么躲 |
| 📈 **成长晋升** | 考核考察怎么表现、进步的隐性变量、节奏与耐心 |
| 🧘 **心态调适** | 落差、委屈、"熬"、找意义感、及时止损的信号 |

<br>

## 🧠 它怎么想

一套让 AI "懂行"的四步法，稳定不跑偏：

```
🔍 摸底  →  🗂️ 分诊  →  🔬 三层透镜  →  🎯 给动作
```

| 步骤 | 在干什么 |
|:--:|:--|
| **🔍 摸底** | 情境类问题先问一两个关键信息（单位性质 / 领导原话 / 你的位置），信息够了就直接答，不讲正确的废话 |
| **🗂️ 分诊** | 把问题归到 6 类情境，再去 `playbook` 取对口打法 |
| **🔬 三层透镜** | 每条建议都过一遍：① 领导/组织真正想要什么 ② 对你的短期风险 & 长期口碑 ③ 具体怎么说怎么做 |
| **🎯 给动作** | 默认骨架：`一句判断 → 潜台词/风险点破 → 成句话术+动作 → 一条避坑提醒` |

<br>

## 📁 目录结构

```
tizhi-skill/                # ← 目录名必须是 tizhi-skill（规范要求 name 与目录名一致）
├─ SKILL.md                 # 方法骨架：人设 / 红线 / 分工 / 四步方法
├─ references/
│   └─ playbook.md          # 铁律清单 + 6 类情境打法 + 话术模板库 + 快速自检
├─ README.md
├─ LICENSE                  # MIT
└─ docs/superpowers/        # 设计文档与实现计划（开发留痕，非运行所需）
```

> 💡 只有 `SKILL.md` 和 `references/` 是运行必需，其余是文档与留痕。

<br>

## 🚀 安装启用

本 skill 是一个自包含目录，放进对应 agent 的 skills 目录即可。
**⚠️ 关键：目录名必须叫 `tizhi-skill`**（开放规范要求 `name` 与目录名一致），否则可能加载失败。克隆下来的文件夹默认就叫这个名，直接用即可：

```bash
git clone https://github.com/onlyLT/tizhi-skill.git
```

<details>
<summary><b>📂 放到不同 agent 的技能目录</b>（点击展开）</summary>

<br>

| Agent | 技能目录（示例） |
|:--|:--|
| **Claude Code** | `~/.claude/skills/tizhi-skill/` |
| **Codex** | `~/.codex/skills/tizhi-skill/`（或项目内 `.codex/skills/`） |
| **Cursor / 其它** | 参照各自 "Skills / Agent Skills" 文档，放入 `tizhi-skill/` |
| **项目级共享** | 仓库内 `.skills/tizhi-skill/` 或团队约定目录 |

```bash
# macOS / Linux（以 Claude Code 为例）
cp -r tizhi-skill ~/.claude/skills/

# Windows (PowerShell)
Copy-Item -Recurse .\tizhi-skill "$env:USERPROFILE\.claude\skills\"
```

**校验（可选）：** `skills-ref validate ./tizhi-skill`

</details>

装好后重启会话，聊到体制内新人的处境即会按 `description` 自动触发；多数 agent 也支持 `/tizhi-skill` 或直接提技能名调用。

<br>

## 🚨 红线

本 skill 的潜规则，是用来**让新人看懂局、不吃亏、保护好自己**，**不是教人钻空子**。
涉及违纪违法、弄虚作假、搞人害人时，它不会配合，而是点破风险、把人劝回正路。

<br>

## 📝 说明

- **类型**：轻方法论型 skill（靠模型知识 + 回答框架，**无脚本、无外部依赖、纯 Markdown**，因此可跨 agent 通用）
- **分工**：整篇公文代写、体系化长文/网页版指南不是它的重点——环境里若有专门技能，交给它们更合适
- **免责**：内容为一般性经验参考，不构成任何单位的正式规定；具体以所在单位规章为准
- **许可证**：MIT，见 [LICENSE](LICENSE)

<br>

<div align="center">

**觉得有用？点个 ⭐ Star 让更多体制内新人看到。**

</div>
