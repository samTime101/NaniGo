import type { Question, LessonStep } from '../types';

/**
 * Build interactive lesson steps from a level's questions (fallback used when a
 * pack has no server-generated lesson). Teaches each concept, then adds a quick
 * "tap" check for multiple-choice questions so it feels interactive.
 */
export function deriveLesson(questions: Question[]): LessonStep[] {
  const steps: LessonStep[] = [];
  for (const q of questions) {
    const kind = q.kind ?? 'mcq';
    const exp = q.explanation ? `\n${q.explanation}` : '';
    if (kind === 'mcq') {
      const ans = q.options[q.correctIndex] ?? '';
      steps.push({
        kind: 'teach',
        title: "Let's learn",
        body: `${q.text}\nThe answer is: ${ans}.${exp}`,
      });
      if (q.options.length >= 2) {
        steps.push({
          kind: 'tap',
          title: 'Quick check',
          body: '',
          question: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
        });
      }
    } else if (kind === 'match' && q.pairs) {
      const lines = q.pairs.map((p) => `${p.left}  -  ${p.right}`).join('\n');
      steps.push({
        kind: 'teach',
        title: "Let's learn",
        body: `${q.text}\n${lines}${exp}`,
      });
    } else if (kind === 'order' && q.sequence) {
      steps.push({
        kind: 'teach',
        title: "Let's learn",
        body: `${q.text}\nCorrect order: ${q.sequence.join(' -> ')}${exp}`,
      });
    } else if (kind === 'speak') {
      steps.push({
        kind: 'teach',
        title: "Let's learn",
        body: `${q.text}\nThe answer is: ${q.answer ?? ''}.${exp}`,
      });
    } else {
      steps.push({ kind: 'teach', title: "Let's learn", body: q.text });
    }
  }
  return steps;
}
