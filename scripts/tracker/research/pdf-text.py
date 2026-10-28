"""Write the text of a PDF piped on stdin, page by page, to a JSON file.

Run:  curl -s <pdf-url> | python scripts/tracker/research/pdf-text.py <out.json>

The PDF is read in memory and never saved, so a long report (CASI's key-lab
directory, a Federal Register rule) can be searched without downloading it.
Don't open PDF links in a browser for this: they pop up a save dialog. The
output is {"pages": ["<page 1 text>", ...]}, which casi-entry.py reads.

Requires PyMuPDF (pip install pymupdf). Like Pillow for the icon script, it is
a dev-time tool, not a project dependency.
"""
import json
import sys

import fitz

if len(sys.argv) != 2:
    sys.exit("Run:  curl -s <pdf-url> | python scripts/tracker/research/pdf-text.py <out.json>")

doc = fitz.open(stream=sys.stdin.buffer.read(), filetype="pdf")
with open(sys.argv[1], "w", encoding="utf-8") as out:
    json.dump({"pages": [page.get_text() for page in doc]}, out, ensure_ascii=False)
print(f"{len(doc)} pages written to {sys.argv[1]}")
