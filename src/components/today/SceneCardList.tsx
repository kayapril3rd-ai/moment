// SceneCardList renders Today activity cards. Today keeps this short and scannable.
// More plans live in Arrange; this surface highlights the most relevant shared scene.
import type { SceneCard as SceneCardType } from '../../types/che';
import { SceneCard } from './SceneCard';

interface SceneCardListProps {
  title: string;
  cards: SceneCardType[];
  onSelectScene: (card: SceneCardType) => void;
}

export function SceneCardList({ title, cards, onSelectScene }: SceneCardListProps) {
  const visibleCards = [...cards]
    .filter((card) => card.status !== 'disabled')
    .sort((a, b) => getCardPriority(a) - getCardPriority(b) || a.sortOrder - b.sortOrder)
    .slice(0, 1);

  return (
    <section className="scene-section" aria-labelledby="scene-section-title">
      <div className="section-heading">
        <h2 id="scene-section-title">{title}</h2>
      </div>

      <div className="scene-list">
        {visibleCards.map((card) => (
          <SceneCard key={card.id} card={card} onSelect={onSelectScene} />
        ))}
      </div>
    </section>
  );
}

function getCardPriority(card: SceneCardType): number {
  if (card.status === 'active') return 0;
  if (card.status === 'scheduled') return 1;
  if (card.status === 'availableNow') return 2;
  if (card.status === 'flexible') return 3;
  return 4;
}
