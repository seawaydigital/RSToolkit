# Research helpers

Small tools for researching a tracker profile, used with the method in `docs/tracker/research-playbook.md` and the `tracker-research` skill. The Node helpers read the data through `scripts/tracker/lib/loadData.mjs` and write one record at a time with its writer, so files keep their stable form; `npm test` stays the gate before every commit. Run them with `node` directly: in Windows PowerShell 5.1, `npm run … -- --flag` drops the flags.

| Helper | What it does |
|---|---|
| `patch-record.mjs <id> <patch.json>` | Applies a JSON patch to one record: fields replace, `+sources` and `+history` append. A result that fails the schema is not written. |
| `new-record.mjs <spec.json>` | Creates the file for a list-only record, keeping the id the list snapshot uses. Never overwrites. |
| `rating.mjs [<id> ...]` | The rubric's rating, rule and reasons, the lists, and the review-note counts (signals, Annex B, archived sources). With no ids, the verified totals by rating. |
| `try-match.mjs [--search] "<line>" ...` | Runs the batch-check matcher, or the search box, on test lines: try a new name and its lookalikes before committing it. |
| `html-text.py [max-chars]` | Visible text of an HTML page on stdin (gzip and Chinese charsets handled), to check a source or capture holds the cited passage. |
| `pdf-text.py <out.json>` | Text of a PDF piped on stdin, page by page, without saving the PDF. Needs PyMuPDF. |
| `casi-entry.py <casi.json> "<lab>"` | One entry of CASI's key-lab directory with its printed page range; `--find "<name>"` lists every page that mentions a name. |

## A profile, step by step

1. Write the sources as a patch (`{"+sources": [...]}`) and apply it with `patch-record.mjs`; for a list-only record, write a spec and run `new-record.mjs` first. Run `npm test`.
2. Run `node scripts/tracker/archive-sources.mjs --id <id>`, then check each capture with `curl -s "https://web.archive.org/web/<timestamp>id_/<url>" | python scripts/tracker/research/html-text.py 100000 | grep -o "<cited words>"`. A short page can be flagged as blocked or empty while holding the text: if it does, set its archive address by hand.
3. Write the evidence, `"status": "verified"`, `verifiedOn` and a `+history` entry as a second patch and apply it.
4. Run `npm test` and `rating.mjs <id>`; try the record's names and their lookalikes with `try-match.mjs`. Commit only when the tests report `# fail 0`.
