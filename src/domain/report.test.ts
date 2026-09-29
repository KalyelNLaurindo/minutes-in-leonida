import { describe, expect, it } from "vitest";
import { advance, createSession, end, start, type Player } from "./game";
import { buildSessionReport, buildSessionReportFilename } from "./report";

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
    expect(report).toContain("| Pos. | Jogador | Tempo no controle | Fatia do tempo |");
    expect(report).toContain("MINUTES IN LEONIDA  //  SESSION SCORECARD");
    expect(report).toContain("[#");
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

  it("exports the selected language for English and Spanish", () => {
    const completed = end(
      start(
        createSession(players, 0, 5, () => 0),
        1_000,
      ),
      2_000,
    );

    expect(buildSessionReport(completed, "en")).toContain("# Final score");
    expect(buildSessionReport(completed, "es")).toContain("# Marcador final");
  });

  it("creates a readable, unique Markdown filename using the date and players", () => {
    const completed = end(
      start(
        createSession([{ ...players[0]!, name: "Ana Noite" }, players[1]!], 0, 5, () => 0),
        1_000,
      ),
      2_000,
    );

    const filename = buildSessionReportFilename(completed);
    expect(filename).toMatch(/^minutes-in-leonida-placar-\d{8}-.*-1-turnos-[a-f0-9]{8}\.md$/);
    expect(buildSessionReportFilename(completed, "en")).toMatch(/-score-.*-1-turns-/);
    expect(buildSessionReportFilename(completed, "es")).toContain("-marcador-");
  });
});
