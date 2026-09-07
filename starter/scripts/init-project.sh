#!/bin/sh

set -eu

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 /absolute/path/to/project" >&2
  exit 1
fi

target=$1
script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
template_dir=$(CDPATH= cd -- "$script_dir/../templates" && pwd)

if [ ! -d "$target" ]; then
  echo "Target directory does not exist: $target" >&2
  exit 1
fi

target=$(CDPATH= cd -- "$target" && pwd)

if [ ! -d "$target/.git" ]; then
  git -C "$target" init
fi

copy_if_missing() {
  source=$1
  destination=$2
  if [ -e "$destination" ]; then
    echo "Keeping existing $destination"
    return
  fi
  mkdir -p "$(dirname -- "$destination")"
  cp "$source" "$destination"
  echo "Created $destination"
}

copy_if_missing "$template_dir/PRODUCT.md" "$target/PRODUCT.md"
copy_if_missing "$template_dir/AGENTS.md" "$target/AGENTS.md"
copy_if_missing "$template_dir/.agents/notes/README.md" "$target/.agents/notes/README.md"
copy_if_missing "$template_dir/.agents/skills/README.md" "$target/.agents/skills/README.md"
copy_if_missing "$template_dir/.githooks/commit-msg" "$target/.githooks/commit-msg"
copy_if_missing "$template_dir/.githooks/pre-push" "$target/.githooks/pre-push"

chmod +x "$target/.githooks/commit-msg" "$target/.githooks/pre-push"
git -C "$target" config core.hooksPath .githooks

echo "Initialized AI project conventions in $target"
