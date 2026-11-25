#!/bin/sh
# Copies every photo from the current Bandzoogle site into ./img
# Run once from this folder (Mac: open Terminal, type "sh " and drag this file in, press Enter).
cd "$(dirname "$0")"
mkdir -p img
while read -r name url; do
  [ -z "$name" ] && continue
  echo "Downloading $name"
  curl -sSL -o "img/$name" "$url" || echo "  failed: $name"
done < images.txt
echo "Done. $(ls img | wc -l) images in img/"
