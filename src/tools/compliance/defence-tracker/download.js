// Saves text as a file from the browser; nothing is sent anywhere. CSV files
// start with a byte-order mark so Excel reads Chinese names correctly.
export function downloadFile(filename, text, type) {
  const bom = type.startsWith('text/csv') ? '\uFEFF' : '';
  const url = URL.createObjectURL(new Blob([bom + text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

export const localDate = () => new Date().toLocaleDateString('en-CA');
