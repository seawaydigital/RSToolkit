// Spreadsheet apps run cells that start with these characters as formulas,
// and the toolkit's tables are built from pasted text, so such cells get a
// leading apostrophe: in CSV files and in copied tables, which are pasted
// into spreadsheets too.
export const neutralise = (value) => {
  const s = value == null ? '' : String(value);
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
};

export function csvCell(value) {
  const s = neutralise(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export const csvRow = (cells) => cells.map(csvCell).join(',');
