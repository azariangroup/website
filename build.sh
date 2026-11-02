#!/bin/sh
# Builds the site: injects the shared header/footer partials into each page in src/pages
# and writes the finished HTML files to the project root.
# Usage: sh build.sh
set -e
cd "$(dirname "$0")"
for page in src/pages/*.html; do
  out="$(basename "$page")"
  awk '
    /<!--@header-->/ { while ((getline line < "src/partials/header.html") > 0) print line; close("src/partials/header.html"); next }
    /<!--@footer-->/ { while ((getline line < "src/partials/footer.html") > 0) print line; close("src/partials/footer.html"); next }
    { print }
  ' "$page" > "$out"
  echo "built $out"
done
