"""Read CASI's key-lab directory from the JSON that pdf-text.py writes.

Run:  python scripts/tracker/research/casi-entry.py <casi.json> "<lab>" [max-chars]
      python scripts/tracker/research/casi-entry.py <casi.json> --find "<name>"

The directory is CASI's "China's Defense S&T Key Lab System: 2025 Update"
(October 2025). airuniversity.af.edu refuses scripts, so read the Wayback
copy (capture 20260409195713, with id_) through pdf-text.py:
https://www.airuniversity.af.edu/Portals/10/CASI/documents/Research/Infrastructure/2025-10-20%20Defense%20Labs%20Directory.pdf

"<lab>" is the part of an entry's title after "Defense S&T Key Laboratory
of", or its start ("Antennas"). The entry prints with its printed page
numbers, which is how profiles cite the directory: they run 12 behind the
PDF's own. With --find, every printed page that mentions a name is listed
with the text around it, to see which labs an institution is affiliated with.
"""
import json
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")
ENTRY = r"\n\s*\d+\.\s*Defense S&T Key Laboratory of "
PRINTED = re.compile(r"China Aerospace Studies Institute\s*\n\s*(\d+)")
FIRST_ENTRY_PAGE = 20  # the table of contents before it lists every entry too


def printed(page):
    match = PRINTED.search(page)
    return match.group(1) if match else "?"


def find(pages, name):
    for i, page in enumerate(pages):
        flat = re.sub(r"\s+", " ", page)
        match = re.search(re.escape(name), flat)
        if match:
            context = flat[max(0, match.start() - 300):match.end() + 300]
            print(f"p. {printed(page)} (PDF {i + 1}): ...{context}...\n")


def entry(pages, lab, limit):
    title = re.compile(ENTRY + re.escape(lab))
    start = next((i for i in range(FIRST_ENTRY_PAGE, len(pages)) if title.search(pages[i])), None)
    if start is None:
        sys.exit(f'No entry "Defense S&T Key Laboratory of {lab}".')
    end = start
    while end + 1 < len(pages) and not re.search(ENTRY, pages[end + 1]):
        end += 1
    print(f"pp. {printed(pages[start])}–{printed(pages[end])} (PDF {start + 1}–{end + 1})")
    text = re.sub(r"[ \t]+", " ", "\n".join(pages[start:end + 1]))
    print(re.sub(r"\n\s*\n+", "\n", text)[:limit])


if len(sys.argv) < 3:
    sys.exit(__doc__)
with open(sys.argv[1], encoding="utf-8") as f:
    directory = json.load(f)["pages"]
if sys.argv[2] == "--find":
    find(directory, sys.argv[3])
else:
    entry(directory, sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 6000)
