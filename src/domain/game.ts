/** Pure rules and data types for the local, household game session. */
export const DEFAULT_TURN_MINUTES = 20;
export const MIN_TURN_MINUTES = 1;
export const MAX_TURN_MINUTES = 180;
export const TURN_DURATION_MS = DEFAULT_TURN_MINUTES * 60_000;

export type Player = { id: string; name: string; color: number };
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
  status: "ORDER_READY" | "ACTIVE" | "PAUSED" | "ENDED";
  index: number;
  createdAt: number;
  turnDurationMs: number;
  startedAt?: number;
  endedAt?: number;
  turns: Turn[];
};
export type Settings = {
  alarm: boolean;
  volume: number;
  vibration: boolean;
  turnPresets: number[];
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
    volume: 0.7,
    vibration: true,
    turnPresets: [DEFAULT_TURN_MINUTES],
    selectedTurnMinutes: DEFAULT_TURN_MINUTES,
  },
};

export const uid = () => crypto.randomUUID();

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
  turnMinutesOrRandom: number | ((max: number) => number) = DEFAULT_TURN_MINUTES,
  random?: (max: number) => number,
): Session {
  if (
    players.length < 2 ||
    players.length > 4 ||
    new Set(players.map((player) => player.name.trim().toLocaleLowerCase("pt-BR"))).size !==
      players.length
  ) {
    throw new Error("Selecione de 2 a 4 jogadores com nomes diferentes.");
  }
  // Keep the original test/helper call shape valid while exposing configurable duration.
  const turnMinutes =
    typeof turnMinutesOrRandom === "number" ? turnMinutesOrRandom : DEFAULT_TURN_MINUTES;
  const randomSource = typeof turnMinutesOrRandom === "function" ? turnMinutesOrRandom : random;
  return {
    id: uid(),
    players: shuffle(players, randomSource),
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
  if (session.status !== "PAUSED") throw new Error("Sessão não está pausada.");
  const turns = [...session.turns];
  const last = turns.length - 1;
  const turn = turns[last];
  if (!turn) throw new Error("Turno indisponível.");
  turns[last] = { ...turn, segmentStartedAt: now };
  return { ...session, status: "ACTIVE", turns };
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
  if (session.status !== "ACTIVE" && session.status !== "PAUSED")
    throw new Error("Sessão não iniciada.");
  const turns = closeCurrentTurn(session, now);
  const last = turns.length - 1;
  const turn = turns[last];
  if (!turn) throw new Error("Turno indisponível.");
  turns[last] = { ...turn, endReason: "SESSION_ENDED" };
  return { ...session, turns, status: "ENDED", endedAt: now };
}

export function stats(session: Session) {
  return session.players.map((player) => {
    const turns = session.turns.filter((turn) => turn.playerId === player.id && turn.endReason);
    const totalMs = turns.reduce((sum, turn) => sum + (turn.activeDurationMs ?? 0), 0);
    return {
      player,
      turns: turns.length,
      deaths: turns.filter((turn) => turn.endReason === "DEATH").length,
      timeouts: turns.filter((turn) => turn.endReason === "TIMEOUT").length,
      totalMs,
      averageMs: turns.length ? totalMs / turns.length : 0,
      longestMs: Math.max(0, ...turns.map((turn) => turn.activeDurationMs ?? 0)),
    };
  });
}

export const clockText = (ms: number) => {
  const totalSeconds = Math.ceil(Math.max(0, ms) / 1000);
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
};
export const durationText = (ms: number) =>
  `${Math.floor(ms / 60000)}min ${String(Math.floor(ms / 1000) % 60).padStart(2, "0")}s`;
