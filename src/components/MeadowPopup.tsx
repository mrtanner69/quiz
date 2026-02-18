import type { MeadowPopupData } from '../hooks/useMeadow';

interface Props {
  popups: MeadowPopupData[];
  onDismiss: (id: string) => void;
}

export function MeadowPopup({ popups, onDismiss }: Props) {
  if (popups.length === 0) return null;

  return (
    <div className="meadow-popup-stack">
      {popups.map((p) => (
        <div
          key={p.id}
          className={`meadow-popup meadow-popup-${p.type}`}
          onClick={() => onDismiss(p.id)}
        >
          <span className="meadow-popup-icon">
            {p.type === 'rescue' ? '\u{1F6A8}' : '\u{1F331}'}
          </span>
          <span className="meadow-popup-text">{p.message}</span>
        </div>
      ))}
    </div>
  );
}
