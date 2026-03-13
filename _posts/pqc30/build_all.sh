#!/usr/bin/env bash
set -euo pipefail

mkdir -p out/pdf out/tex

for md in *.md; do
  [ -e "$md" ] || exit 0
  base="${md%.md}"

  pandoc "$md" \
    --template=template.tex \
    --pdf-engine=xelatex \
    --include-in-header=preamble.tex \
    -V mainfont="DejaVu Serif" \
    -V CJKmainfont="Noto Serif CJK TC" \
    -V mathfont="Asana Math" \
    -o "out/pdf/${base}.pdf"

  pandoc "$md" \
    --template=template.tex \
    --include-in-header=preamble.tex \
    -V mainfont="DejaVu Serif" \
    -V CJKmainfont="Noto Serif CJK TC" \
    -V mathfont="Asana Math" \
    -o "out/tex/${base}.tex"

  echo "OK: $md"
done
