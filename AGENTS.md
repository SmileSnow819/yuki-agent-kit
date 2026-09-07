# AGENTS.md

开始工作前阅读 `PRODUCT.md`、本文件，以及与改动路径相关的说明。

如果用户已经安装 Superpowers，涉及需求澄清、方案设计、实现计划、TDD、系统调试、代码审查或分支收尾时，优先使用对应的外部 Skill。本仓库不复制或维护 Superpowers 的源码。

## 工作规则

- 本仓库维护跨项目复用的方法、模板和工具；不得把某个目标项目的架构、业务规则或密钥写入这里。
- 目标项目已有文件优先于 starter 模板；初始化脚本不得覆盖目标项目的已有文件。
- 接入 Skill `skills/yuki-agent-kit/` 必须自包含；模板和初始化脚本只在其中维护。`starter/scripts/init-project.sh` 仅转发到这个入口。
- Skill 分发使用 `npx skills add`，不维护同名 npm CLI 或全局安装器。已有 hooks 内容、权限和配置必须保留。
- 新增或修改 Skill 时，保持职责单一，frontmatter 的 `name` 与目录名一致，描述应说明适用场景和边界。
- 对复杂或高风险 Skill，优先将条件性细节放到 `references/`，不要让每次调用都加载无关说明。
- 新建项目模板时，先问它是否真能跨项目复用；不能复用的内容应由 `project-bootstrap` 写入目标项目，而不是加入 starter。
- 修改 hooks 时保持 POSIX `sh` 兼容；提交阶段只做快速检查，耗时 build 应放在 push 或 CI。

## 文档语言

- `PRODUCT.md`、`AGENTS.md`、Agent Notes 与面向个人开发流程的说明默认使用中文。
- 只有面向外部用户或开源协作者、且确有双语读者的 README / 文档才需要中英双文。
- 双语文档使用独立文件：默认中文 `README.md`，英文版 `README.en.md`；不得在同一文档混合中英文 prose。
- 修改双语文档时，同一改动中更新对应文件，并保持标题、列表、代码块、链接和事实含义一致。

## 验证

- 修改 shell 脚本后运行 `sh -n`。
- 修改 starter 后验证初始化脚本不会覆盖已有目标文件，并确认 hooks path 被正确设置。
- 修改初始化逻辑后运行 `node --test tests/init-project.test.mjs`，覆盖新项目、已有配置、重复执行和独立 Skill 安装路径。
- 修改 Skill 后检查 frontmatter、路径和被引用的资源；不要声称 Skill 可安装或可运行，除非已验证相应流程。
