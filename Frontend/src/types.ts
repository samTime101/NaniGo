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

export interface Question {
  id: string;
  text: string;
  textNp?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  figure?: 'rectangle' | 'triangle' | 'circle' | 'square' | 'star';
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
