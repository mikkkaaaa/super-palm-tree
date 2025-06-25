import React from 'react';

export default function LevelSelect({ levels, unlockedLevels, onSelect }) {
  return (
    <div className="level-select">
      <h2>Select Level</h2>
      <div className="levels">
        {levels.map(level => {
          const locked = !unlockedLevels.includes(level.id);
          return (
            <button
              key={level.id}
              disabled={locked}
              className={`level-btn ${locked ? 'locked' : ''}`}
              onClick={() => !locked && onSelect(level)}
            >
              {level.name} {locked ? '🔒' : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}
