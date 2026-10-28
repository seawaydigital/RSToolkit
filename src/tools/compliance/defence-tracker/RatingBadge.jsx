import { NOT_RATED_LABEL, RATING_LABELS } from './lib/constants';

// The rating always reads as text; the colour only reinforces it. A rating
// taken from the official lists alone says so under the badge.
export default function RatingBadge({ assessment, large = false }) {
  const rating = assessment?.rating ?? null;
  const className = `dit-badge dit-badge--${rating ?? 'unrated'}${large ? ' dit-badge--large' : ''}`;
  const badge = <span className={className}>{rating ? RATING_LABELS[rating] : NOT_RATED_LABEL}</span>;
  if (!rating || assessment.basis !== 'lists') return badge;
  return (
    <span className="dit-rating">
      {badge}
      <span className="dit-rating-basis"> from official lists</span>
    </span>
  );
}
