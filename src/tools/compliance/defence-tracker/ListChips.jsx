import { listChips } from './lib/recordText';

// The lists an institution is on, as labelled chips. Sanctions chips are
// tinted red; the colour only reinforces the text.
export default function ListChips({ record }) {
  const chips = listChips(record);
  if (!chips.length) return <p className="dit-chips-none">Not on a checked list</p>;
  return (
    <ul className="dit-chips" aria-label="Listed on">
      {chips.map((c) => (
        <li key={c.listId} className={`dit-chip dit-chip--${c.kind}`}>{c.label}</li>
      ))}
    </ul>
  );
}
