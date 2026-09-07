# Agent Note: 通过接入 Skill 分发项目模板

Status: implemented

## 决定

用户通过 `npx skills add` 安装 `yuki-agent-kit` 入口 Skill，再与 AI 对话完成项目接入。入口自带初始化脚本和模板；配套 Skills 由 AI 根据请求，通过安装器独立安装。

模板与初始化逻辑由 [入口 Skill](../../../skills/yuki-agent-kit/SKILL.md) 拥有。源码中的 starter 只保留兼容转发入口。

## 理由与边界

Skill 安装器只交付选中的 Skill 目录，因此执行时不能依赖源码仓库中的兄弟目录。把模板放在 Skill 的 `assets/` 下，安装后的脚本不需要下载源码或依赖尚未发布的 npm 包。

已有文件、权限和 hooks 配置归目标项目维护者所有。初始化只补齐缺失文件；Skill 更新也不等于项目文件更新。不维护三方合并、项目文件版本清单或自建更新协议。

## 替代方案与取舍

独立 npm CLI 可服务纯命令行用户，但引入额外的发布和安装入口，当前对话式接入不需要它。没有全局 `yuki` 命令意味着直接脚本使用者需要明确入口路径。

## 验证与重审

[行为测试](../../../tests/init-project.test.mjs) 覆盖独立 Skill 目录、新项目、已有内容、hooks、符号链接和 worktree。发布前还应在临时项目用真实安装器验证打包资源。

若需要跨项目批量管理或无 AI 的长期自动更新，再评估独立 CLI；不要通过覆盖目标项目文件扩展初始化脚本。
