import { NOT_RATED_LABEL, RATING_LABELS } from './lib/constants';

// The rating always reads as text; the colour only reinforces it.
export default function RatingBadge({ assessment, large = false }) {
  const rating = assessment?.rating ?? null;
  const className = `dit-badge dit-badge--${rating ?? 'unrated'}${large ? ' dit-badge--large' : ''}`;
  return <span className={className}>{rating ? RATING_LABELS[rating] : NOT_RATED_LABEL}</span>;
}
