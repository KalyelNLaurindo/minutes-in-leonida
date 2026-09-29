import { afterEach, describe, expect, it, vi } from "vitest";
import { advance, createSession, defaults, start, type AppData, type Player } from "./game";
import { decodeBackup, isAppData, load, save } from "./storage";

/** Small Storage-compatible double keeps repository tests independent from a browser. */
class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  failWrites = false;

  get length() {
    return this.values.size;
  }
  clear() {
    this.values.clear();
  }
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  setItem(key: string, value: string) {
    if (this.failWrites) throw new Error("Storage quota exceeded");
    this.values.set(key, String(value));
  }
}

const storage = new MemoryStorage();
const players: Player[] = [
  { id: "ana", name: "Ana", color: 0 },
  { id: "beto", name: "Beto", color: 1 },
];

function sampleData(): AppData {
  const session = start(
    createSession(players, 1_000, 12, () => 0),
    2_000,
  );
  return { ...defaults, players, session };
}

afterEach(() => {
  storage.clear();
  storage.failWrites = false;
  vi.unstubAllGlobals();
  vi.stubGlobal("localStorage", storage);
});

describe("versioned local repository", () => {
  it("writes a versioned primary copy and a redundant backup", () => {
    vi.stubGlobal("localStorage", storage);
    const result = save(sampleData());
    expect(result).toEqual({ ok: true, backupOk: true });
    expect(storage.getItem("minutes-in-leonida:v2")).toBeTruthy();
    expect(storage.getItem("minutes-in-leonida:backup:v2")).toBeTruthy();
    expect(load().data.session?.turnDurationMs).toBe(12 * 60_000);
  });

  it("recovers the newest valid backup and repairs the primary slot", () => {
    vi.stubGlobal("localStorage", storage);
    const older = { revision: 1, data: defaults };
    const newer = { revision: 2, data: sampleData() };
    storage.setItem("minutes-in-leonida:v2", JSON.stringify(older));
    storage.setItem("minutes-in-leonida:backup:v2", JSON.stringify(newer));

    const result = load();

    expect(result.recovered).toBe(true);
    expect(result.data.session?.turnDurationMs).toBe(12 * 60_000);
    expect(JSON.parse(storage.getItem("minutes-in-leonida:v2")!).revision).toBe(3);
  });

  it("migrates valid v1 sessions to the default duration and saves v2 copies", () => {
    vi.stubGlobal("localStorage", storage);
    const oldSession = createSession(players, 100, () => 0);
    const legacy = {
      version: 1,
      players,
      history: [],
      session: oldSession,
      settings: { alarm: false, volume: 0.5, vibration: true },
    };
    storage.setItem("minutes-in-leonida:v1", JSON.stringify(legacy));

    const result = load();

    expect(result.migrated).toBe(true);
    expect(result.data.session?.turnDurationMs).toBe(20 * 60_000);
    expect(storage.getItem("minutes-in-leonida:v2")).toBeTruthy();
  });

  it("reports a write failure without throwing when browser storage is full", () => {
    vi.stubGlobal("localStorage", storage);
    storage.failWrites = true;
    expect(save(sampleData())).toMatchObject({ ok: false, backupOk: false });
    expect(load().issue).toBeUndefined();
  });

  it("validates imported JSON before it reaches application state", () => {
    const data = sampleData();
    expect(isAppData(data)).toBe(true);
    expect(decodeBackup(JSON.stringify(data))).toEqual(data);
    expect(() => decodeBackup('{"version":2}')).toThrow("cópia válida");
  });

  it("persists a complete play flow with the chosen custom duration", () => {
    vi.stubGlobal("localStorage", storage);
    const first = start(
      createSession(players, 0, 5, () => 0),
      100,
    );
    const afterDeath = advance(first, "DEATH", 3_100);
    const complete = { ...defaults, players, session: afterDeath };
    expect(save(complete).ok).toBe(true);
    const restored = load().data.session;
    expect(restored?.turnDurationMs).toBe(5 * 60_000);
    expect(restored?.turns[0]?.activeDurationMs).toBe(3_000);
    expect(restored?.index).toBe(1);
  });
});
