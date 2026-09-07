# yuki-agent-kit

用于初始化 AI 友好型仓库的个人可复用工具包：提供产品说明、Agent 规则、决策记录和 Git Hooks。

[English](README.md)

## 内容

- `skills/`：可安装到 Codex、跨项目复用的个人 Skills。
- `starter/`：初始化新项目时复制进去的模板和脚本。

产品目标、架构和决策应留在目标项目中；本仓库只维护可复用的结构和工作流。

## 目录

```text
skills/     可复用的 Codex Skills
starter/    项目模板与初始化脚本
```

## 使用

在目标项目上运行初始化脚本：

```sh
./starter/scripts/init-project.sh /absolute/path/to/project
```

脚本不会覆盖已有文件；它会创建缺失的模板、启用仓库内 `.githooks/`，并保留已有项目约定。

## 维护

Skill 应保持小而专一；只有不是每次调用都需要的内容才放进 `references/`。

初始化脚本未来也必须保持“不经显式选择不覆盖目标项目文件”的原则。
