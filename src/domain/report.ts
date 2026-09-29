import { stats, type Session } from "./game";

const escapeTableCell = (value: string) => value.replaceAll("|", "\\|").replaceAll("\n", " ");

/** Build a portable Markdown scoreboard that can also be printed to PDF. */
export function buildSessionReport(session: Session, locale: "pt" | "en" | "es" = "pt"): string {
  const text = {
    pt: {
      date: "Data",
      length: "Duração da sessão",
      turnLength: "Duração de cada turno",
      ranking: "Classificação por tempo em jogo",
      player: "Jogador",
      time: "Tempo em jogo",
      turns: "Turnos",
      deaths: "Mortes",
      timeouts: "Tempos esgotados",
      position: "Posição",
      timeline: "Turnos da sessão",
      result: "Resultado",
      played: "Tempo jogado",
      removed: "Jogador removido",
      death: "Morte",
      timeout: "Tempo esgotado",
      ended: "Sessão encerrada",
      note: "O placar ordena os jogadores pelo tempo total em jogo; em caso de empate, vence quem teve menos mortes.",
      title: "Placar final — Minutes in Leonida",
    },
    en: {
      date: "Date",
      length: "Session duration",
      turnLength: "Turn length",
      ranking: "Ranking by time played",
      player: "Player",
      time: "Time played",
      turns: "Turns",
      deaths: "Deaths",
      timeouts: "Timeouts",
      position: "Rank",
      timeline: "Session turns",
      result: "Result",
      played: "Time played",
      removed: "Player removed",
      death: "Death",
      timeout: "Time expired",
      ended: "Session ended",
      note: "Players are ranked by total time played. Ties go to the player with fewer deaths.",
      title: "Final score — Minutes in Leonida",
    },
    es: {
      date: "Fecha",
      length: "Duración de la sesión",
      turnLength: "Duración del turno",
      ranking: "Clasificación por tiempo de juego",
      player: "Jugador",
      time: "Tiempo de juego",
      turns: "Turnos",
      deaths: "Muertes",
      timeouts: "Tiempo agotado",
      position: "Puesto",
      timeline: "Turnos de la sesión",
      result: "Resultado",
      played: "Tiempo jugado",
      removed: "Jugador eliminado",
      death: "Muerte",
      timeout: "Tiempo agotado",
      ended: "Sesión terminada",
      note: "Los jugadores se ordenan por tiempo total de juego. En caso de empate, gana quien tenga menos muertes.",
      title: "Marcador final — Minutes in Leonida",
    },
  }[locale];
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(Math.max(0, ms) / 60_000);
    const seconds = String(Math.floor(Math.max(0, ms) / 1_000) % 60).padStart(2, "0");
    return locale === "pt"
      ? `${minutes}min ${seconds}s`
      : locale === "en"
        ? `${minutes}m ${seconds}s`
        : `${minutes}min ${seconds}s`;
  };
  const records = stats(session).sort(
    (first, second) =>
      second.totalMs - first.totalMs ||
      first.deaths - second.deaths ||
      first.player.name.localeCompare(second.player.name, locale === "pt" ? "pt-BR" : locale),
  );
  const startAt = session.startedAt ?? session.createdAt;
  const endAt = session.endedAt ?? session.turns.at(-1)?.endedAt ?? startAt;
  const totalDuration = Math.max(0, endAt - startAt);
  const playerName = (id: string) =>
    escapeTableCell(session.players.find((player) => player.id === id)?.name ?? text.removed);
  const reasonLabel = (reason: string | undefined) =>
    reason === "DEATH" ? text.death : reason === "TIMEOUT" ? text.timeout : text.ended;
  const localeTag = locale === "pt" ? "pt-BR" : locale === "es" ? "es-ES" : "en-US";

  return [
    `# ${text.title}`,
    "",
    `- **${text.date}:** ${new Date(endAt).toLocaleString(localeTag)}`,
    `- **${text.length}:** ${formatDuration(totalDuration)}`,
    `- **${text.turnLength}:** ${Math.round(session.turnDurationMs / 60_000)} min`,
    "",
    `## ${text.ranking}`,
    "",
    `| ${text.position} | ${text.player} | ${text.time} | ${text.turns} | ${text.deaths} | ${text.timeouts} |`,
    "| ---: | :--- | ---: | ---: | ---: | ---: |",
    ...records.map(
      (record, index) =>
        `| ${locale === "pt" ? `${index + 1}º` : index + 1} | ${escapeTableCell(record.player.name)} | ${formatDuration(record.totalMs)} | ${record.turns} | ${record.deaths} | ${record.timeouts} |`,
    ),
    "",
    `## ${text.timeline}`,
    "",
    `| ${text.turns.slice(0, -1)} | ${text.player} | ${text.result} | ${text.played} |`,
    "| ---: | :--- | :--- | ---: |",
    ...session.turns.map(
      (turn) =>
        `| ${turn.sequence} | ${playerName(turn.playerId)} | ${reasonLabel(turn.endReason)} | ${formatDuration(turn.activeDurationMs ?? 0)} |`,
    ),
    "",
    `_${text.note}_`,
    "",
  ].join("\n");
}
