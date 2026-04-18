#!/usr/bin/env bash
# build_index.sh — regenerate index.html from README.md for this fork.
#
# Uses GitHub's POST /markdown API for byte-for-byte parity with how
# README.md renders on github.com. Math is typeset client-side by MathJax.
#
# Usage: scripts/build_index.sh
# Also invoked automatically by the pre-commit hook installed via
# scripts/install_hooks.sh whenever README.md is staged.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

README="README.md"
OUT="index.html"
TMP="$(mktemp -t build_index.XXXXXX).md"
trap 'rm -f "$TMP"' EXIT

# Normalize math syntax so MathJax can find it in the rendered HTML:
#   1. ```math ... ```   →  $$ ... $$      (display math)
#   2. $`expr`$           →  $expr$         (inline math; pandoc's gfm writer
#                                            wraps inline math in backticks
#                                            which MathJax won't match)
# GitHub's /markdown API passes $…$ and $$…$$ through as plain text; MathJax
# then picks them up client-side. Without (1), ```math``` blocks become
# <pre><code class="language-math">…</code></pre> which MathJax skips.
perl -0777 -pe '
  s/```\s*math\s*\n(.*?)\n```/\n\$\$\n$1\n\$\$\n/gs;
  s/\$`([^`]+)`\$/\$$1\$/g;
' "$README" > "$TMP"

# POST to GitHub's markdown renderer
BODY="$(jq -Rs '{text: ., mode: "gfm", context: "eabadir/EGPT"}' < "$TMP")"
if ! RESP="$(curl -sS --fail \
    -H "Accept: application/vnd.github+json" \
    -H "X-GitHub-Api-Version: 2022-11-28" \
    -X POST \
    -d "$BODY" \
    https://api.github.com/markdown)"; then
  echo "ERROR: GitHub /markdown API request failed." >&2
  exit 1
fi

if [ -z "$RESP" ]; then
  echo "ERROR: Empty response from GitHub /markdown API." >&2
  exit 1
fi

# Wrap rendered HTML with a minimal shell: github-markdown-css + MathJax 3.
cat > "$OUT" <<'HTML_HEAD'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Mathlib.InformationTheory (fork branch)</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/github-markdown-css@5/github-markdown.min.css">
<style>
  body { box-sizing: border-box; min-width: 200px; max-width: 980px; margin: 0 auto; padding: 45px; }
  @media (max-width: 767px) { body { padding: 15px; } }
</style>
<script>
  window.MathJax = {
    tex: {
      inlineMath: [['$', '$'], ['\\(', '\\)']],
      displayMath: [['$$', '$$'], ['\\[', '\\]']],
      processEscapes: true
    },
    options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] }
  };
</script>
<script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</head>
<body class="markdown-body">
HTML_HEAD

printf '%s\n' "$RESP" >> "$OUT"

cat >> "$OUT" <<'HTML_TAIL'
</body>
</html>
HTML_TAIL

echo "Wrote $OUT ($(wc -l < "$OUT") lines)"
