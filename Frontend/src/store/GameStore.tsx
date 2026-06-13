import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type {
  AvatarId,
  Child,
  Parent,
  QuestionPack,
  SubjectId,
} from '../types';
import { api, getToken, setToken } from '../lib/api';

const ACTIVE_KEY = 'nanigo-active-child';

interface GameContextValue {
  parent: Parent | null;
  children: Child[];
  packs: QuestionPack[];
  activeChild: Child | null;
  ready: boolean;

  // parent auth
  login: (email: string, password: string) => Promise<Parent>;
  signup: (name: string, email: string, password: string) => Promise<Parent>;
  logout: () => void;

  // parent data
  refreshParent: () => Promise<void>;
  refreshChildren: () => Promise<void>;
  addChild: (input: {
    name: string;
    age: number;
    grade: number;
    avatar: AvatarId;
  }) => Promise<Child>;
  regenerateCode: (childId: string) => Promise<void>;

  // packs
  refreshPacks: () => Promise<void>;
  uploadBook: (
    childId: string,
    subject: SubjectId,
    files: File[],
  ) => Promise<string>;

  // kid session
  loginChildByCode: (code: string) => Promise<Child | null>;
  setActiveChild: (child: Child | null) => void;
  refreshActiveChild: () => Promise<void>;

  // gameplay
  completeLevel: (
    childId: string,
    packId: string,
    sequenceNo: number,
    correct: number,
    total: number,
  ) => Promise<{ xpEarned: number; stars: number }>;
  loseHeart: (childId: string) => Promise<void>;
  refillHearts: (childId: string) => Promise<void>;
  awardXp: (childId: string, xp: number) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children: kids }: { children: ReactNode }) {
  const [parent, setParent] = useState<Parent | null>(null);
  const [childList, setChildList] = useState<Child[]>([]);
  const [packs, setPacks] = useState<QuestionPack[]>([]);
  const [activeChild, setActive] = useState<Child | null>(null);
  const [ready, setReady] = useState(false);

  const refreshPacks = useCallback(async () => {
    try {
      setPacks(await api.listPacks());
    } catch {
      /* backend offline */
    }
  }, []);

  const refreshChildren = useCallback(async () => {
    try {
      setChildList(await api.listChildren());
    } catch {
      /* not authed */
    }
  }, []);

  const refreshParent = useCallback(async () => {
    try {
      setParent(await api.me());
      await refreshChildren();
    } catch {
      /* not authed */
    }
  }, [refreshChildren]);

  const setActiveChild = useCallback((child: Child | null) => {
    setActive(child);
    if (child) localStorage.setItem(ACTIVE_KEY, child.id);
    else localStorage.removeItem(ACTIVE_KEY);
  }, []);

  // initial bootstrap
  useEffect(() => {
    (async () => {
      await refreshPacks();
      if (getToken()) {
        try {
          setParent(await api.me());
          await refreshChildren();
        } catch {
          setToken(null);
        }
      }
      const savedChild = localStorage.getItem(ACTIVE_KEY);
      if (savedChild) {
        try {
          setActive(await api.getChild(savedChild));
        } catch {
          localStorage.removeItem(ACTIVE_KEY);
        }
      }
      setReady(true);
    })();
  }, [refreshPacks, refreshChildren]);

  const login = useCallback(
    async (email: string, password: string) => {
      const p = await api.login(email, password);
      setParent(p);
      await refreshChildren();
      return p;
    },
    [refreshChildren],
  );

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const p = await api.signup(name, email, password);
      setParent(p);
      await refreshChildren();
      return p;
    },
    [refreshChildren],
  );

  const logout = useCallback(() => {
    setToken(null);
    setParent(null);
    setChildList([]);
  }, []);

  const addChild: GameContextValue['addChild'] = useCallback(async (input) => {
    const child = await api.addChild(input);
    setChildList((cs) => [...cs, child]);
    return child;
  }, []);

  const regenerateCode = useCallback(async (childId: string) => {
    const updated = await api.regenerateCode(childId);
    setChildList((cs) => cs.map((c) => (c.id === childId ? updated : c)));
  }, []);

  const uploadBook: GameContextValue['uploadBook'] = useCallback(
    async (childId, subject, files) => {
      const { pack_id } = await api.uploadBook(childId, subject, files);
      // Old personalized packs were dropped server-side; resync the list.
      await refreshPacks();
      // poll until the Gemini pipeline finishes
      const poll = async (tries = 0) => {
        try {
          const pack = await api.getPack(pack_id);
          setPacks((ps) => {
            const exists = ps.some((p) => p.id === pack.id);
            return exists
              ? ps.map((p) => (p.id === pack.id ? pack : p))
              : [...ps, pack];
          });
          if (pack.status === 'generating' && tries < 40) {
            setTimeout(() => poll(tries + 1), 1500);
          } else {
            await refreshPacks();
          }
        } catch {
          /* ignore */
        }
      };
      poll();
      return pack_id;
    },
    [refreshPacks],
  );

  const loginChildByCode = useCallback(
    async (code: string) => {
      try {
        const child = await api.kidLogin(code);
        setActiveChild(child);
        return child;
      } catch {
        return null;
      }
    },
    [setActiveChild],
  );

  const refreshActiveChild = useCallback(async () => {
    if (!activeChild) return;
    try {
      setActive(await api.getChild(activeChild.id));
    } catch {
      /* ignore */
    }
  }, [activeChild]);

  const syncChild = (updated: Child) => {
    setActive((cur) => (cur && cur.id === updated.id ? updated : cur));
    setChildList((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
  };

  const completeLevel: GameContextValue['completeLevel'] = useCallback(
    async (childId, packId, sequenceNo, correct, total) => {
      const r = await api.completeLevel(
        childId,
        packId,
        sequenceNo,
        correct,
        total,
      );
      try {
        const fresh = await api.getChild(childId);
        syncChild(fresh);
      } catch {
        /* ignore */
      }
      return { xpEarned: r.xp_earned, stars: r.stars };
    },
    [],
  );

  const loseHeart = useCallback(async (childId: string) => {
    try {
      syncChild(await api.loseHeart(childId));
    } catch {
      /* ignore */
    }
  }, []);

  const refillHearts = useCallback(async (childId: string) => {
    try {
      syncChild(await api.refillHearts(childId));
    } catch {
      /* ignore */
    }
  }, []);

  const awardXp = useCallback((childId: string, xp: number) => {
    // No dedicated endpoint; reflect locally for snappy UX.
    setActive((cur) =>
      cur && cur.id === childId ? { ...cur, totalXp: cur.totalXp + xp } : cur,
    );
  }, []);

  const value: GameContextValue = {
    parent,
    children: childList,
    packs,
    activeChild,
    ready,
    login,
    signup,
    logout,
    refreshParent,
    refreshChildren,
    addChild,
    regenerateCode,
    refreshPacks,
    uploadBook,
    loginChildByCode,
    setActiveChild,
    refreshActiveChild,
    completeLevel,
    loseHeart,
    refillHearts,
    awardXp,
  };

  return <GameContext.Provider value={value}>{kids}</GameContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
