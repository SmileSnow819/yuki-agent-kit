# yuki-agent-kit

Personal, reusable tooling for starting AI-friendly repositories: product context, Agent rules, decision records, and Git Hooks.

[中文](README.zh.md)

## Contents

- `skills/`: cross-project Codex skills that can be installed into the user skill directory.
- `starter/`: templates and scripts copied into a newly initialized project.

Product intent, architecture, and decisions stay in the target project. This repository owns only reusable structure and workflows.

## Layout

```text
skills/     Reusable Codex skills
starter/    Project templates and bootstrap script
```

## Usage

Run the bootstrap script against a target project:

```sh
./starter/scripts/init-project.sh /absolute/path/to/project
```

The script never overwrites existing files. It creates missing templates, enables the repository-local `.githooks/`, and preserves existing project conventions.

## Development

Skills should remain narrow and self-contained. Put material needed only in some invocations under `references/`.

The bootstrap script must continue to avoid overwriting target files unless an explicit future opt-in is provided.
