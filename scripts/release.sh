#!/bin/bash
set -e

VERSION=$(node -p "require('./package.json').version")

echo "📦 Releasing v$VERSION..."

bun run build

if ! git diff-index --quiet HEAD --; then
  git add -A
  git commit -m "release: v$VERSION"
fi

bun publish

git tag "v$VERSION"
git push --follow-tags
gh release create "v$VERSION" --title "v$VERSION" --generate-notes

echo "✅ v$VERSION released!"
