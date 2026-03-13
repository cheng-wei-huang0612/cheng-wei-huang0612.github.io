#!/usr/bin/env python3
import sys

s = sys.stdin.read()

out = []
i = 0
while True:
    j = s.find("$$", i)
    if j == -1:
        out.append(s[i:])
        break
    out.append(s[i:j])
    k = s.find("$$", j + 2)
    if k == -1:
        out.append(s[j:])
        break

    body = s[j+2:k].strip("\n")
    out.append("\n```{=latex}\n\\[\n")
    out.append(body)
    out.append("\n\\]\n```\n")

    i = k + 2

sys.stdout.write("".join(out))
