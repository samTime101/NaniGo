import type {
  AvatarId,
  Child,
  LeaderboardEntry,
  Parent,
  Question,
  QuestionPack,
  SubjectId,
} from '../types';

const BASE = '/api';

let authToken: string | null = localStorage.getItem('nanigo-token');

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('nanigo-token', token);
  else localStorage.removeItem('nanigo-token');
}

export function getToken() {
  return authToken;
}

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false,
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth && authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------- converters (snake_case API -> camelCase app) ----------
type RawQuestion = {
  id: string;
  text: string;
  text_np?: string | null;
  options: string[];
  correct_index: number;
  explanation: string;
  figure?: Question['figure'] | null;
};

type RawLevel = { id: string; sequence_no: number; question_ids: string[] };

type RawPack = {
  id: string;
  title: string;
  title_np: string;
  subject: SubjectId;
  type: 'default' | 'personalized';
  status: 'generating' | 'ready' | 'failed';
  grade: number;
  created_by?: string | null;
  created_at?: number | null;
  questions: RawQuestion[];
  levels: RawLevel[];
};

type RawChild = {
  id: string;
  parent_id: string;
  name: string;
  age: number;
  grade: number;
  avatar: AvatarId;
  child_code: string;
  total_xp: number;
  streak_days: number;
  hearts: number;
  hearts_refill_at: number | null;
  accuracy: number;
  time_today_min: number;
  weekly_xp: number[];
  completed_levels: Record<string, number>;
  activity: { id: string; text: string; stars: number; at: number }[];
};

function toQuestion(q: RawQuestion): Question {
  return {
    id: q.id,
    text: q.text,
    textNp: q.text_np ?? undefined,
    options: q.options,
    correctIndex: q.correct_index,
    explanation: q.explanation,
    figure: q.figure ?? undefined,
  };
}

function toPack(p: RawPack): QuestionPack {
  return {
    id: p.id,
    title: p.title,
    titleNp: p.title_np,
    subject: p.subject,
    type: p.type,
    status: p.status,
    grade: p.grade,
    createdBy: p.created_by ?? undefined,
    createdAt: p.created_at ?? undefined,
    questions: p.questions.map(toQuestion),
    levels: p.levels.map((l) => ({
      id: l.id,
      sequenceNo: l.sequence_no,
      questionIds: l.question_ids,
    })),
  };
}

function toChild(c: RawChild): Child {
  return {
    id: c.id,
    name: c.name,
    age: c.age,
    grade: c.grade,
    avatar: c.avatar,
    childCode: c.child_code,
    totalXp: c.total_xp,
    streakDays: c.streak_days,
    hearts: c.hearts,
    heartsRefillAt: c.hearts_refill_at,
    accuracy: c.accuracy,
    timeTodayMin: c.time_today_min,
    weeklyXp: c.weekly_xp,
    completedLevels: c.completed_levels,
    activity: c.activity,
  };
}

// ---------- endpoints ----------
export const api = {
  // auth
  async signup(name: string, email: string, password: string) {
    const r = await request<{ parent: Parent; token: string }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setToken(r.token);
    return r.parent;
  },

  async login(email: string, password: string) {
    const r = await request<{ parent: Parent; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(r.token);
    return r.parent;
  },

  async me() {
    return request<Parent>('/auth/me', {}, true);
  },

  // packs (public)
  async listPacks() {
    const raw = await request<RawPack[]>('/packs');
    return raw.map(toPack);
  },

  async getPack(id: string) {
    return toPack(await request<RawPack>(`/packs/${id}`));
  },

  // children (parent, auth)
  async listChildren() {
    const raw = await request<RawChild[]>('/children', {}, true);
    return raw.map(toChild);
  },

  async addChild(input: {
    name: string;
    age: number;
    grade: number;
    avatar: AvatarId;
  }) {
    const raw = await request<RawChild>(
      '/children',
      { method: 'POST', body: JSON.stringify(input) },
      true,
    );
    return toChild(raw);
  },

  async regenerateCode(childId: string) {
    const raw = await request<RawChild>(
      `/children/${childId}/regenerate-code`,
      { method: 'POST' },
      true,
    );
    return toChild(raw);
  },

  // kid session (public)
  async kidLogin(code: string) {
    const raw = await request<RawChild>(`/kid/login/${code}`, {
      method: 'POST',
    });
    return toChild(raw);
  },

  async getChild(childId: string) {
    return toChild(await request<RawChild>(`/kid/${childId}`));
  },

  async completeLevel(
    childId: string,
    packId: string,
    sequenceNo: number,
    correct: number,
    total: number,
  ) {
    return request<{ xp_earned: number; stars: number; total_xp: number }>(
      `/kid/${childId}/complete-level`,
      {
        method: 'POST',
        body: JSON.stringify({
          pack_id: packId,
          sequence_no: sequenceNo,
          correct,
          total,
        }),
      },
    );
  },

  async loseHeart(childId: string) {
    return toChild(
      await request<RawChild>(`/kid/${childId}/lose-heart`, { method: 'POST' }),
    );
  },

  async refillHearts(childId: string) {
    return toChild(
      await request<RawChild>(`/kid/${childId}/refill-hearts`, {
        method: 'POST',
      }),
    );
  },

  // uploads (parent, auth, multipart)
  async uploadBook(childId: string, subject: SubjectId, files: File[]) {
    const fd = new FormData();
    fd.append('child_id', childId);
    fd.append('subject', subject);
    files.forEach((f) => fd.append('files', f));
    return request<{ pack_id: string; status: string }>(
      '/uploads',
      { method: 'POST', body: fd },
      true,
    );
  },

  // battles
  async startBattle(childId: string, subject: SubjectId) {
    return request<{
      id: string;
      subject: SubjectId;
      players: {
        id: string;
        name: string;
        avatar: AvatarId;
        score: number;
        is_bot: boolean;
      }[];
      questions: {
        id: string;
        text: string;
        text_np?: string;
        options: string[];
        correct_index: number;
      }[];
    }>('/battles', {
      method: 'POST',
      body: JSON.stringify({ child_id: childId, subject }),
    });
  },

  // leaderboard
  async leaderboard(
    scope: 'class' | 'all',
    grade?: number,
    currentChildId?: string,
  ) {
    const params = new URLSearchParams({ scope });
    if (grade != null) params.set('grade', String(grade));
    if (currentChildId) params.set('current_child_id', currentChildId);
    const raw = await request<
      {
        id: string;
        name: string;
        avatar: AvatarId;
        xp: number;
        grade: number;
        is_current: boolean;
      }[]
    >(`/leaderboard?${params.toString()}`);
    return raw.map(
      (e): LeaderboardEntry => ({
        id: e.id,
        name: e.name,
        avatar: e.avatar,
        xp: e.xp,
        grade: e.grade,
        isCurrent: e.is_current,
      }),
    );
  },
};

export { ApiError };
