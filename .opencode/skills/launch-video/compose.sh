#!/usr/bin/env bash
# Cuts recorded beats into one video: trims each at its "start" mark, lays its page audio back in sync
# (or silence), and joins them at 1920x1080, 30 fps. Usage: compose.sh video/launch.mp4 01-calm 02-storm …
set -euo pipefail
out="$1"; shift
raw=video/raw; seg=video/segments
mkdir -p "$seg"
list="$seg/list.txt"; : > "$list"

mark() { # mark <beat> <label> → seconds, or empty
  node -e 'const m=require(process.argv[1]).find((x)=>x.label===process.argv[2]); if (m) console.log(m.t)' "$PWD/$raw/$1.marks.json" "$2"
}

for beat in "$@"; do
  start=$(mark "$beat" start); start=${start:-0}
  audio_at=$(mark "$beat" audio)
  enc=(-c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -r 30 -vf "scale=1920:1080,setsar=1" -c:a aac -b:a 192k -ar 48000 -ac 2)
  if [[ -n "$audio_at" && -f "$raw/$beat.audio.webm" ]]; then
    # The audio began at audio_at seconds into the video: offset it there, then trim both at the start mark.
    ffmpeg -y -loglevel error -i "$raw/$beat.webm" -itsoffset "$audio_at" -i "$raw/$beat.audio.webm" \
      -filter_complex "[1:a]apad[a]" -map 0:v -map "[a]" -ss "$start" -shortest "${enc[@]}" "$seg/$beat.mp4"
  else
    ffmpeg -y -loglevel error -i "$raw/$beat.webm" -f lavfi -i anullsrc=r=48000:cl=stereo \
      -map 0:v -map 1:a -ss "$start" -shortest "${enc[@]}" "$seg/$beat.mp4"
  fi
  echo "file '$PWD/$seg/$beat.mp4'" >> "$list"
  echo "$beat: from ${start}s"
done

ffmpeg -y -loglevel error -f concat -safe 0 -i "$list" -c copy "$out"
echo "→ $out ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$out" | cut -d. -f1) s)"
