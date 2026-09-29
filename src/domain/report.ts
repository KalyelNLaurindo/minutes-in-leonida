import { durationText, stats, type Session } from "./game";

const escapeTableCell = (value: string) => value.replaceAll("|", "\\|").replaceAll("\n", " ");

/** Build a portable Markdown scoreboard that can also be printed to PDF. */
export function buildSessionReport(session: Session): string {
  const records = stats(session).sort(
    (first, second) =>
      second.totalMs - first.totalMs ||
      first.deaths - second.deaths ||
      first.player.name.localeCompare(second.player.name, "pt-BR"),
  );
  const startAt = session.startedAt ?? session.createdAt;
  const endAt = session.endedAt ?? session.turns.at(-1)?.endedAt ?? startAt;
  const totalDuration = Math.max(0, endAt - startAt);
  const playerName = (id: string) =>
    escapeTableCell(session.players.find((player) => player.id === id)?.name ?? "Jogador removido");
  const reasonLabel = (reason: string | undefined) =>
    reason === "DEATH" ? "Morte" : reason === "TIMEOUT" ? "Tempo esgotado" : "Sessão encerrada";

  return [
    "# Placar final — Minutes in Leonida",
    "",
    `- **Data:** ${new Date(endAt).toLocaleString("pt-BR")}`,
    `- **Duração da sessão:** ${durationText(totalDuration)}`,
    `- **Duração de cada turno:** ${Math.round(session.turnDurationMs / 60_000)} min`,
    "",
    "## Classificação por tempo em jogo",
    "",
    "| Posição | Jogador | Tempo em jogo | Turnos | Mortes | Tempos esgotados |",
    "| ---: | :--- | ---: | ---: | ---: | ---: |",
    ...records.map(
      (record, index) =>
        `| ${index + 1}º | ${escapeTableCell(record.player.name)} | ${durationText(record.totalMs)} | ${record.turns} | ${record.deaths} | ${record.timeouts} |`,
    ),
    "",
    "## Turnos da sessão",
    "",
    "| Turno | Jogador | Resultado | Tempo jogado |",
    "| ---: | :--- | :--- | ---: |",
    ...session.turns.map(
      (turn) =>
        `| ${turn.sequence} | ${playerName(turn.playerId)} | ${reasonLabel(turn.endReason)} | ${durationText(turn.activeDurationMs ?? 0)} |`,
    ),
    "",
    "_O placar ordena os jogadores pelo tempo total em jogo; em caso de empate, vence quem teve menos mortes._",
    "",
  ].join("\n");
}
