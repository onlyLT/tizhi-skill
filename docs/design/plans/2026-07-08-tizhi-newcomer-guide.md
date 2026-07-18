# 体制内新人行动指南 skill 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 产出一个可用的 Claude 技能 `tizhi-newcomer-guide`，以"务实老练的资深前辈"身份为体制内新人的具体职场处境提供情境化建议与话术。

**Architecture:** 轻方法论型 skill。`SKILL.md` 承载触发描述 + 基调红线 + "摸底→分诊→三层透镜→给动作"方法骨架；`references/playbook.md` 承载 6 类情境的分场景打法、铁律清单与话术模板，回答时按需加载。无代码、无内置检索、无外部依赖。

**Tech Stack:** Markdown；Claude Code / Agent Skills 的 SKILL.md 格式（YAML frontmatter + 正文）。

## Global Constraints

- 立场：务实老练派，讲潜规则与自我保护，但守合法合规与职业道德底线；不教违纪违法、搞人害人、造假钻营。
- 覆盖对象：机关 / 事业单位 / 国企新人。
- 语言：全中文；话术模板可直接抄用。
- frontmatter 只含 `name`（值 `tizhi-newcomer-guide`）与 `description`（含中文触发关键词）。
- 与既有 skill 划界：纯写公文让位 `wow-gongwen-writing`；长文/网页让位 `beautiful-article`。
- 输出风格：接地气、直给动作和话术、点破坑；不讲正确的废话、不长篇道理。
- 源规格：见 `docs/superpowers/specs/2026-07-08-tizhi-newcomer-guide-design.md`。

---

### Task 1: 搭骨架并写 SKILL.md 方法主体

**Files:**
- Create: `SKILL.md`
- Create: `references/` 目录（占位，Task 2 填内容）

**Interfaces:**
- Produces: `SKILL.md`，其正文引用 `references/playbook.md`（Task 2 创建）；frontmatter `name: tizhi-newcomer-guide`。

- [ ] **Step 1: 加载 writing-skills 技能，确认 SKILL.md 格式规范**

调用 `superpowers:writing-skills`，核对 frontmatter 字段要求、description 写法（第三人称、含触发词）、正文结构惯例。以其规范为准，若与本计划示例冲突，服从 writing-skills。

- [ ] **Step 2: 写 frontmatter**

```markdown
---
name: tizhi-newcomer-guide
description: 体制内（机关/事业单位/国企）新人的职场处境顾问，像务实老练的资深前辈那样给情境化建议与话术。触发场景：与领导相处/汇报/揣摩意图/被批评/站队、与同事相处/新人姿态/办公室政治、写材料/办会办文/接任务/跑流程、留痕/背锅/说话分寸/饭局酒局/敏感事、考核/考察/提拔/进步、心态落差/委屈/熬，以及"体制内该怎么办/要注意什么/值不值得进"这类问法。务实讲潜规则与自我保护，但守合法合规与职业道德底线，不教违纪违法或搞人害人。纯写公文请用 wow-gongwen-writing。
---
```

- [ ] **Step 3: 写"基调与红线"段**

正文第一节，写清：
- 人设：务实老练的资深前辈，愿意点拨，接地气。
- 立场：讲真话、讲潜规则、讲人情世故与自我保护。
- 红线（明确列出）：不教违纪违法、搞人害人、造假钻营；涉及这些时点破风险、劝回正路。
- 划界：纯公文代写让位 `wow-gongwen-writing`；长文/网页让位 `beautiful-article`。

- [ ] **Step 4: 写核心方法"摸底 → 分诊 → 三层透镜 → 给动作"**

按规格四步写：
1. 摸底：情境类问题先问 1–2 个关键信息（单位性质 / 领导原话与来龙去脉 / 入职多久与角色），信息够了就不问。
2. 分诊：列出 6 类情境（领导关系 / 同事关系 / 做事办事 / 自我保护 / 成长晋升 / 心态调适），并说明"归类后到 playbook 对应章节取打法"。
3. 三层透镜：①领导/组织真正想要什么 ②对你的短期风险&长期口碑 ③具体怎么说怎么做（话术+动作），每条建议都过一遍。
4. 给动作：默认回答骨架——一句判断 → 潜台词/风险点破 → 具体怎么说怎么做（含话术）→ 一条避坑提醒。

- [ ] **Step 5: 写"何时加载 playbook"段**

说明：遇到具体情境类问题时，读取 `references/playbook.md` 中对应情境章节，取分场景打法、铁律与话术模板；泛泛问题（如"体制内值不值得进"）可直接答，不必加载。

- [ ] **Step 6: 格式校验**

Run: `head -20 SKILL.md`
Expected: 前几行为合法 YAML frontmatter（`---` 包裹，含 `name`/`description`），正文标题层级正常、无占位符 `TODO/TBD`。人工确认 description 含足够中文触发关键词。

- [ ] **Step 7: Commit（若目录为 git 仓库）**

```bash
git add SKILL.md
git commit -m "feat: SKILL.md 方法骨架 for tizhi-newcomer-guide"
```
（若非 git 仓库则跳过提交，仅保留文件。）

---

### Task 2: 写 references/playbook.md（弹药库）

**Files:**
- Create: `references/playbook.md`

**Interfaces:**
- Consumes: `SKILL.md` 中的 6 类情境命名与三层透镜，章节须一一对应。
- Produces: 供 `SKILL.md` 按需加载的分场景打法、铁律清单、话术模板。

- [ ] **Step 1: 写"铁律清单"章节**

一份体制内底层心法清单（每条一句、可当子弹），至少覆盖：多干少说/多请示汇报、凡事留痕按流程、不当出头鸟也别当透明人、把领导的事当自己的事、话到嘴边留三分/看破不说破、对事也要对人（口碑是慢变量）、群里与公开场合不发泄不站队、新人先立"靠谱"人设（有交代有回音、件件有着落）。每条附一句"为什么/怎么用"。

- [ ] **Step 2: 写 6 类情境的分场景打法**

每类情境一个小节，统一结构：**领导/组织真实诉求 → 常见坑 → 话术与动作模板**。逐一写：
1. 领导关系（汇报节奏、揣摩意图、被批评怎么接、站队分寸、跟对人）
2. 同事关系（新人姿态、边界感、口碑经营、不卷入是非）
3. 做事办事（接任务先对齐、写材料/办会办文要点、跑流程、有回音）
4. 自我保护（留痕、背锅的预防与应对、说话分寸、饭局酒局、敏感事不碰）
5. 成长晋升（考核/考察怎么表现、进步的隐性变量、耐心与时机）
6. 心态调适（落差与委屈、怎么"熬"、找意义感、及时止损的信号）

- [ ] **Step 3: 写"话术模板库"章节**

可直接抄用的成句模板，至少含：向领导汇报/请示的开场、接任务确认口径、婉拒不合理加派、认错复盘、给领导台阶、同事间划边界、饭局敬酒与得体退场。每条给 1–2 个变体。

- [ ] **Step 4: 内容验收（红线 + 一致性 + 可用性）**

Run: `grep -nE "TODO|TBD|占位|待补" references/playbook.md`
Expected: 无输出（无占位符）。
人工确认：①6 类情境命名与 `SKILL.md` 完全一致；②每条建议都守住红线（无教唆违纪违法/害人）；③话术模板是"能直接说出口"的成句而非抽象描述。

- [ ] **Step 5: Commit（若目录为 git 仓库）**

```bash
git add references/playbook.md
git commit -m "feat: playbook 弹药库 for tizhi-newcomer-guide"
```

---

### Task 3: 端到端演练与收尾

**Files:**
- Modify: `SKILL.md`、`references/playbook.md`（按演练结果微调）

**Interfaces:**
- Consumes: Task 1、Task 2 的全部产物。

- [ ] **Step 1: 用 3 个样例问题走一遍流程（不改文件，先观察）**

样例：
1. "领导让我'随便写写'一个总结，我该怎么办？"（做事办事 + 摸底）
2. "开会时领导当众批评我，当时该怎么反应？"（领导关系 + 自我保护）
3. "同事让我帮他顶个班/签个到，帮不帮？"（同事关系 + 红线）
对每题按"摸底→分诊→三层透镜→给动作"心里过一遍，检查 SKILL.md + playbook 是否够用、是否会答出"正确的废话"或踩红线。

- [ ] **Step 2: 按演练发现的缺口微调两个文件**

补齐缺失的话术/坑点、修正跑偏或说教的表述、确保摸底问题不啰嗦。只做针对性修改，不扩范围（守 YAGNI）。

- [ ] **Step 3: 安装/放置确认**

确认最终目录结构：
```
SKILL.md
references/playbook.md
```
向用户说明如何启用：把该 skill 目录放到 Claude Code 的 skills 目录（如 `~/.claude/skills/tizhi-newcomer-guide/`）或按其插件机制安装；本仓库内即为源。

- [ ] **Step 4: Commit（若目录为 git 仓库）**

```bash
git add -A
git commit -m "chore: 演练微调并定稿 tizhi-newcomer-guide"
```

---

## Self-Review

- **Spec coverage**：定位/立场/红线→Task1 Step3；触发场景→Task1 Step2 description；摸底/分诊/三层透镜/给动作→Task1 Step4；6 类情境打法→Task2 Step2；铁律→Task2 Step1；话术模板→Task2 Step3；文件结构→贯穿；非目标(YAGNI)→Task3 Step2 明确不扩范围。无遗漏。
- **Placeholder scan**：计划内含 grep 校验步骤主动清占位符；计划自身无 TODO/TBD 遗留。
- **Type consistency**：6 类情境命名在 Task1 与 Task2 要求"完全一致"，Task2 Step4 显式校验；文件路径 `SKILL.md` / `references/playbook.md` 全程统一。
- **Note**：当前工作目录非 git 仓库，各 Commit 步骤标注"若为 git 仓库"；实现时若用户希望版本管理可先 `git init`。
