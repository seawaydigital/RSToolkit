// The list being screened, kept while the user visits other tools. Held in
// this module's memory only: never in the page address or browser storage,
// so the names are gone when the tab closes.
export const EMPTY_LIST = { text: '', rows: [], skipped: [], truncated: false, totalRows: 0, read: false };

let list = null;

export const getList = () => list;
export const setList = (next) => {
  list = next;
};
