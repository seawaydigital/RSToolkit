"""Print the visible text of an HTML page read on stdin.

Run:  curl -s <url> | python scripts/tracker/research/html-text.py [max-chars]

Used to check that a source, or its archived copy, holds the passage a
profile cites; pipe the output to grep for the exact words. Bodies that come
gzip-compressed (Wayback Machine id_ captures sometimes do) are unpacked
first, and the charset the page declares is honoured, with UTF-8 and then
GB18030 as fallbacks for Chinese pages. Prints the body size, then up to
max-chars of text (3000 by default).
"""
import gzip
import html
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
body = sys.stdin.buffer.read()
if body[:2] == b"\x1f\x8b":
    body = gzip.decompress(body)

declared = re.search(rb'charset=["\']?([\w-]+)', body[:3000])
text = None
for encoding in ([declared.group(1).decode()] if declared else []) + ["utf-8", "gb18030"]:
    try:
        text = body.decode(encoding)
        break
    except (LookupError, UnicodeDecodeError):
        continue
if text is None:
    text = body.decode("utf-8", "replace")

text = re.sub(r"(?is)<(script|style)[^>]*>.*?</\1>", "", text)
text = re.sub(r"<[^>]+>", " ", text)
text = re.sub(r"\s+", " ", html.unescape(text))
limit = int(sys.argv[1]) if len(sys.argv) > 1 else 3000
print(len(body), "bytes |", text[:limit])
