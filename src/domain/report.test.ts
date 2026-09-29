import { describe, expect, it } from "vitest";
import { advance, createSession, end, start, type Player } from "./game";
import { buildSessionReport } from "./report";

const players: Player[] = [
  { id: "a", name: "Ana", color: 0 },
  { id: "b", name: "Beto", color: 1 },
];

describe("session report", () => {
  it("builds a ranked Markdown scoreboard and a turn-by-turn recap", () => {
    const started = start(
      createSession(players, 0, 5, () => 0),
      1_000,
    );
    const firstPlayer = started.players[0];
    const secondPlayer = started.players[1];
    if (!firstPlayer || !secondPlayer) throw new Error("Expected two session players");

    const nextTurn = advance(started, "DEATH", 11_000);
    const completed = end(nextTurn, 41_000);
    const report = buildSessionReport(completed);

    expect(report).toContain("# Placar final — Minutes in Leonida");
    expect(report).toContain(
      "| Posição | Jogador | Tempo em jogo | Turnos | Mortes | Tempos esgotados |",
    );
    expect(report.indexOf(secondPlayer.name)).toBeLessThan(report.indexOf(firstPlayer.name));
    expect(report).toContain("| 1º | Ana");
    expect(report).toContain("| 2º | Beto");
    expect(report).toContain("Morte");
    expect(report).toContain("Sessão encerrada");
  });

  it("escapes Markdown table separators in player names", () => {
    const namedPlayers = [{ ...players[0]!, name: "Ana | Noite" }, players[1]!];
    const completed = end(
      start(
        createSession(namedPlayers, 0, 5, () => 0),
        1_000,
      ),
      2_000,
    );

    expect(buildSessionReport(completed)).toContain("Ana \\| Noite");
  });
});
