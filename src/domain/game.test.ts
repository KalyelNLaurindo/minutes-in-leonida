import { describe, expect, it } from "vitest";
import {
  advance,
  createSession,
  defaults,
  end,
  pause,
  remaining,
  resume,
  removeHistorySession,
  shuffle,
  start,
  suspend,
  stats,
  TURN_DURATION_MS,
  type Player,
} from "./game";
const players: Player[] = ["Ana", "Bruno", "Carlos", "Dani"].map((name, color) => ({
  id: name,
  name,
  color,
}));
const getPlayer = (index: number): Player => {
  const player = players[index];
  if (!player) throw Error("Missing test player");
  return player;
};
const getTurn = (turns: ReturnType<typeof start>["turns"], index: number) => {
  const turn = turns[index];
  if (!turn) throw Error("Missing test turn");
  return turn;
};
const ordered = (count: number) => createSession(players.slice(0, count), 0, 20, () => 0);
describe("game rules", () => {
  it("rejects invalid participant counts and repeated names", () => {
    expect(() => ordered(1)).toThrow();
    expect(() => createSession([...players, ...players.slice(0, 1)], 0)).toThrow();
    expect(() => createSession([getPlayer(0), { ...getPlayer(1), name: "ana" }], 0)).toThrow();
  });
  it("shuffles without losing anyone", () =>
    expect(
      shuffle(players, () => 0)
        .map((p) => p.id)
        .sort(),
    ).toEqual(players.map((p) => p.id).sort()));
  it("starts at twenty minutes and rotates circularly for two and four", () => {
    for (const n of [2, 4]) {
      let s = start(ordered(n), 1000);
      expect(remaining(s, 1000)).toBe(TURN_DURATION_MS);
      for (let i = 0; i < n; i++) s = advance(s, "DEATH", 2000 + i);
      expect(s.index).toBe(0);
      expect(s.turns.length).toBe(n + 1);
    }
  });
  it("keeps the turn sequence and per-player counters consistent for ten players", () => {
    const roster = Array.from({ length: 10 }, (_, index) => ({
      id: `player-${index}`,
      name: `Player ${index}`,
      color: index % 4,
    }));
    let session = start(
      createSession(roster, 0, 1, () => 0),
      100,
    );

    for (let turn = 0; turn < 10; turn += 1) {
      session = advance(session, "DEATH", 200 + turn);
    }

    expect(session.index).toBe(0);
    expect(session.turns.map((turn) => turn.sequence)).toEqual(
      Array.from({ length: 11 }, (_, index) => index + 1),
    );
    const completed = end(session, 300);
    const totals = stats(completed);
    expect(totals.reduce((sum, player) => sum + player.turns, 0)).toBe(11);
    expect(totals.reduce((sum, player) => sum + player.deaths, 0)).toBe(10);
  });
  it("records death duration and starts the next turn immediately", () => {
    const s = start(ordered(2), 100);
    const next = advance(s, "DEATH", 5100);
    expect(getTurn(next.turns, 0).activeDurationMs).toBe(5000);
    expect(getTurn(next.turns, 0).endReason).toBe("DEATH");
    expect(getTurn(next.turns, 1).startedAt).toBe(5100);
    expect(remaining(next, 5100)).toBe(TURN_DURATION_MS);
  });
  it("handles timeout once and rejects stale turn identities", () => {
    const s = start(ordered(2), 100);
    const id = getTurn(s.turns, 0).id;
    const next = advance(s, "TIMEOUT", 100 + TURN_DURATION_MS, id);
    expect(getTurn(next.turns, 0).activeDurationMs).toBe(TURN_DURATION_MS);
    expect(advance(next, "TIMEOUT", 2000000, id)).toBe(next);
  });
  it("freezes time while paused and resumes without resetting", () => {
    const s = pause(start(ordered(2), 100), 5100);
    expect(remaining(s, 500000)).toBe(TURN_DURATION_MS - 5000);
    expect(() => pause(s, 1000)).toThrow();
    const resumed = resume(s, 600000);
    expect(remaining(resumed, 603000)).toBe(TURN_DURATION_MS - 8000);
    expect(() => resume(resumed, 700000)).toThrow();
  });
  it("suspends a session for Home and resumes its saved remaining time", () => {
    const suspended = suspend(start(ordered(2), 100), 5_100);
    expect(suspended.status).toBe("SUSPENDED");
    expect(remaining(suspended, 500_000)).toBe(TURN_DURATION_MS - 5_000);
    const resumed = resume(suspended, 600_000);
    expect(resumed.status).toBe("ACTIVE");
    expect(remaining(resumed, 603_000)).toBe(TURN_DURATION_MS - 8_000);
    expect(end(suspended, 900_000).status).toBe("ENDED");
    expect(() => suspend(ordered(2), 1_000)).toThrow();
  });
  it("reconciles active time on reopening", () => {
    const s = start(ordered(2), 100);
    expect(remaining(s, 100 + TURN_DURATION_MS + 1)).toBe(0);
  });
  it("ends a paused session and derives statistics", () => {
    const s = pause(advance(start(ordered(2), 100), "DEATH", 5100), 8100);
    const done = end(s, 900000);
    expect(getTurn(done.turns, 1).activeDurationMs).toBe(3000);
    expect(stats(done).reduce((n, r) => n + r.deaths, 0)).toBe(1);
    expect(stats(done).reduce((n, r) => n + r.totalMs, 0)).toBe(8000);
  });
  it("deletes only the selected session from the local history state", () => {
    const first = ordered(2);
    const second = ordered(3);
    const data = { ...defaults, history: [first, second] };
    const updated = removeHistorySession(data, first.id);

    expect(updated.history.map((session) => session.id)).toEqual([second.id]);
    expect(data.history).toHaveLength(2);
  });
});
