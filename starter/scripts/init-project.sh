#!/bin/sh

set -eu

# 保留从源码初始化的旧入口；模板和安装逻辑只有 Skill 中的一份。
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
exec sh "$script_dir/../../skills/yuki-agent-kit/scripts/init-project.sh" "$@"
