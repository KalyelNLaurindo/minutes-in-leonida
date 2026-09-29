import {
  DEFAULT_TURN_MINUTES,
  MAX_PLAYERS,
  MAX_TURN_MINUTES,
  MIN_TURN_MINUTES,
  defaults,
  type AppData,
  type Player,
  type Session,
  type Settings,
  type Turn,
} from "./game";

const PRIMARY_KEY = "minutes-in-leonida:v2";
const BACKUP_KEY = "minutes-in-leonida:backup:v2";
const LEGACY_KEY = "minutes-in-leonida:v1";
const MAX_HISTORY = 100;

/** Identify cross-tab storage events that can change this app's persisted state. */
export function isRepositoryKey(key: string | null): boolean {
  return key === null || key === PRIMARY_KEY || key === BACKUP_KEY || key === LEGACY_KEY;
}

export type LoadResult = { data: AppData; recovered: boolean; migrated: boolean; issue?: string };
export type SaveResult = { ok: boolean; backupOk: boolean; issue?: string };

type JsonRecord = Record<string, unknown> & {
  id?: unknown;
  name?: unknown;
  color?: unknown;
  endReason?: unknown;
  playerId?: unknown;
  sequence?: unknown;
  startedAt?: unknown;
  segmentStartedAt?: unknown;
  elapsedMs?: unknown;
  endedAt?: unknown;
  activeDurationMs?: unknown;
  players?: unknown;
  turns?: unknown;
  status?: unknown;
  index?: unknown;
  createdAt?: unknown;
  turnDurationMs?: unknown;
  alarm?: unknown;
  vibration?: unknown;
  volume?: unknown;
  turnPresets?: unknown;
  selectedTurnMinutes?: unknown;
  version?: unknown;
  history?: unknown;
  session?: unknown;
  settings?: unknown;
  revision?: unknown;
  data?: unknown;
};

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

function validPlayer(value: unknown): value is Player {
  const icons = [
    "revolver",
    "lighter",
    "broken-bottle",
    "knife",
    "vest",
    "money",
    "car",
    "star",
    "dice",
    "flame",
  ];
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    value.id.length > 0 &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    value.name.length <= 24 &&
    Number.isInteger(value.color) &&
    Number(value.color) >= 0 &&
    Number(value.color) <= 9 &&
    (value["customColor"] === undefined ||
      (typeof value["customColor"] === "string" &&
        /^#[\da-fA-F]{6}$/.test(value["customColor"]))) &&
    (value["icon"] === undefined || icons.includes(String(value["icon"])))
  );
}

function validTurn(value: unknown): value is Turn {
  if (!isRecord(value)) return false;
  const reason = value.endReason;
  return (
    typeof value.id === "string" &&
    typeof value.playerId === "string" &&
    Number.isInteger(value.sequence) &&
    isFiniteNumber(value.startedAt) &&
    isFiniteNumber(value.segmentStartedAt) &&
    isFiniteNumber(value.elapsedMs) &&
    value.elapsedMs >= 0 &&
    (value.endedAt === undefined || isFiniteNumber(value.endedAt)) &&
    (value.activeDurationMs === undefined ||
      (isFiniteNumber(value.activeDurationMs) && value.activeDurationMs >= 0)) &&
    (reason === undefined ||
      reason === "DEATH" ||
      reason === "TIMEOUT" ||
      reason === "SESSION_ENDED")
  );
}

function validSession(value: unknown): value is Session {
  if (
    !isRecord(value) ||
    !Array.isArray(value.players) ||
    value.players.length < 2 ||
    value.players.length > MAX_PLAYERS ||
    !value.players.every(validPlayer) ||
    !Array.isArray(value.turns) ||
    !value.turns.every(validTurn)
  )
    return false;
  const turns = value.turns;
  const playerIds = new Set(value.players.map((player: Player) => player.id));
  if (
    playerIds.size !== value.players.length ||
    turns.some(
      (turn: Turn, index: number) =>
        !playerIds.has(turn.playerId) ||
        turn.sequence !== index + 1 ||
        (index < turns.length - 1 && turn.endReason === undefined),
    )
  )
    return false;
  const statuses = ["ORDER_READY", "ACTIVE", "PAUSED", "SUSPENDED", "ENDED"];
  return (
    typeof value.id === "string" &&
    statuses.includes(String(value.status)) &&
    Number.isInteger(value.index) &&
    Number(value.index) >= 0 &&
    Number(value.index) < value.players.length &&
    isFiniteNumber(value.createdAt) &&
    isFiniteNumber(value.turnDurationMs) &&
    value.turnDurationMs >= MIN_TURN_MINUTES * 60_000 &&
    value.turnDurationMs <= MAX_TURN_MINUTES * 60_000 &&
    (value.startedAt === undefined || isFiniteNumber(value.startedAt)) &&
    (value.endedAt === undefined || isFiniteNumber(value.endedAt)) &&
    (value.status !== "ORDER_READY" || value.turns.length === 0) &&
    (value.status === "ORDER_READY" || value.turns.length > 0) &&
    (value.status !== "ENDED" || isFiniteNumber(value.endedAt))
  );
}

function validSettings(value: unknown): value is Settings {
  return (
    isRecord(value) &&
    (value["locale"] === undefined ||
      value["locale"] === "pt" ||
      value["locale"] === "en" ||
      value["locale"] === "es") &&
    typeof value.alarm === "boolean" &&
    (value["alarmSound"] === undefined ||
      value["alarmSound"] === "builtin" ||
      value["alarmSound"] === "custom") &&
    typeof value.vibration === "boolean" &&
    isFiniteNumber(value.volume) &&
    value.volume >= 0 &&
    value.volume <= 1 &&
    Number.isInteger(value.selectedTurnMinutes) &&
    Number(value.selectedTurnMinutes) >= MIN_TURN_MINUTES &&
    Number(value.selectedTurnMinutes) <= MAX_TURN_MINUTES
  );
}

/** Reject incomplete JSON before it can enter the game state. */
export function isAppData(value: unknown): value is AppData {
  return (
    isRecord(value) &&
    value.version === 2 &&
    Array.isArray(value.players) &&
    value.players.length <= MAX_PLAYERS &&
    value.players.every(validPlayer) &&
    new Set(value.players.map((player: Player) => player.id)).size === value.players.length &&
    Array.isArray(value.history) &&
    value.history.every(validSession) &&
    (value.session === null || validSession(value.session)) &&
    validSettings(value.settings)
  );
}

/** Remove obsolete preset data while adapting older v2 saves to the single-duration model. */
function normalizeAppData(value: unknown): AppData | null {
  if (!isAppData(value) || !isRecord(value.settings)) return null;
  const legacySettings = value.settings as Settings & { turnPresets?: unknown };
  const { turnPresets: _legacyPresets, ...storedSettings } = legacySettings;
  return {
    ...value,
    settings: {
      ...defaults.settings,
      ...storedSettings,
      alarmSound: storedSettings.alarmSound === "custom" ? "custom" : "builtin",
    },
  };
}

/** Parse an exported file without mutating browser storage. */
export function decodeBackup(raw: string): AppData {
  try {
    const value: unknown = JSON.parse(raw);
    const normalized = normalizeAppData(value);
    if (normalized) return normalized;
  } catch {
    /* Return a clear validation error below. */
  }
  throw new Error("Esse arquivo não é uma cópia válida do Minutes in Leonida.");
}

function migrateV1(value: unknown): AppData | null {
  if (
    !isRecord(value) ||
    value.version !== 1 ||
    !Array.isArray(value.players) ||
    !value.players.every(validPlayer) ||
    !Array.isArray(value.history) ||
    !value.history.every((entry) => {
      if (!isRecord(entry) || !Array.isArray(entry.players) || !Array.isArray(entry.turns))
        return false;
      return entry.players.every(validPlayer) && entry.turns.every(validTurn);
    })
  )
    return null;

  const adaptSession = (entry: unknown): Session | null => {
    if (!isRecord(entry) || !Array.isArray(entry.players) || !Array.isArray(entry.turns))
      return null;
    const candidate = {
      ...entry,
      turnDurationMs: DEFAULT_TURN_MINUTES * 60_000,
      turns: entry.turns.map((turn) => (isRecord(turn) ? { ...turn } : turn)),
    };
    return validSession(candidate) ? candidate : null;
  };
  const history = value.history.map(adaptSession);
  const session = value.session === null ? null : adaptSession(value.session);
  const oldSettings = isRecord(value.settings) ? value.settings : {};
  const migrated: AppData = {
    version: 2,
    players: value.players,
    history: history.filter((entry): entry is Session => entry !== null),
    session,
    settings: {
      alarm: typeof oldSettings.alarm === "boolean" ? oldSettings.alarm : defaults.settings.alarm,
      volume: isFiniteNumber(oldSettings.volume)
        ? Math.min(1, Math.max(0, oldSettings.volume))
        : defaults.settings.volume,
      vibration:
        typeof oldSettings.vibration === "boolean"
          ? oldSettings.vibration
          : defaults.settings.vibration,
      selectedTurnMinutes: DEFAULT_TURN_MINUTES,
      alarmSound: "builtin",
    },
  };
  if (session === null && value.session !== null) return null;
  return isAppData(migrated) ? migrated : null;
}

type StoredEnvelope = { revision: number; data: AppData };

function readValid(key: string): StoredEnvelope | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (isRecord(value) && Number.isInteger(value.revision)) {
      const data = normalizeAppData(value.data);
      if (data) return { revision: Number(value.revision), data };
    }
    // Accept unwrapped v2 data from early development builds.
    const data = normalizeAppData(value);
    return data ? { revision: 0, data } : null;
  } catch {
    return null;
  }
}

/** Load the newest valid copy, migrating the original v1 format in place. */
export function load(): LoadResult {
  try {
    const primary = readValid(PRIMARY_KEY);
    const backup = readValid(BACKUP_KEY);
    if (primary || backup) {
      const useBackup = !primary || (!!backup && backup.revision > primary.revision);
      const selected = useBackup ? backup! : primary!;
      if (useBackup) save(selected.data); // Repair the primary slot when storage permits.
      return {
        data: selected.data,
        recovered: useBackup,
        migrated: false,
        ...(useBackup ? { issue: "Uma cópia de segurança recuperou seus dados." } : {}),
      };
    }

    const rawLegacy = localStorage.getItem(LEGACY_KEY);
    if (rawLegacy) {
      const legacy: unknown = JSON.parse(rawLegacy);
      const migrated = migrateV1(legacy);
      if (migrated) {
        const result = save(migrated);
        return {
          data: migrated,
          recovered: false,
          migrated: true,
          ...(!result.ok
            ? {
                issue:
                  "Os dados antigos foram carregados, mas não foi possível gravar a nova cópia.",
              }
            : {}),
        };
      }
      return {
        data: defaults,
        recovered: false,
        migrated: false,
        issue:
          "Os dados salvos parecem inválidos. Uma cópia vazia foi aberta; os dados originais foram preservados.",
      };
    }
    const hasBrokenCopy =
      localStorage.getItem(PRIMARY_KEY) !== null || localStorage.getItem(BACKUP_KEY) !== null;
    return {
      data: defaults,
      recovered: false,
      migrated: false,
      ...(hasBrokenCopy
        ? {
            issue:
              "As cópias salvas não puderam ser validadas. Seus dados originais foram preservados.",
          }
        : {}),
    };
  } catch {
    return {
      data: defaults,
      recovered: false,
      migrated: false,
      issue: "O navegador bloqueou a leitura dos dados locais.",
    };
  }
}

/** Stamp both copies so recovery can select the newest valid state after a partial write. */
export function save(data: AppData): SaveResult {
  const primary = readValid(PRIMARY_KEY);
  const backup = readValid(BACKUP_KEY);
  const revision = Math.max(primary?.revision ?? 0, backup?.revision ?? 0) + 1;
  let serialized: string;
  try {
    serialized = JSON.stringify({ revision, data });
  } catch {
    return {
      ok: false,
      backupOk: false,
      issue: "Não foi possível preparar os dados para salvar.",
    };
  }
  let backupOk = false;
  let primaryOk = false;
  try {
    localStorage.setItem(BACKUP_KEY, serialized);
    backupOk = true;
  } catch {
    /* Keep trying the primary copy; one storage slot may still be writable. */
  }
  try {
    localStorage.setItem(PRIMARY_KEY, serialized);
    primaryOk = true;
  } catch {
    /* Report the failure to the UI instead of pretending the write succeeded. */
  }
  return {
    ok: primaryOk || backupOk,
    backupOk,
    ...(!primaryOk && !backupOk
      ? { issue: "Não foi possível salvar. Libere espaço no navegador ou exporte seus dados." }
      : !primaryOk
        ? { issue: "A cópia principal falhou; seus dados foram gravados apenas no backup." }
        : {}),
  };
}

export function clear(): SaveResult {
  let ok = true;
  try {
    localStorage.removeItem(PRIMARY_KEY);
  } catch {
    ok = false;
  }
  try {
    localStorage.removeItem(BACKUP_KEY);
  } catch {
    ok = false;
  }
  try {
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    ok = false;
  }
  return {
    ok,
    backupOk: ok,
    ...(!ok ? { issue: "Não foi possível apagar todas as cópias locais." } : {}),
  };
}

export function limitHistory(data: AppData): AppData {
  return { ...data, history: data.history.slice(0, MAX_HISTORY) };
}
