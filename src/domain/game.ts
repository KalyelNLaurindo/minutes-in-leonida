/** Pure rules and data types for the local, household game session. */
export const DEFAULT_TURN_MINUTES = 20;
export const MIN_TURN_MINUTES = 1;
export const MAX_TURN_MINUTES = 180;
export const MIN_SESSION_PLAYERS = 2;
export const MAX_PLAYERS = 10;
export const TURN_DURATION_MS = DEFAULT_TURN_MINUTES * 60_000;

export type PlayerIcon =
  | "revolver"
  | "lighter"
  | "broken-bottle"
  | "knife"
  | "vest"
  | "money"
  | "car"
  | "star"
  | "dice"
  | "flame";
export type Player = {
  id: string;
  name: string;
  color: number;
  customColor?: string;
  icon?: PlayerIcon;
};
export type Reason = "DEATH" | "TIMEOUT" | "SESSION_ENDED";
export type Turn = {
  id: string;
  playerId: string;
  sequence: number;
  startedAt: number;
  segmentStartedAt: number;
  elapsedMs: number;
  endedAt?: number;
  activeDurationMs?: number;
  endReason?: Reason;
};
export type Session = {
  id: string;
  players: Player[];
  status: "ORDER_READY" | "ACTIVE" | "PAUSED" | "SUSPENDED" | "ENDED";
  index: number;
  createdAt: number;
  turnDurationMs: number;
  startedAt?: number;
  endedAt?: number;
  turns: Turn[];
};
export type Settings = {
  locale?: "pt" | "en" | "es";
  alarm: boolean;
  alarmSound: "builtin" | "custom";
  volume: number;
  vibration: boolean;
  selectedTurnMinutes: number;
};
export type AppData = {
  version: 2;
  players: Player[];
  session: Session | null;
  history: Session[];
  settings: Settings;
};

export const defaults: AppData = {
  version: 2,
  players: [],
  session: null,
  history: [],
  settings: {
    alarm: true,
    alarmSound: "builtin",
    volume: 0.7,
    vibration: true,
    selectedTurnMinutes: DEFAULT_TURN_MINUTES,
  },
};

/** Create an ID on browsers that do not expose crypto.randomUUID(). */
export const uid = () => {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === "function") return cryptoApi.randomUUID();

  // randomUUID is missing in some mobile browsers and insecure contexts.
  // Use secure random bytes when available, then fall back to Math.random so
  // adding a local player still works in older WebViews.
  const bytes = new Uint8Array(16);
  if (typeof cryptoApi?.getRandomValues === "function") {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
};

/** Fisher–Yates shuffle using unbiased secure random integers by default. */
export function shuffle<T>(
  items: T[],
  random: (max: number) => number = (max) => {
    const limit = Math.floor(0x1_0000_0000 / max) * max;
    const values = new Uint32Array(1);
    let value: number;
    do {
      crypto.getRandomValues(values);
      value = values[0] ?? 0;
    } while (value >= limit);
    return value % max;
  },
): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = random(index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex]!, result[index]!];
  }
  return result;
}

export function normalizeMinutes(minutes: number): number {
  if (!Number.isInteger(minutes) || minutes < MIN_TURN_MINUTES || minutes > MAX_TURN_MINUTES) {
    throw new Error(
      `Escolha um tempo inteiro entre ${MIN_TURN_MINUTES} e ${MAX_TURN_MINUTES} minutos.`,
    );
  }
  return minutes;
}

export function createSession(
  players: Player[],
  now: number,
  turnMinutes = DEFAULT_TURN_MINUTES,
  random?: (max: number) => number,
): Session {
  if (
    players.length < MIN_SESSION_PLAYERS ||
    players.length > MAX_PLAYERS ||
    new Set(players.map((player) => player.name.trim().toLocaleLowerCase("pt-BR"))).size !==
      players.length
  ) {
    throw new Error(`Selecione de 2 a ${MAX_PLAYERS} jogadores com nomes diferentes.`);
  }
  return {
    id: uid(),
    players: shuffle(players, random),
    status: "ORDER_READY",
    index: 0,
    createdAt: now,
    turnDurationMs: normalizeMinutes(turnMinutes) * 60_000,
    turns: [],
  };
}

export function start(session: Session, now: number): Session {
  if (session.status !== "ORDER_READY") throw new Error("Ordem indisponível.");
  const firstPlayer = session.players[0];
  if (!firstPlayer) throw new Error("A sessão precisa ter jogadores.");
  return {
    ...session,
    status: "ACTIVE",
    startedAt: now,
    turns: [
      {
        id: uid(),
        playerId: firstPlayer.id,
        sequence: 1,
        startedAt: now,
        segmentStartedAt: now,
        elapsedMs: 0,
      },
    ],
  };
}

export function remaining(session: Session, now: number): number {
  const turn = session.turns.at(-1);
  if (session.status === "ENDED") return 0;
  if (!turn || session.status === "ORDER_READY") return session.turnDurationMs;
  const elapsedNow = session.status === "ACTIVE" ? Math.max(0, now - turn.segmentStartedAt) : 0;
  return Math.max(0, session.turnDurationMs - turn.elapsedMs - elapsedNow);
}

function accumulatedTurnTime(session: Session, now: number, turn: Turn): number {
  const segment = session.status === "ACTIVE" ? Math.max(0, now - turn.segmentStartedAt) : 0;
  return Math.min(session.turnDurationMs, turn.elapsedMs + segment);
}

function closeCurrentTurn(session: Session, now: number): Turn[] {
  const turns = [...session.turns];
  const turn = turns.at(-1);
  if (!turn) throw new Error("Turno indisponível.");
  turns[turns.length - 1] = {
    ...turn,
    endedAt: now,
    activeDurationMs: accumulatedTurnTime(session, now, turn),
  };
  return turns;
}

export function pause(session: Session, now: number): Session {
  if (session.status !== "ACTIVE") throw new Error("Sessão não está ativa.");
  const turns = [...session.turns];
  const last = turns.length - 1;
  const current = turns[last];
  if (!current) throw new Error("Turno indisponível.");
  turns[last] = { ...current, elapsedMs: accumulatedTurnTime(session, now, current) };
  return { ...session, status: "PAUSED", turns };
}

export function resume(session: Session, now: number): Session {
  if (session.status !== "PAUSED" && session.status !== "SUSPENDED")
    throw new Error("Sessão não está pausada.");
  const turns = [...session.turns];
  const last = turns.length - 1;
  const turn = turns[last];
  if (!turn) throw new Error("Turno indisponível.");
  turns[last] = { ...turn, segmentStartedAt: now };
  return { ...session, status: "ACTIVE", turns };
}

/** Freeze the active turn and mark the session for later continuation from Home. */
export function suspend(session: Session, now: number): Session {
  const paused = session.status === "ACTIVE" ? pause(session, now) : session;
  if (paused.status !== "PAUSED" && paused.status !== "SUSPENDED")
    throw new Error("Somente uma sessão iniciada pode ser suspensa.");
  return { ...paused, status: "SUSPENDED" };
}

export function advance(
  session: Session,
  reason: "DEATH" | "TIMEOUT",
  now: number,
  expectedTurnId?: string,
): Session {
  if (session.status !== "ACTIVE") return session;
  const current = session.turns.at(-1);
  if (
    !current ||
    current.endedAt !== undefined ||
    (expectedTurnId && current.id !== expectedTurnId)
  )
    return session;
  const elapsed =
    reason === "TIMEOUT"
      ? session.turnDurationMs
      : Math.min(
          session.turnDurationMs,
          current.elapsedMs + Math.max(0, now - current.segmentStartedAt),
        );
  const playersCount = session.players.length;
  if (playersCount < 2) return session;
  const index = (session.index + 1) % playersCount;
  const nextPlayer = session.players[index];
  if (!nextPlayer) return session;
  const turns = [...session.turns];
  turns[turns.length - 1] = {
    ...current,
    endedAt: now,
    activeDurationMs: elapsed,
    endReason: reason,
  };
  turns.push({
    id: uid(),
    playerId: nextPlayer.id,
    sequence: turns.length + 1,
    startedAt: now,
    segmentStartedAt: now,
    elapsedMs: 0,
  });
  return { ...session, index, turns };
}

export function end(session: Session, now: number): Session {
  if (session.status !== "ACTIVE" && session.status !== "PAUSED" && session.status !== "SUSPENDED")
    throw new Error("Sessão não iniciada.");
  const turns = closeCurrentTurn(session, now);
  const last = turns.length - 1;
  const turn = turns[last];
  if (!turn) throw new Error("Turno indisponível.");
  turns[last] = { ...turn, endReason: "SESSION_ENDED" };
  return { ...session, turns, status: "ENDED", endedAt: now };
}

export function stats(session: Session) {
  const totals = new Map(
    session.players.map((player) => [
      player.id,
      { turns: 0, deaths: 0, timeouts: 0, totalMs: 0, longestMs: 0 },
    ]),
  );

  // Aggregate once so report and summary work in O(players + turns).
  for (const turn of session.turns) {
    if (!turn.endReason) continue;
    const total = totals.get(turn.playerId);
    if (!total) continue;

    const duration = turn.activeDurationMs ?? 0;
    total.turns += 1;
    total.totalMs += duration;
    total.longestMs = Math.max(total.longestMs, duration);
    if (turn.endReason === "DEATH") total.deaths += 1;
    if (turn.endReason === "TIMEOUT") total.timeouts += 1;
  }

  return session.players.map((player) => {
    const total = totals.get(player.id)!;
    return {
      player,
      ...total,
      averageMs: total.turns ? total.totalMs / total.turns : 0,
    };
  });
}

/** Remove one completed session while preserving the order of the remaining history. */
export function removeHistorySession(data: AppData, sessionId: string): AppData {
  return { ...data, history: data.history.filter((session) => session.id !== sessionId) };
}

export const clockText = (ms: number) => {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
};
export const durationText = (ms: number) =>
  `${Math.floor(ms / 60000)}min ${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}s`;
