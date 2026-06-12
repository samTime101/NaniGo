import type {
  Child,
  LeaderboardEntry,
  Parent,
  Question,
  QuestionPack,
  SubjectId,
} from '../types';
import { mathQuestions, nepaliQuestions, scienceQuestions } from './questions';

function buildLevels(packId: string, questions: Question[]) {
  const levels = [];
  const perLevel = 5;
  for (let i = 0; i < 5; i++) {
    const slice = questions.slice(i * perLevel, i * perLevel + perLevel);
    levels.push({
      id: `${packId}-L${i + 1}`,
      sequenceNo: i + 1,
      questionIds: slice.map((q) => q.id),
    });
  }
  return levels;
}

function makeDefaultPack(
  subject: SubjectId,
  title: string,
  titleNp: string,
  questions: Question[],
): QuestionPack {
  const id = `default-${subject}`;
  return {
    id,
    title,
    titleNp,
    subject,
    type: 'default',
    status: 'ready',
    grade: 2,
    questions,
    levels: buildLevels(id, questions),
  };
}

export const defaultPacks: QuestionPack[] = [
  makeDefaultPack('math', 'Math Adventure', 'गणित यात्रा', mathQuestions),
  makeDefaultPack('nepali', 'Nepali Words', 'नेपाली शब्द', nepaliQuestions),
  makeDefaultPack('science', 'Science Explorer', 'विज्ञान खोज', scienceQuestions),
];

export const seedParent: Parent = {
  id: 'parent-1',
  name: 'Sita Sharma',
  email: 'demo@nanigo.app',
};

export const seedChildren: Child[] = [
  {
    id: 'child-1',
    name: 'Aarav',
    age: 7,
    grade: 2,
    avatar: 'tiger',
    childCode: '482913',
    totalXp: 1240,
    streakDays: 5,
    hearts: 3,
    heartsRefillAt: null,
    accuracy: 86,
    timeTodayMin: 24,
    weeklyXp: [120, 80, 160, 200, 140, 260, 280],
    completedLevels: { 'default-math': 3, 'default-nepali': 1 },
    activity: [
      { id: 'a1', text: 'Completed Level 3 — Math Adventure', stars: 3, at: Date.now() - 3600_000 },
      { id: 'a2', text: 'Completed Level 1 — Nepali Words', stars: 2, at: Date.now() - 7200_000 },
    ],
  },
  {
    id: 'child-2',
    name: 'Diya',
    age: 9,
    grade: 4,
    avatar: 'peacock',
    childCode: '305178',
    totalXp: 2050,
    streakDays: 12,
    hearts: 2,
    heartsRefillAt: null,
    accuracy: 91,
    timeTodayMin: 38,
    weeklyXp: [200, 240, 180, 320, 280, 300, 360],
    completedLevels: { 'default-math': 5, 'default-science': 2 },
    activity: [
      { id: 'b1', text: 'Completed Level 5 — Math Adventure', stars: 3, at: Date.now() - 1800_000 },
      { id: 'b2', text: 'Completed Level 2 — Science Explorer', stars: 3, at: Date.now() - 9000_000 },
    ],
  },
];

export const seedLeaderboard: LeaderboardEntry[] = [
  { id: 'lb1', name: 'Bibek', avatar: 'monkey', xp: 3120, grade: 2 },
  { id: 'lb2', name: 'Priya', avatar: 'rabbit', xp: 2890, grade: 2 },
  { id: 'child-1', name: 'Aarav', avatar: 'tiger', xp: 1240, grade: 2, isCurrent: true },
  { id: 'lb3', name: 'Sushant', avatar: 'rhino', xp: 1180, grade: 2 },
  { id: 'lb4', name: 'Anjali', avatar: 'elephant', xp: 980, grade: 2 },
  { id: 'lb5', name: 'Kiran', avatar: 'yak', xp: 760, grade: 2 },
  { id: 'lb6', name: 'Maya', avatar: 'peacock', xp: 540, grade: 2 },
  { id: 'lb7', name: 'Rohan', avatar: 'panda', xp: 320, grade: 2 },
];
