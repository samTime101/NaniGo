export type AvatarId =
  | 'panda'
  | 'tiger'
  | 'elephant'
  | 'monkey'
  | 'rhino'
  | 'peacock'
  | 'yak'
  | 'rabbit';

export type SubjectId = 'math' | 'nepali' | 'science' | 'english';

export type QuestionKind = 'mcq' | 'match' | 'order';

export interface MatchPair {
  left: string;
  right: string;
}

export interface Question {
  id: string;
  kind?: QuestionKind;
  text: string;
  textNp?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  figure?: 'rectangle' | 'triangle' | 'circle' | 'square' | 'star';
  pairs?: MatchPair[];
  sequence?: string[];
}

export interface Attempt {
  id: string;
  childId: string;
  packId: string;
  packTitle: string;
  subject: SubjectId;
  questionId: string;
  questionText: string;
  kind: QuestionKind;
  correct: boolean;
  timeMs: number;
  selected?: string;
  at: number;
}

export interface Level {
  id: string;
  sequenceNo: number;
  questionIds: string[];
}

export type PackType = 'default' | 'personalized';
export type PackStatus = 'generating' | 'ready' | 'failed';

export interface QuestionPack {
  id: string;
  title: string;
  titleNp: string;
  subject: SubjectId;
  type: PackType;
  status: PackStatus;
  grade: number;
  createdBy?: string; // parent name for personalized
  createdAt?: number;
  questions: Question[];
  levels: Level[];
}

export interface Child {
  id: string;
  name: string;
  age: number;
  grade: number;
  avatar: AvatarId;
  childCode: string;
  totalXp: number;
  streakDays: number;
  hearts: number;
  heartsRefillAt: number | null;
  accuracy: number;
  timeTodayMin: number;
  weeklyXp: number[]; // 7 entries
  completedLevels: Record<string, number>; // packId -> highest completed sequenceNo
  activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  text: string;
  stars: number;
  at: number;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: AvatarId;
  xp: number;
  grade: number;
  isCurrent?: boolean;
}
