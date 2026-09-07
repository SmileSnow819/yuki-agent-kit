# yuki-agent-kit

让 AI 为新项目或已有项目接入产品说明、Agent 规则、决策记录、Git Hooks 和配套 Skills。

[English](README.en.md)

## 快速开始

在目标项目根目录执行，安装接入 Skill：

```sh
npx skills add SmileSnow819/yuki-agent-kit --skill yuki-agent-kit --agent codex --yes
```

这会安装到当前项目的 `.agents/skills/yuki-agent-kit/`，它是 Codex 的项目级 Skill 目录。安装器把 Codex 列在 “Universal (`.agents/skills`)” 下是正常行为，不会安装其它 AI 工具。需要 Node.js 22.20.0 或更新版本、npm 和 Git（验证使用 `skills@1.5.24`）。无需克隆本仓库、安装全局 `yuki` 命令或发布同名 npm 包；这里使用的是 [skills 安装器](https://github.com/vercel-labs/skills)。

在该项目的 AI 会话中发送（若新 Skill 未显示，重新打开会话）：

```text
使用 yuki-agent-kit，给当前项目接入开发规范和配套 Skills。
已有文件保留，只补齐缺失内容。
```

AI 会读取项目现状、运行 Skill 自带脚本、安装缺失的配套 Skills，并报告哪些文件新建、哪些保留。

> GitHub 命令使用已推送的仓库内容。维护者验证尚未推送的改动时，在临时项目中把仓库名替换成本地检出的绝对路径。

## 已有项目与新项目

已有项目：在项目根目录执行上述安装命令，再与 AI 对话。

新项目：先创建并进入空目录，再执行相同的安装命令。

```sh
mkdir my-app
cd my-app
npx skills add SmileSnow819/yuki-agent-kit --skill yuki-agent-kit --agent codex --yes
```

告诉 AI 产品目标、用户和技术栈，它会依据你提供的信息完善新建模板；目录尚无 Git 仓库时，初始化脚本会执行 `git init`。

## 会接入什么

- `PRODUCT.md`、`AGENTS.md`：产品上下文和开发规则。
- `.agents/notes/README.md`、`.agents/skills/README.md`：决策记录与项目 Skill 说明。
- `.githooks/commit-msg`：校验带类型前缀的中文提交主题。
- `.githooks/pre-push`：待项目配置的空模板，不假设构建工具。
- 配套 Skills：`project-bootstrap`、`agent-notes`、`code-review`、`find-simplifications`、`trim-cot-leakage`。完整接入默认安装这五个，也可只指定其中几个。

入口 Skill 自带脚本和模板，安装后的模板初始化无需网络。配套 Skills 使用安装器从本仓库获取，目录由所选 AI 工具决定；Codex 的项目目录是 `.agents/skills/`。

## 已有内容与更新

已有文件会输出 `Keeping existing` 并跳过，内容和权限保持不变。同名配套 Skill 也会保留。已有 hooks 配置、默认 Git hooks、`.githooks/` 目录或 worktree 时，不自动切换 hooks 配置；AI 会报告待集成内容。无既有 hooks 的普通仓库会启用 `.githooks/`。

Skill 来源和更新记录由安装器维护。可以让 AI 检查更新；更新 Skill 不会自动更新已经复制到项目中的文件。再次初始化只补齐缺失内容，已有产品说明、规则和 hooks 的改动需要单独审查。

## 仓库结构

```text
skills/
  yuki-agent-kit/
    SKILL.md
    scripts/init-project.sh
    assets/templates/
    references/
  agent-notes/
  code-review/
  ...
starter/scripts/init-project.sh  从源码运行的兼容入口
tests/                          初始化行为测试
```

不通过 AI、从本地源码初始化时：

```sh
sh starter/scripts/init-project.sh /absolute/path/to/project
```

此命令只初始化模板，不安装配套 Skills。

## 可选：Superpowers

[Superpowers](https://github.com/obra/superpowers) 可以独立安装，不随本 kit 分发或自动安装：

```sh
npx skills add obra/superpowers
```

## 维护

模板和安装逻辑只维护在入口 Skill 中，确保安装后自包含。通用方法留在本仓库；项目事实与决策留在目标项目中。Skill 保持单一职责，按需说明放进 `references/`。中文 README 与英文版同步更新。

初始化行为测试需要 Node.js 18 或更新版本；shell 脚本保持 POSIX `sh` 兼容：

```sh
node --test tests/init-project.test.mjs
sh -n skills/yuki-agent-kit/scripts/init-project.sh
git diff --check
```
