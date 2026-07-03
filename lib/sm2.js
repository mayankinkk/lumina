// SM-2 Spaced Repetition Algorithm
// https://en.wikipedia.org/wiki/SuperMemo#Description_of_SM-2_algorithm

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function calculateNextReview(word, quality) {
  // quality: 0-5 (0=complete blackout, 5=perfect response)
  // For our UI: "hard" = 1, "good" = 3, "easy" = 5

  const { repetitions = 0, easeFactor = 2.5, interval = 0 } = word;

  let newRepetitions = repetitions;
  let newEaseFactor = easeFactor;
  let newInterval = interval;

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * easeFactor);
    }
    newRepetitions = repetitions + 1;
  } else {
    // Incorrect response - reset
    newRepetitions = 0;
    newInterval = 1;
  }

  // Update ease factor
  newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = clamp(newEaseFactor, 1.3, 3.0);

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  const masteryLevel = Math.min(100, Math.round((newRepetitions / 7) * 100));

  return {
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReview: nextReview.toISOString(),
    masteryLevel,
    mastery: getMasteryLabel(masteryLevel),
  };
}

function getMasteryLabel(level) {
  if (level >= 80) return "C2";
  if (level >= 60) return "C1";
  if (level >= 40) return "B2";
  if (level >= 20) return "B1";
  return "A2";
}

export function getDueWords(vocabulary) {
  const now = new Date();
  return vocabulary.filter((w) => {
    if (!w.nextReview) return true;
    return new Date(w.nextReview) <= now;
  });
}

export function getDueWordsCount(vocabulary) {
  return getDueWords(vocabulary).length;
}
